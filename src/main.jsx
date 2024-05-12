/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import Profile from "./pages/profile";
import Events from "./pages/events";
import Playground from "./pages/playground.jsx";
import History from "./pages/history";
import Store from "./pages/store";
import About from "./pages/about";

function Apps() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="profile" element={<Profile />} />
        <Route path="events" element={<Events />} />
        <Route path="playground" element={<Playground />} />
        <Route path="history" element={<History />} />
        <Route path="store" element={<Store />} />
        <Route path="about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<Apps />);
} else {
  console.error("Root element with id 'root' not found.");
}
