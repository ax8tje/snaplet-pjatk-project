const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'snaplet-byt';

let testEnv;

before(async () => {
    const rules = fs.readFileSync(path.resolve(__dirname, '..', 'firestore.rules'), 'utf8');

    // Prefer FIRESTORE_EMULATOR_HOST if set; otherwise connect in-process (rules-only)
    const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
    const [host, portStr] = emulatorHost.split(':');
    const port = Number(portStr || 8080);

    testEnv = await initializeTestEnvironment({
        projectId: PROJECT_ID,
        firestore: { rules, host, port }
    });
});

after(async () => {
    if (testEnv) {
        await testEnv.cleanup();
    }
});

describe('Firestore security rules - extended', () => {
    it('allows post owner to create, update caption, and prevents non-owner updates/deletes', async () => {
        const owner = testEnv.authenticatedContext('owner', { email: 'owner@example.com' });
        const other = testEnv.authenticatedContext('other', { email: 'other@example.com' });

        const ownerDb = owner.firestore();
        const otherDb = other.firestore();
        const postRef = ownerDb.collection('posts').doc('post-owner-1');

        // Owner creates post
        await assertSucceeds(postRef.set({
            userId: 'owner',
            imageUrl: 'https://example.com/img.png',
            thumbnailUrl: 'https://example.com/thumb.png',
            caption: 'initial',
            createdAt: new Date(),
            likes: 0,
            commentCount: 0
        }));

        // Owner updates caption (should succeed)
        await assertSucceeds(postRef.update({ caption: 'updated caption' }));

        // Other attempts to update caption (should fail)
        await assertFails(otherDb.collection('posts').doc('post-owner-1').update({ caption: 'hacked' }));

        // Attempt to change userId on update (should fail even by owner if changes userId)
        await assertFails(postRef.update({ userId: 'attacker' }));

        // Other attempts to delete (should fail)
        await assertFails(otherDb.collection('posts').doc('post-owner-1').delete());

        // Owner deletes (should succeed)
        await assertSucceeds(postRef.delete());
    });

    it('comments: create by author allowed; delete only by author', async () => {
        const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
        const bob = testEnv.authenticatedContext('bob', { email: 'bob@example.com' });

        const aliceDb = alice.firestore();
        const bobDb = bob.firestore();
        const postRef = aliceDb.collection('posts').doc('post-for-comments');

        // Create a post by alice so comments reference an existing post (optional for rules but realistic)
        await assertSucceeds(postRef.set({
            userId: 'alice',
            imageUrl: 'x',
            thumbnailUrl: 'x',
            caption: 'for comments',
            createdAt: new Date(),
            likes: 0,
            commentCount: 0
        }));

        // Alice creates a comment
        const commentRef = aliceDb.collection('comments').doc('comment-1');
        await assertSucceeds(commentRef.set({
            postId: 'post-for-comments',
            userId: 'alice',
            text: 'Nice!',
            createdAt: new Date()
        }));

        // Bob tries to delete Alice's comment (should fail)
        await assertFails(bobDb.collection('comments').doc('comment-1').delete());

        // Alice deletes her comment (should succeed)
        await assertSucceeds(commentRef.delete());
    });

    it('likes: create/delete only by owner', async () => {
        const carol = testEnv.authenticatedContext('carol', { email: 'carol@example.com' });
        const dave = testEnv.authenticatedContext('dave', { email: 'dave@example.com' });

        const carolDb = carol.firestore();
        const daveDb = dave.firestore();

        // Carol creates a like for post 'post-like-1'
        const likeRef = carolDb.collection('likes').doc('like-carol-1');
        await assertSucceeds(likeRef.set({
            postId: 'post-like-1',
            userId: 'carol',
            createdAt: new Date()
        }));

        // Dave tries to create a like using carol's userId (should fail)
        await assertFails(daveDb.collection('likes').doc('like-impostor').set({
            postId: 'post-like-1',
            userId: 'carol', // does not match dave's auth.uid
            createdAt: new Date()
        }));

        // Dave tries to delete Carol's like (should fail)
        await assertFails(daveDb.collection('likes').doc('like-carol-1').delete());

        // Carol deletes her like (should succeed)
        await assertSucceeds(likeRef.delete());
    });

    it('messages: sender can create; sender and receiver can read; others cannot', async () => {
        const sender = testEnv.authenticatedContext('sender', { email: 'sender@example.com' });
        const receiver = testEnv.authenticatedContext('receiver', { email: 'receiver@example.com' });
        const stranger = testEnv.authenticatedContext('stranger', { email: 'stranger@example.com' });

        const senderDb = sender.firestore();
        const receiverDb = receiver.firestore();
        const strangerDb = stranger.firestore();

        const msgRef = senderDb.collection('messages').doc('msg-1');

        // Sender creates message
        await assertSucceeds(msgRef.set({
            senderId: 'sender',
            receiverId: 'receiver',
            text: 'Hello receiver',
            createdAt: new Date(),
            read: false
        }));

        // Sender can read the message
        await assertSucceeds(senderDb.collection('messages').doc('msg-1').get());

        // Receiver can read the message
        await assertSucceeds(receiverDb.collection('messages').doc('msg-1').get());

        // Stranger cannot read the message
        await assertFails(strangerDb.collection('messages').doc('msg-1').get());

        // Receiver updates read flag (allowed by rules since receiver is a participant)
        await assertSucceeds(receiverDb.collection('messages').doc('msg-1').update({ read: true }));

        // Stranger cannot update or delete
        await assertFails(strangerDb.collection('messages').doc('msg-1').update({ text: 'bad' }));
        await assertFails(strangerDb.collection('messages').doc('msg-1').delete());

        // Sender or receiver can delete (test sender deletes)
        await assertSucceeds(senderDb.collection('messages').doc('msg-1').delete());
    });

    it('prevent creating resources with mismatched auth.uid in writing userId fields', async () => {
        const frank = testEnv.authenticatedContext('frank', { email: 'frank@example.com' });
        const frankDb = frank.firestore();

        // Try to create user doc for another user (should fail)
        await assertFails(frankDb.collection('users').doc('someoneelse').set({
            email: 'someoneelse@example.com',
            displayName: 'Someone Else',
            createdAt: new Date()
        }));

        // Try to create a post where userId does not match auth.uid (should fail)
        await assertFails(frankDb.collection('posts').doc('post-bad-userid').set({
            userId: 'not-frank',
            imageUrl: 'x',
            thumbnailUrl: 'x',
            caption: 'oops',
            createdAt: new Date()
        }));
    });
});