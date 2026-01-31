const fs = require('fs');
const path = require('path');
const {
    initializeTestEnvironment,
    assertSucceeds,
    assertFails
} = require('@firebase/rules-unit-testing');

let testEnv;

beforeAll(async () => {
    const rules = fs.readFileSync(path.resolve(__dirname, '../../../firestore.rules'), 'utf8');
    // Using emulators:exec to run tests, so initializeTestEnvironment will connect to the running emulator
    testEnv = await initializeTestEnvironment({
        projectId: 'snaplet-pjatk-project-test',
        firestore: { rules }
    });
});

afterAll(async () => {
    await testEnv.cleanup();
});

afterEach(async () => {
    await testEnv.clearFirestore();
});

test('owner może utworzyć clip z poprawnymi danymi', async () => {
    const alice = testEnv.authenticatedContext('alice-uid');
    const db = alice.firestore();
    const clipId = 'alice-uid_2026-01-30';
    const ref = db.doc(`clips/${clipId}`);

    const data = {
        id: clipId,
        userId: 'alice-uid',                 // must match authenticatedContext uid
        date: '2026-01-30',                  // YYYY-MM-DD
        videoUrl: 'https://example.com/v.webm',
        thumbnailUrl: 'https://example.com/t.jpg',
        duration: 2000,                      // ms (optional)
        month: '2026-01',                    // YYYY-MM
        status: 'ready'                     // 'ready' | 'processing' | 'error'
    };

    await assertSucceeds(ref.set(data));
});

test('inny user nie może utworzyć clip z userId innego właściciela', async () => {
    const bob = testEnv.authenticatedContext('bob-uid');
    const db = bob.firestore();
    const clipId = 'alice-uid_2026-01-30';
    const ref = db.doc(`clips/${clipId}`);
    const data = {
        id: clipId,
        userId: 'alice-uid', // trying to create a doc claiming to be alice
        date: '2026-01-30',
        videoUrl: 'https://example.com/v.webm',
        thumbnailUrl: 'https://example.com/t.jpg',
        month: '2026-01',
        status: 'ready'
    };

    await assertFails(ref.set(data));
});

test('owner może zaktualizować status ale nie może zmienić userId', async () => {
    const alice = testEnv.authenticatedContext('alice-uid');
    const db = alice.firestore();
    const clipId = 'alice-uid_2026-01-30';
    const ref = db.doc(`clips/${clipId}`);

    // create initial doc as owner
    await assertSucceeds(ref.set({
        id: clipId,
        userId: 'alice-uid',
        date: '2026-01-30',
        videoUrl: 'https://example.com/v.webm',
        thumbnailUrl: 'https://example.com/t.jpg',
        month: '2026-01',
        status: 'processing'
    }));

    // updating allowed field 'status' should succeed
    await assertSucceeds(ref.update({ status: 'ready' }));

    // changing immutable field 'userId' should fail
    await assertFails(ref.update({ userId: 'hacker-uid' }));
});

test('walidacja statusu: niepoprawna wartość odrzucona', async () => {
    const alice = testEnv.authenticatedContext('alice-uid');
    const db = alice.firestore();
    const clipId = 'alice-uid_2026-01-30';
    const ref = db.doc(`clips/${clipId}`);
    const data = {
        id: clipId,
        userId: 'alice-uid',
        date: '2026-01-30',
        videoUrl: 'https://example.com/v.webm',
        thumbnailUrl: 'https://example.com/t.jpg',
        month: '2026-01',
        status: 'invalid-status' // not permitted by rules
    };

    await assertFails(ref.set(data));
});