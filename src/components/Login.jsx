/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState, useEffect, Fragment } from "react";
import { auth, firebaseApp, db } from "../firebaseconfig";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  setDoc,
} from "firebase/firestore/lite";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import "firebase/compat/auth";
import { Dialog, Transition } from "@headlessui/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const provider = new GoogleAuthProvider();

function LoadingButton() {
  return (
    <button
      type="button"
      className="bg-blue-500 text-white font-bold py-2 px-4 rounded flex items-center disabled:opacity-75"
      disabled
    >
      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      Loading...
    </button>
  );
}

function UserProfile({ user }) {
  return (
    <div className="flex flex-col items-center gap-y-2">
      <p>Welcome, {user.displayName}!</p>
      <a href="profile" className="text-blue-600">
        Go to profile
      </a>
    </div>
  );
}

function GoogleSignInButton({ onLogin }) {
  return (
    <button
      onClick={onLogin}
      type="button"
      className="text-white w-full bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-between mr-2 mb-2"
    >
      <svg
        className="mr-2 -ml-1 w-4 h-4"
        aria-hidden="true"
        focusable="false"
        data-prefix="fab"
        data-icon="google"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 488 512"
      >
        <path
          fill="currentColor"
          d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
        ></path>
      </svg>
      Sign up with Google
      <div></div>
    </button>
  );
}

export function Login() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoginSuccess = async (user) => {
    setUser(user);
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        id: user.uid,
        displayName: user.displayName,
        email: user.email,
      });
      console.log("User profile created:", user.uid);
    }
  };

  const handleGoogleLogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => handleLoginSuccess(result.user))
      .catch((error) => {
        console.error("Google sign-in error:", error);
        toast.error(`Error during Google sign-in: ${error.message}`);
      });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <div>
      <ToastContainer />
      <div className="mt-10 flex items-center justify-center gap-x-6">
        {isLoading ? (
          <LoadingButton />
        ) : user ? (
          <UserProfile user={user} />
        ) : (
          <GoogleSignInButton onLogin={handleGoogleLogin} />
        )}
      </div>
    </div>
  );
}
