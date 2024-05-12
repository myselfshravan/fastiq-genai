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
  arrayUnion,
} from "firebase/firestore/lite";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import LoadingSmall from "../components/LoadingSmall";
import Header from "../components/Header";
import showdown from "showdown";
import GPT4Tokenizer from "gpt4-tokenizer";
import { NEW_TEMPLATES } from "../utils/templates";

const MODEL_PROVIDERS = {
  Groq: [
    "llama3-8b-8192",
    "llama3-70b-8192",
    "llama2-70b-4096",
    "mixtral-8x7b-32768",
    "gemma-7b-it",
  ],
  OpenAI: ["gpt-4-turbo", "gpt-3.5-turbo-0125"],
  Anyscale: [
    "meta-llama/Meta-Llama-3-8B-Instruct",
    "meta-llama/Meta-Llama-3-70B-Instruct",
    "mistralai/Mistral-7B-Instruct-v0.1",
    "mistralai/Mixtral-8x7B-Instruct-v0.1",
    "mistralai/Mixtral-8x22B-Instruct-v0.1",
    "codellama/CodeLlama-70b-Instruct-hf",
    "meta-llama/Llama-2-7b-chat-hf",
    "meta-llama/Llama-3-8b-chat-hf",
    "meta-llama/Llama-3-70b-chat-hf",
  ],
  TogetherAI: [
    "zero-one-ai/Yi-34B-Chat",
    "allenai/OLMo-7B-Instruct",
    "allenai/OLMo-7B-Twin-2T",
    "allenai/OLMo-7B",
    "Austism/chronos-hermes-13b",
    "cognitivecomputations/dolphin-2.5-mixtral-8x7b",
    "databricks/dbrx-instruct",
    "deepseek-ai/deepseek-coder-33b-instruct",
    "deepseek-ai/deepseek-llm-67b-chat",
    "garage-bAInd/Platypus2-70B-instruct",
    "google/gemma-2b-it",
    "google/gemma-7b-it",
    "Gryphe/MythoMax-L2-13b",
    "lmsys/vicuna-13b-v1.5",
    "lmsys/vicuna-7b-v1.5",
    "codellama/CodeLlama-13b-Instruct-hf",
    "codellama/CodeLlama-34b-Instruct-hf",
    "codellama/CodeLlama-70b-Instruct-hf",
    "codellama/CodeLlama-7b-Instruct-hf",
    "meta-llama/Llama-2-70b-chat-hf",
    "meta-llama/Llama-2-13b-chat-hf",
    "meta-llama/Llama-2-7b-chat-hf",
    "meta-llama/Llama-3-8b-chat-hf",
    "meta-llama/Llama-3-70b-chat-hf",
    "microsoft/WizardLM-2-8x22B",
    "mistralai/Mistral-7B-Instruct-v0.1",
    "mistralai/Mistral-7B-Instruct-v0.2",
    "mistralai/Mixtral-8x7B-Instruct-v0.1",
    "mistralai/Mixtral-8x22B-Instruct-v0.1",
    "NousResearch/Nous-Capybara-7B-V1p9",
    "NousResearch/Nous-Hermes-2-Mistral-7B-DPO",
    "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO",
    "NousResearch/Nous-Hermes-2-Mixtral-8x7B-SFT",
    "NousResearch/Nous-Hermes-llama-2-7b",
    "NousResearch/Nous-Hermes-Llama2-13b",
    "NousResearch/Nous-Hermes-2-Yi-34B",
    "openchat/openchat-3.5-1210",
    "Open-Orca/Mistral-7B-OpenOrca",
    "Qwen/Qwen1.5-0.5B-Chat",
    "Qwen/Qwen1.5-1.8B-Chat",
    "Qwen/Qwen1.5-4B-Chat",
    "Qwen/Qwen1.5-7B-Chat",
    "Qwen/Qwen1.5-14B-Chat",
    "Qwen/Qwen1.5-32B-Chat",
    "Qwen/Qwen1.5-72B-Chat",
    "snorkelai/Snorkel-Mistral-PairRM-DPO",
    "togethercomputer/alpaca-7b",
    "teknium/OpenHermes-2-Mistral-7B",
    "teknium/OpenHermes-2p5-Mistral-7B",
    "togethercomputer/RedPajama-INCITE-Chat-3B-v1",
    "togethercomputer/RedPajama-INCITE-7B-Chat",
    "togethercomputer/StripedHyena-Nous-7B",
    "Undi95/ReMM-SLERP-L2-13B",
    "Undi95/Toppy-M-7B",
    "WizardLM/WizardLM-13B-V1.2",
    "upstage/SOLAR-10.7B-Instruct-v1.0",
  ],
};

function UserProfile({ userData }) {
  return (
    <div className="">
      <div className="text-center">
        <h1 className="font-bold tracking-tight text-gray-900">
          Welcome, {userData.displayName}
        </h1>
      </div>
    </div>
  );
}

function TemplateDetail({ template }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-2 md:p-4 mb-4 bg-white rounded-lg shadow md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left">
        <div className="flex justify-between items-center">
          <h2 className="text-md md:text-xl font-semibold text-gray-900">
            {template.name}
          </h2>
          <span className="text-gray-500">{isOpen ? "▲" : "▼"}</span>
        </div>
      </button>
      {isOpen && (
        <div className="mt-2">
          <p className="text-sm text-gray-700">{template.title}</p>
          <p className="text-xs text-gray-600">{template.systemPrompt}</p>
          <ul className="list-disc list-inside mt-2 text-gray-600">
            {template.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function TemplateList({ templates }) {
  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <TemplateDetail key={template.id} template={template} />
      ))}
    </div>
  );
}

function Store() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-col items-center">
        <div className="container mx-auto px-4 py-8">
          <div className="mt-8 mb-4">
            <TemplateList templates={NEW_TEMPLATES} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Store;
