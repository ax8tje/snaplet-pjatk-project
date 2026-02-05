import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const provider = new GoogleAuthProvider();
provider.addScope("profile");
provider.addScope("email");

const ensureUserProfile = async (user: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}) => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: new Date(),
    });
  }
};

export const signInWithGoogle = async () => {
  console.log('[GoogleAuth] Starting signInWithPopup...');
  try {
    const result = await signInWithPopup(auth, provider);
    console.log('[GoogleAuth] signInWithPopup successful, user:', result.user.email);
    await ensureUserProfile(result.user);
    console.log('[GoogleAuth] User profile ensured');
    return result.user;
  } catch (error: any) {
    console.error('[GoogleAuth] signInWithPopup error:', error);
    console.error('[GoogleAuth] Error code:', error?.code);
    console.error('[GoogleAuth] Error message:', error?.message);
    throw error;
  }
};
