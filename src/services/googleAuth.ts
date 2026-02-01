import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();

  provider.addScope("profile");
  provider.addScope("email");

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // sprawdzamy czy user istnieje w Firestore
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date()
      });
    }

    return user;

  } catch (error: any) {
    console.log("Google Sign In Error:", error);

    if (error.code === "auth/popup-closed-by-user") {
      alert("Logowanie anulowane");
    } else {
      alert("Błąd logowania Google");
    }

    throw error;
  }
};
