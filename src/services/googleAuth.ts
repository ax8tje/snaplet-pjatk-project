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
  const result = await signInWithPopup(auth, provider);
  await ensureUserProfile(result.user);
  return result.user;
};
