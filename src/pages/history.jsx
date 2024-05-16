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
import showdown from "showdown";

const dummyuserData = {
  uid: "123456789",
  displayName: "Shravan",
  email: "shravanrevanna158@gmail.com",
  groqapi: "123456789",
  openaiapi: "123456789",
  anyscaleapi: "123456789",
  togetheraiapi: "123456789",
  airesponses: [
    {
      id: "1",
      title: "something",
      userPrompt: "What is the capital of India?",
      selectedModel: "llama3",
      aiResponse: "New Delhi",
      timestamp: "May 8, 2024 at 3:31:30 PM UTC+5:30",
    },
    {
      id: "2",
      title: "something",
      userPrompt: "What is the capital of France?",
      selectedModel: "llama3",
      aiResponse: "Paris",
      timestamp: "May 8, 2024 at 3:31:30 PM UTC+5:30",
    },
    {
      id: "3",
      title: "something",
      userPrompt: "What is the capital of Germany?",
      selectedModel: "llama3",
      aiResponse: "Berlin",
      timestamp: "May 8, 2024 at 3:31:30 PM UTC+5:30",
    },
  ],
};

const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString("en-GB", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

const groupByDate = (responses) => {
  return responses.reduce((groups, response) => {
    const date = formatDate(response.timestamp.seconds);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(response);
    return groups;
  }, {});
};

function AIResponse({ response }) {
  const converter = new showdown.Converter();
  let htmlContent = converter.makeHtml(response);
  htmlContent = htmlContent.replace(
    /<(\w+)(\s+[^>]*)? id="[^"]*"([^>]*)>/g,
    "<$1$2$3>"
  );
  htmlContent = htmlContent.replace(
    /<(\w+)(\s+[^>]*)? id='[^']*'([^>]*)>/g,
    "<$1$2$3>"
  );
  htmlContent = htmlContent.replace(
    /<h1>/g,
    '<h1 class="text-xl md:text-3xl font-bold mt-10">'
  );
  htmlContent = htmlContent.replace(
    /<h2>/g,
    '<h2 class="text-lg md:text-2xl font-bold mt-10">'
  );
  htmlContent = htmlContent.replace(
    /<h3>/g,
    '<h3 class="text-base md:text-xl font-bold mt-10">'
  );
  // Add classes to <p> tags
  htmlContent = htmlContent.replace(
    /<p>/g,
    '<p class="my-4 text-sm md:text-lg">'
  );
  htmlContent = htmlContent.replace(
    /<strong>/g,
    '<strong class="font-bold mt-10">'
  );
  htmlContent = htmlContent.replace(
    /<ul>/g,
    '<ul class="list-disc pl-5 space-y-2 mb-4">'
  );
  htmlContent = htmlContent.replace(
    /<ol>/g,
    '<ol class="list-disc pl-5 space-y-2">'
  );
  htmlContent = htmlContent.replace(/<li>/g, '<li class="text-sm md:text-lg">');
  htmlContent = htmlContent.replace(
    /<hr \/>/g,
    '<hr class="my-8 border-t border-gray-300"/>'
  );
  // Add classes to <pre> tags
  htmlContent = htmlContent.replace(
    /<pre>/g,
    '<pre class="p-4 bg-gray-100 rounded-lg overflow-x-auto font-mono text-sm leading-normal">'
  );
  htmlContent = htmlContent.replace(
    /<code>/g,
    '<code class="language-python">'
  );
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-white">
      <div className="text-left mx-auto p-2 br-sh rounded-lg bg-white">
        <button onClick={() => setIsOpen(!isOpen)} className="text-left w-full">
          <div className="flex justify-between items-center">
            <h2 className="text-md md:text-xl font-semibold text-gray-900">
              AI Response
            </h2>
            <span className="text-gray-500">{isOpen ? "▲" : "▼"}</span>
          </div>
        </button>
        <Transition
          show={isOpen}
          enter="transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="mt-2">
            <div
              className="text-sm text-gray-700"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </Transition>
      </div>
    </div>
  );
}

function Responses({ userData }) {
  if (!userData || !userData.airesponses) {
    return (
      <p className="text-lg font-semibold text-gray-800">No responses found.</p>
    );
  }

  const groupedResponses = groupByDate(
    userData.airesponses
      .slice()
      .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)
  );

  return (
    <div>
      {Object.entries(groupedResponses).map(([date, responses]) => (
        <div key={date}>
          <h2 className="text-lg font-bold text-gray-800 mb-4">{date}</h2>
          {responses.map((response, index) => (
            <div
              key={index}
              className="flex flex-col w-full border border-gray-200 rounded-md p-4 mb-4"
            >
              <div className="flex items-center justify-between w-full">
                <p className="text-lg font-semibold text-gray-800">
                  {response.title}
                </p>
                <p className="text-sm text-gray-400">
                  {formatTime(response.timestamp.seconds)}
                </p>
              </div>
              <p className="text-sm text-gray-400">{response.selectedModel}</p>
              <div className="flex items-center justify-between w-full mt-2 flex-col">
                {/* <p className="text-sm text-gray-600">
                  AI Response: {response.aiResponse}
                </p> */}
                <AIResponse response={response.aiResponse} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const History = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
          History
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
            <p className="text-lg font-semibold text-gray-800 mb-4">
              Welcome back, {user.displayName}!
            </p>
            <div className="flex flex-col w-full">
              <Responses userData={userData} />
              {/* {userData && userData.airesponses ? (
                userData.airesponses
                  .slice()
                  .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)
                  .map((response, index) => (
                    <div
                      key={index}
                      className="flex flex-col w-full border border-gray-200 rounded-md p-4 mb-4"
                    >
                      <div className="flex items-center justify-between w-full">
                        <p className="text-lg font-semibold text-gray-800">
                          {response.userPrompt}
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(
                            response.timestamp.seconds * 1000
                          ).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-400">
                          {response.selectedModel}
                        </p>
                      </div>
                      <div className="flex items-center justify-between w-full mt-2 flex-col">
                        <p className="text-sm text-gray-600">
                          AI Response: {response.aiResponse}
                        </p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="flex flex-col w-full">
                  <p className="text-lg font-semibold text-gray-800">
                    No responses found.
                  </p>
                </div>
              )} */}
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

export default History;
