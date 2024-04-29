/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import "../App.css";

function Loading() {
  const [randomQuote, setRandomQuote] = useState("");
  useEffect(() => {
    const quotes = [
      "Go ahead -- hold your breath!",
      "Alt-F4 speeds things up...",
      "We're working very Hard .... Really",
      "You are number 2843684714 in the queue",
      "Well, this is embarrassing",
      "It's not you. It's me",
      "My other loading screen is much faster",
      "Web developers do it with <style>",
    ];
    const selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setRandomQuote(selectedQuote);
  }, []);
  return (
    <div className="flex justify-center items-center min-h-screen w-full">
      <div className="loader1">
        <div className="inner one"></div>
        <div className="inner two"></div>
        <div className="inner three"></div>
      </div>
      <p className="quote text-black">{randomQuote}</p>
    </div>
  );
}

export default Loading;
