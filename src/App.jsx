/* eslint-disable no-unused-vars */
import { useState } from "react";
import "./App.css";
import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { auth, firebaseApp } from "./firebaseconfig";
import { getFirestore, collection, getDocs } from "firebase/firestore/lite";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import "firebase/compat/auth";
import { Login } from "./components/Login";
import Header from "./components/Header";

function App() {
  return (
    <div className="bg-white h-screen">
      <Header />
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-16 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              FastIQ GenAI
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              ... is a platform that allows you to create and manage your own AI
            </p>

            <div className="mt-10 flex items-center justify-center">
              <a
                href="playground"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Playground
              </a>
            </div>
            <Login />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
