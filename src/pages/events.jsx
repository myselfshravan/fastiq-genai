/* eslint-disable no-unused-vars */
import React, { useEffect, useState, Fragment } from "react";
import { db, auth } from "../firebaseconfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Dialog, Transition } from "@headlessui/react";

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
import Header from "../components/Header";
import Loading from "../components/Loading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const dummyuserData = {
  id: "123456789",
  displayName: "Shravan",
  email: "shravanrevanna158@gmail.com",
  coins: 100,
  phoneNumber: "9945332995",
  transactions: [
    {
      newCoins: 100,
      timestamp: "April 19, 2024 at 5:16:32 PM UTC+5:30",
      reason: "Registered for Event A",
    },
  ],
};

const dummycuser = {
  uid: "123456789",
  displayName: "Shravan",
  email: "shravanrevanna158@gmail.com",
};

const dummyteams = {
  teamName: "Team A",
  memberEmails: ["a@gmail.com", "b@gmail.com"],
  members: [
    {
      displayName: "A",
      email: "a@gmail.com",
    },
    {
      displayName: "B",
      email: "b@gmail.com",
    },
  ],
  owner: "a@gmail.com",
  registeredEvents: [
    {
      eventId: "cNKJow0qB6PbcsE643FZ",
      eventName: "Event A",
      registeredBy: "a@gmail.com",
      timestamp: "April 19, 2024 at 5:16:32 PM UTC+5:30",
    },
    {
      eventId: "cNKJow0qB6PbcsE643FZ",
      eventName: "Event B",
      registeredBy: "b@gmail.com",
      timestamp: "April 19, 2024 at 5:16:32 PM UTC+5:30",
    },
  ],
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [teams, setTeams] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [teamId, setTeamId] = useState("");
  const selectedTeamName = teams.find((team) => team.id === teamId)?.teamName;

  // Fetch teams from Firebase
  const fetchTeams = async (email) => {
    const teamsQuery = query(
      collection(db, "teams"),
      where("memberEmails", "array-contains", email)
    );
    const querySnapshot = await getDocs(teamsQuery);
    const teamsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTeams(teamsData);
  };

  // setUserData and fetchTeams from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const userRef = doc(db, "users", currentUser.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          setUserData(userSnapshot.data());
          fetchTeams(currentUser.email);
        } else {
          console.log("No user data found");
        }
      } else {
        setUser(null);
        setUserData(null);
        setTeams([]);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Fetch events from Firebase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollection = collection(db, "events");
        const eventsSnapshot = await getDocs(eventsCollection);
        const eventsData = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events: ", error);
        toast.error("Error fetching events: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Register for an event
  const handleRegisterEventNew = (event) => {
    setSelectedEvent(event);
    setShowDialog(true);
  };

  const confirmRegistration = async () => {
    const event = selectedEvent;
    if (!event) return;

    try {
      if (userData.coins < event.registrationAmount) {
        setShowDialog(false);
        toast.error("Insufficient coins to register for this event.");
        return;
      }

      if (!teamId) {
        setShowDialog(false);
        toast.warn("No team selected. Registration canceled.");
        return;
      }

      const teamRef = doc(db, "teams", teamId);
      const teamSnapshot = await getDoc(teamRef);

      if (!teamSnapshot.exists()) {
        setShowDialog(false);
        toast.error("Invalid team ID. Registration canceled.");
        return;
      }

      const teamData = teamSnapshot.data();

      // Check if the team is already registered for the event
      const isTeamRegistered = teamData.registeredEvents?.some(
        (registeredEvent) => registeredEvent.eventId === event.id
      );

      if (isTeamRegistered) {
        setShowDialog(false);
        toast.warn("This team is already registered for this event.");
        return;
      }

      // Update the team document with the registered event
      await updateDoc(teamRef, {
        registeredEvents: [
          ...(teamData.registeredEvents || []),
          {
            eventId: event.id,
            eventName: event.eventName,
            timestamp: new Date(),
            registeredBy: user.email,
          },
        ],
      });

      // Deduct the registration amount from the user's coins
      await updateDoc(doc(db, "users", user.uid), {
        coins: userData.coins - event.registrationAmount,
        transactions: [
          ...(userData.transactions || []),
          {
            newCoins: userData.coins - event.registrationAmount,
            timestamp: new Date(),
            reason: `Registered Team:"${teamData.teamName}" for Event:"${event.eventName}"`,
            transactionAmount: -event.registrationAmount,
          },
        ],
      });

      // Update local state to reflect the new coin balance
      setUserData({
        ...userData,
        coins: userData.coins - event.registrationAmount,
        transactions: [
          ...(userData.transactions || []),
          {
            newCoins: userData.coins - event.registrationAmount,
            timestamp: new Date(),
            reason: `Registered for ${event.eventName}`,
          },
        ],
      });

      setShowDialog(false);
      toast.success(
        `Team "${teamData.teamName}" registered for "${event.eventName}".`
      );
    } catch (error) {
      console.error("Error registering for event: ", error);
      setShowDialog(false);
      toast.error("Error registering for event: " + error.message);
    }

    setSelectedEvent(null);
  };

  return (
    <div className="bg-white">
      <Header />
      <div className="mt-10 flex flex-col items-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-10 pt-14">Events</h1>
        <ToastContainer
          position="top-center"
          autoClose="5000"
          theme="light"
          transition:Bounce
        />
        <Transition.Root show={showDialog} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => setShowDialog(false)}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full justify-center p-4 text-center items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                          <Dialog.Title
                            as="h3"
                            className="text-lg leading-6 font-medium text-gray-900"
                          >
                            Confirm Registration
                          </Dialog.Title>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              You are about to register{" "}
                              <span className="font-bold">
                                {selectedTeamName || "a team"}
                              </span>{" "}
                              for{" "}
                              <span className="font-bold">
                                {selectedEvent?.eventName}
                              </span>
                              . This will deduct{" "}
                              <span className="font-bold">
                                Rs {selectedEvent?.registrationAmount}
                              </span>
                              . You are about to register{" "}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-6 py-4">
                      <label
                        htmlFor="team"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Select a team:
                      </label>
                      <select
                        id="team"
                        name="team"
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        onChange={(e) => setTeamId(e.target.value)}
                      >
                        <option value="">Select a team</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.teamName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                      <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={confirmRegistration}
                      >
                        Register
                      </button>
                      <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={() => setShowDialog(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {isLoading ? (
          <Loading />
        ) : (
          <div className="w-full max-w-4xl">
            <p className="text-gray-700 mb-6">
              Coin Balance: {userData?.coins || 0}
            </p>
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md p-6 mb-6"
              >
                <h2 className="text-2xl font-bold mb-2">{event.eventName}</h2>
                <p className="text-gray-700 mb-4">{event.eventDescription}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">
                      Max Team Size: {event.maxTeamSize}
                    </p>
                    <p className="font-bold">
                      Registration Amount: Rs {event.registrationAmount}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleRegisterEventNew(event);
                    }}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
                  >
                    Register
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
