import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase"; // Twój lokalny firebase.ts


export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

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

    return user;

  } catch (error: any) {
    console.log("Google Sign In Error:", error);

    // lepsze alerty w przeglądarce
    if (error.code === "auth/popup-closed-by-user") {
      await alert("Logowanie anulowane");
    } else {
      await alert("Błąd logowania Google");
    }

    throw error;
  }
};
