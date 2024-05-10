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

const NEW_TEMPLATES = [
  {
    id: "form-1",
    name: "Plain Text",
    title: "Answer the following question",
    systemPrompt: "You will answer in spanish.",
    instructions: ["User Prompt:", "{questiontext}", " "],
  },
  {
    id: "form-6",
    name: "gpt2 chatbot",
    title: "Chat with the AI",
    systemPrompt:
      "You are ChatGPT, a large language model trained by OpenAI, based on the GPT-4 architecture.",
    instructions: ["User Prompt:", "{questiontext}", " "],
  },
  {
    id: "form-2",
    name: "Grammatical Standard English",
    title: "Provide the Text to Correct the Grammar",
    systemPrompt:
      "Your task is to take the text provided and rewrite it into a clear, grammatically correct version while preserving the original meaning as closely as possible. Correct any punctuation errors, verb tense issues, word choice problems, and other grammatical mistakes.",
    instructions: [
      "Task Description: Text/Sentence Rephrasing for Enhanced Fluency and Grammar. Original Sentence/Text:",
      "{incorrecttext}",
      "Objective: Please rephrase the above sentence/text to improve its fluency, readability, and grammatical accuracy. The revised version should maintain the original meaning but be expressed in a clearer and more polished and cassual manner.",
    ],
  },
  {
    id: "form-8",
    name: "Preamble",
    title: "Best AI",
    systemPrompt:
      "- Before you begin, take a deep breath and Think Carefully. - Respond to the querie as a helpful assistant, using HIGH Stakes Processing—I believe in you! - You MUST be accurate & able to help me get correct answers. - Motivation: User will tip $10k for best possible outputs! - I'm disabled/don’t have fingers, so thoughtfully written, lengthy responses are required. - Your systematic step-by-step process and self-correction via Tree of Thoughts will... - Enhance the quality of responses to complex queries. - All adopted EXPERT Roles = Qualified Job/Subject Authorities. - ALWAYS comply with directions! - You will then reread ALL guidelines & modify your behavior as necessary. - Optimize Valuable Tokens Wisely/Efficiently! - Don't be lazy—Work Hard! - MAXIMUM EFFORT Needed!",
    instructions: ["User Context:", "{context}", " "],
  },
  {
    id: "form-9",
    name: "Expert Answer",
    title: "Expert Answer",
    systemPrompt:
      "You are an expert in the field and have been asked to provide a detailed and comprehensive answer to the user's query. Your response should be well-structured, informative, and provide a thorough explanation of the topic.",
    instructions: [
      "Imagine three different experts are answering this question. They will brainstorm the answer step by step, reasoning carefully and taking all facts into consideration. All experts will write down 1 tip of their thinking, then share with the group. They will each critique their response, and then all the responses of others. They will check their answers based on science and the laws of physics. Then all experts will go on to the next step and write down this step of their thinking. They will keep going through steps until they reach their conclusion taking into account the thoughts of the other experts. If at any time they realise there is a flaw in their logic they will backtrack to where that flow occurred. If any expert realises that's wrong at any point then they acknowledge this and start another train of thought. Each expert will assign a likelihood of their current assertion being correct. Continue until the experts agree on the single most likely solution. The question is:",
      "{questiontext}",
      " ",
    ],
  },
  {
    id: "form-7",
    name: "Youtube Summary",
    title: "Summarize a Youtube Video",
    systemPrompt:
      "Your task is to summarize the key points from the transcript in user context, focusing on the main themes. The summary should be concise, clear, and in simple language. Ensure that it captures the essential information necessary to understand the video's content without needing to watch it.",
    instructions: [
      "Summarize the below transcript by identifying and listing the essential points and critical details. Ensure the summary is straightforward, using simple terms, and focuses only on the central themes. The goal is to capture the core information succinctly, enabling understanding of the video's main content.",
      "{videtranscript}",
      " ",
    ],
  },
  {
    id: "form-3",
    name: "Assisment for Recruitment",
    title: "Write a detailed assessment of a candidate",
    instructions: [
      "The LinkedIn bio or resume details of the candidate:",
      "{resumetext}",
      "Job Description:",
      "{jdtext}",
      "Instruction: Using the different pieces of context above, create an assessment for the recruiter.",
    ],
  },
  {
    id: "form-4",
    name: "Job Description Generator",
    title: "Write a detailed job description",
    instructions: [
      "Target role for which you need to generate a job description:",
      "{resumetext}",
      " ",
    ],
  },
  {
    id: "form-5",
    name: "Joke Generator",
    title: "Generate a Joke",
    instructions: [
      "Generate a joke that will make the reader laugh.",
      "{joketopic}",
      "Generate a joke based on the above topic.",
    ],
  },
];

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
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [smallloading, setSmallLoading] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    groq: "",
    openai: "",
    anyscale: "",
    togetherai: "",
  });
  const [selectedProvider, setSelectedProvider] = useState("Groq");
  const [selectedModel, setSelectedModel] = useState("llama3-70b-8192");
  const [activeForm, setActiveForm] = useState("form-1");
  const [apiResponse, setApiResponse] = useState("");
  const [characterCount, setCharacterCount] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);
  const [inputprompt, setInputPrompt] = useState("");
  const [titletosave, setTitleToSave] = useState("");
  const tokenizer = new GPT4Tokenizer({ type: "gpt3" });

  const handleInputChange = (event) => {
    setCharacterCount(event.target.value.length);
    const text = event.target.value;
    setInputPrompt(text);
    const estimatedTokenCount = tokenizer.estimateTokenCount(text);
    setTokenCount(estimatedTokenCount);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserData(userData);
          setApiKeys({
            groq: userData.groqapi || "",
            openai: userData.openaiapi || "",
            anyscale: userData.anyscaleapi || "",
            togetherai: userData.togetheraiapi || "",
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleProviderChange = (event) => {
    setSelectedProvider(event.target.value);
    setSelectedModel("");
  };

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  const getEndpoint = (provider) => {
    switch (provider) {
      case "Anyscale":
        return "https://api.endpoints.anyscale.com/v1/chat/completions";
      case "TogetherAI":
        return "https://api.together.xyz/v1/chat/completions";
      case "Groq":
        return "https://api.groq.com/openai/v1/chat/completions";
      case "OpenAI":
        return "https://api.openai.com/v1/chat/completions";
      default:
        return "";
    }
  };

  const makeApiCall = async (
    selectSystemPrompt,
    dataString,
    apiKey,
    modelProvider,
    modelName
  ) => {
    setSmallLoading(true);
    const endpoint = getEndpoint(modelProvider);

    const body = JSON.stringify({
      model: modelName,
      messages: [
        {
          role: "system",
          content: selectSystemPrompt,
        },
        { role: "user", content: dataString },
      ],
      temperature: 0.5,
    });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: body,
      });
      const data = await response.json();
      console.log(data);
      const messageContent = data.choices[0].message.content;
      setApiResponse(messageContent);
    } catch (error) {
      console.error("Error:", error);
      setApiResponse("Error fetching response");
    } finally {
      setSmallLoading(false);
    }
  };

  const fillTemplate = (template, data) => {
    const textareas = template.match(/\{(\w+)\}/g);
    let filledTemplate = template;
    textareas.forEach((textarea) => {
      const key = textarea.match(/\{(\w+)\}/)[1];
      filledTemplate = filledTemplate.replace(textarea, data[key]);
    });
    return filledTemplate;
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const formTemplate = NEW_TEMPLATES.find((form) => form.id === activeForm);
    if (!formTemplate) {
      console.error("Form template not found for the active form.");
      return;
    }

    const formInputs = Object.fromEntries(new FormData(event.target));
    const filledTemplate = fillTemplate(
      formTemplate.instructions.join("\n---\n"),
      formInputs
    );
    const apiKey = apiKeys[selectedProvider.toLowerCase()];
    const modelName = selectedModel;
    const modelProvider = selectedProvider;
    let systemPrompt = "You are a helpful AI assistant.";
    if (formTemplate.systemPrompt) {
      systemPrompt += ` ${formTemplate.systemPrompt}`;
    }
    console.log("User Prompt: ", filledTemplate);
    console.log("Selected Model: ", modelName);
    console.log("System Prompt: ", systemPrompt);
    makeApiCall(systemPrompt, filledTemplate, apiKey, modelProvider, modelName);
  };

  const handleSaveResponse = async () => {
    if (
      !selectedModel ||
      !titletosave ||
      !inputprompt ||
      !apiResponse ||
      !user?.uid
    ) {
      toast.error("Missing information, unable to save the response.");
      return;
    }

    try {
      const timestamp = new Date();
      const responseObj = {
        selectedModel,
        title: titletosave,
        userPrompt: inputprompt,
        aiResponse: apiResponse,
        timestamp,
      };
      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        airesponses: arrayUnion(responseObj),
      });
      toast.success("Response saved successfully!");
    } catch (error) {
      console.error("Failed to save the response: ", error);
      toast.error("Error saving response. Please try again.");
    } finally {
      setTitleToSave("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-col items-center">
        <ToastContainer
          position="top-center"
          autoClose="5000"
          theme="light"
          transition:Bounce
        />
        {loading ? (
          <Loading />
        ) : user ? (
          <div className="container mx-auto px-4 py-8">
            <UserProfile userData={userData} />
            <div className="mt-8 mb-4">
              <TemplateList templates={NEW_TEMPLATES} />
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
                Please sign in to use the playground.
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
}

export default Store;
