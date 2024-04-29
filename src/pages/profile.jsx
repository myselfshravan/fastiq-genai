/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, Fragment, useRef } from "react";
import {
  EnvelopeIcon,
  BanknotesIcon,
  CheckBadgeIcon,
  CircleStackIcon,
  ExclamationTriangleIcon,
  UserIcon,
  PhoneIcon,
} from "@heroicons/react/24/solid";
import { Dialog, Transition } from "@headlessui/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { db, auth } from "../firebaseconfig";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore/lite";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import Header from "../components/Header";

const dummy_user = {
  uid: "123456789",
  displayName: "Shravan",
  email: "shravanrevanna158@gmail.com",
  phoneNumber: "1234567890",
  grokapi: "123456789",
  openaiapi: "123456789",
  anyscaleapi: "123456789",
  togetheraiapi: "123456789",
};

function ApiKeyEditor({
  label,
  apiKey,
  isEditing,
  setEditing,
  tempApiKey,
  setTempApiKey,
  handleSave,
}) {
  const formatApiKeyDisplay = (apiKey) => {
    if (!apiKey) return "N/A";
    return `.....${apiKey.slice(-6)}`; // Adjust the slice number to change the number of displayed characters
  };

  return (
    <div className="flex items-center justify-between flex-col md:flex-row">
      <label
        htmlFor={`${label.toLowerCase()}API`}
        className="block text-sm font-semibold text-gray-700 mb-2 md:mr-2"
      >
        {label} API Key:
      </label>
      <div className="flex items-center gap-4">
        {isEditing ? (
          <input
            type="text"
            id={`${label.toLowerCase()}API`}
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            className="mt-1 block w-full rounded py-1 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        ) : (
          <p className="text-gray-700 bg-white rounded-md px-1">
            {formatApiKeyDisplay(apiKey)}
          </p>
        )}
        <div className="flex">
          <button
            onClick={() => {
              setEditing(!isEditing);
              if (!isEditing) setTempApiKey(apiKey); // Set tempApiKey only when starting to edit
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded-md transition duration-150 ease-in-out flex items-center justify-center mr-2"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
          {isEditing && (
            <button
              onClick={() => handleSave(label.toLowerCase(), tempApiKey)}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-3 rounded-md transition duration-150 ease-in-out flex items-center justify-center"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function UserProfile({
  apiKeys,
  setApiKeys,
  isEditing,
  setIsEditing,
  handleSaveAPI,
}) {
  return (
    <div className="flex items-center justify-center flex-col mt-4 w-full max-w-sm">
      <h3 className="text-lg font-semibold mb-4">API Keys for Providers:</h3>
      <div className="space-y-4">
        {Object.entries(apiKeys).map(([key, value]) => (
          <ApiKeyEditor
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            apiKey={value}
            isEditing={isEditing[key]}
            setEditing={(edit) => setIsEditing({ ...isEditing, [key]: edit })}
            tempApiKey={apiKeys[key]}
            setTempApiKey={(newValue) =>
              setApiKeys({ ...apiKeys, [key]: newValue })
            }
            handleSave={handleSaveAPI}
          />
        ))}
      </div>
    </div>
  );
}

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [apiKeys, setApiKeys] = useState({
    grok: "",
    openai: "",
    anyscale: "",
    togetherai: "",
  });
  const [isEditing, setIsEditing] = useState({
    grok: false,
    openai: false,
    anyscale: false,
    togetherai: false,
  });
  const navigate = useNavigate();

  const handleLogout = async () => {
    const isConfirmed = window.confirm("Are you sure you want to logout?");
    if (isConfirmed) {
      await auth.signOut();
      navigate("/");
    }
  };

  const handleSaveAPI = async (provider, apiKey) => {
    try {
      const updatedData = { [`${provider}api`]: apiKey };
      await updateDoc(doc(db, "users", user.uid), updatedData);
      toast.success(`${provider} API key saved successfully!`);
      setIsEditing((prev) => ({ ...prev, [provider]: false }));
    } catch (error) {
      console.error(`Error saving ${provider} API key: `, error);
      toast.error(`Error saving ${provider} API key: ${error.message}`);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, "users", currentUser.uid);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setUserData(userData);
          setApiKeys({
            grok: userData.grokapi || "",
            openai: userData.openaiapi || "",
            anyscale: userData.anyscaleapi || "",
            togetherai: userData.togetheraiapi || "",
          });
        } else {
          console.log("No user data found");
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="bg-white h-screen">
      <Header />
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-10 pt-14">
          Profile
        </h1>
        <ToastContainer
          position="top-center"
          autoClose="5000"
          theme="light"
          transition:Bounce
        />
        {isLoading ? (
          <Loading />
        ) : user ? (
          <div className="items-center justify-center flex-col flex max-w-3xl w-full">
            <div className="bg-blue-100 rounded-lg shadow-lg px-1 py-4 w-full flex flex-col items-center">
              <img
                src={user.photoURL || "default-profile-pic-url"}
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto shadow-lg border-gray-300 mt-4"
              />
              <div className="mt-4">
                <div className="flex items-center justify-center">
                  <h2 className="font-bold text-xl">
                    {userData?.displayName || "N/A"}
                  </h2>
                  {user.emailVerified && (
                    <CheckBadgeIcon className="w-6 h-6 text-green-500 inline-block ml-2" />
                  )}
                </div>
                <p className="text-gray-700 mt-2">
                  <EnvelopeIcon className="w-6 h-6 inline-block" />{" "}
                  {userData?.email || "N/A"}
                </p>
                <div className="">
                  <UserProfile
                    {...{
                      apiKeys,
                      setApiKeys,
                      isEditing,
                      setIsEditing,
                      handleSaveAPI,
                    }}
                  />
                </div>
              </div>
              <div className="mt-8">
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md inline-flex items-center"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative shadow"
              role="alert"
            >
              <strong className="font-bold">Oops! </strong>
              <span className="block sm:inline">
                Please sign in to view your profile.
              </span>
            </div>
            <a
              href="/"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md inline-flex items-center mt-10"
            >
              Home
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
