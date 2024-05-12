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

const oldtemplates = {
  "form-19": `
        Answer the following question.
    
        Question:
        ---
          {questiontext}
        ---      
    `,
  "form-1": `
        You are an expert in assessing a candidate for a position.
        You take into account various details from the candidate linkedin profile and compare
        with the requirements of the job.
        
        Based on the context provided below, make a detailed assessment of how the candidate matches with the job description.
        Provide the recruiter with areas of match between the candidate and the job and also provide 
        areas where the candidate may not be a good fit and the questions the recruiter can ask to assess this.      
        
        The LinkedIn bio or resume details of the candidate: 
        ---
          {resumetext}
        ---
    
        Job Description:
        ---
          {jdtext}
        ---      
        Instruction:
        Using the different pieces of context above, create an assessment that takes into account all the pieces of information provided above 
        and analyzes them together in an appropriate manner to produce a reliable assessment for the recruiter to take concerete next steps.
        The recruiter should be able to take the assessment provided by you and make a decision to either engage the candidate further or not.
        Don't leave the recruiter confused with your assessment.      
    
    `,
  "form-11": `
        You are an expert in writing detailed job description.
        Based on the context provided below, write detailed job description for the role defined in the context.
        
        Target role for which you need to generate a job description:
        ---
          {resumetext}
        ---
    `,
  "form-12": `
        You are an expert in writing engaging tweet threads from articles.
        You take the most important aspects of an article and convert them to tweets. The tweet 
        thread you create is engaging and one tweet after another is an obvious extension of the previous one.
        
        Based on the article provided below, write an engaging tweet thread that summarizes the article. Ensure you use
        relevant hashtags.
        
        Article below for which you need to generate a tweet thread:
        ---
          {resumetext}
        ---
    `,
  "form-2": `
                 
    You are an expert in writing Sales emails that have a high conversion.
    You take into account various details about the Sales lead provided below and craft an engaging email. 
    You also take into account the details about the sender's product or service and its value proposition and include it
    strategically into the email.
    Based on the context provided below, write an engaging and high-conversion Sales email.      
    LinkedIn profile details about the lead: 
        ---
          {resumetext}
        ---
    
    Details about the sender's product or service:
        ---
          {jdtext}
        ---      
        Instruction:
        Using the different pieces of context above and write a Sales email that resonates with the lead. 
      `,
  "form-3": `
                 
    You are an expert in writing awesome follow-up emails that have a high conversion.
    You take into account various details such as the original email that was sent. 
    You also take into account the details about the response received to the original email.
    Based on the context provided below, write an engaging and high-conversion follow-up email.      
    Original email that was sent: 
        ---
          {sentemail}
        ---
    
    Response received to the sent email:
        ---
          {receivedemail}
        ---      
    
    Expected outcome from the follow-up email:
        ---
          {expectedoutcome}
        ---      
         
        Instruction:
        Write a follow-up email that will achieve the expected outcome and take into account the context related to the original email that was sent and the response that was received.
              
              
     `,
  "form-4": `
                 
                 You are an expert in summarizing articles.
                 You take into account various important points being made in the article and summarize them effectively.
                 The summaries you generate are divided into various themes and categories. You provide bullet points under each category.
                 
                 Full article text below.
                     ---
                       {articletext}
                     ---                    
                  Instruction:
                  Write a summary of the article text.
      `,
  "form-5": `
                 
                 You are an expert in creating action items from meeting notes.
                 You take into account various items described in meeting notes and effectively create action items. You have a deep understanding of what are actionable tasks and what are observations.               
                 
                 Meeting notes.
                     ---
                       {meetingnotes}
                     ---                    
                  Instruction:
                  Generate specific and succinct action items from meeting notes.
      `,
  "form-6": `
                 
                 You are an expert in writing engaging blog articles.
                 You take into account the requirements of the blog and the writing style 
                 and craft a detailed blog article that engages with the reader.
                 
                 What should the blog contain.
                     ---
                       {blogcontent}
                     ---                    
    
                  What should the writing style be of the blog
                     ---
                       {blogstyle}
                     ---                    
    
                  Instruction:
                  Write a blog article based on what should the blog contain in the writing style expected.
      `,
  "form-7": `
                 
                 Given the context below, complete the instruction.
                  
                 Context:
                     ---
                       {context}
                     ---                    
    
                  Instruction:
                     ---
                       {instruction}
                     ---                    
    
      `,
  "form-8": `You are an Senior Software Developer who can provide very detailed feedback for code. The feedback
                 you provide is well reasoned and discusses the conciseness, core readability, comment depth, performance
                 and completeness. 
                 You also provide inputs regarding the Security aspects of the code provided to you for review.
                 Code:
                 ---
                 {context}
                 ---
                 Instruction:
                 ---
                 Assume the role of an expert code reviewer and first provide an overview of what the code is trying to accmpllish.
                 Then provide a review of the code based on the guidelines shared above.
                 ---`,

  "form-9": `You are an Senior Software Developer who can write code to cater to a variety of expertise levels.
                 Your code is well commented and structured and you ensure that you provide a detailed explanation of the code your provide for a specific task.         
                 You also provide examples and test cases for the code you generate.
                 Task:
                 ---
                 {context}
                 ---`,
};

const oldmodelProviders = {
  Groq: [
    "llama3-8b-8192",
    "llama3-70b-8192",
    "llama2-70b-4096",
    "mixtral-8x7b-32768",
    "gemma-7b-it",
  ],
  OpenAI: ["gpt-4-turbo", "gpt-3.5-turbo-0125"],
  Anyscale: [
    "meta-llama/Llama-3-8b-chat-hf",
    "meta-llama/Llama-3-70b-chat-hf",
    "meta-llama/Llama-2-7b-chat-hf",
    "meta-llama/Llama-2-13b-chat-hf",
    "meta-llama/Llama-2-70b-chat-hf",
    "codellama/CodeLlama-70b-Instruct-hf",
    "mistralai/Mistral-7B-Instruct-v0.1",
    "mistralai/Mixtral-8x7B-Instruct-v0.1",
    "mistralai/Mixtral-8x22B-Instruct-v0.1",
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

const TEMPLATES = {
  "form-1": {
    title: "Answer the following question",
    instructions: ["Question:", "{questiontext}"],
  },
  "form-2": {
    title: "Provide the Text to Correct the Grammar",
    instructions: [
      "Original Text:",
      "{incorrecttext}",
      "Instruction: Provide the corrected text for the original text provided above.",
    ],
  },
  "form-3": {
    title: "Write a detailed assessment of a candidate",
    instructions: [
      "The LinkedIn bio or resume details of the candidate:",
      "{resumetext}",
      "Job Description:",
      "{jdtext}",
      "Instruction: Using the different pieces of context above, create an assessment for the recruiter.",
    ],
  },
  "form-4": {
    title: "Write a detailed job description",
    instructions: [
      "Target role for which you need to generate a job description:",
      "{resumetext}",
    ],
  },
};

const NEW_TEMPLATES = [
  {
    id: "form-1",
    name: "Plain Text",
    title: "Answer the following question",
    systemPrompt:
      "You are an expert in the field and have been asked to provide a detailed and comprehensive answer to the user's query. Your response should be well-structured, informative, and provide a thorough explanation of the topic.",
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
      "Additional context: ",
      "{additional}",
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

function SideBar({
  activeForm,
  handleFormChange,
  selectedProvider,
  handleProviderChange,
  selectedModel,
  handleModelChange,
}) {
  return (
    <div className="w-full md:w-1/4 p-6 space-y-4 overflow-auto shadow-lg bg-gradient-to-b from-blue-200 to-blue-100">
      <div>
        <div className="mt-2 md:mt-8">
          <label
            htmlFor="provider-select"
            className="text-md font-semibold text-gray-700"
          >
            Choose AI Model Provider:
          </label>
          <select
            id="provider-select"
            value={selectedProvider}
            onChange={handleProviderChange}
            className="mt-2 block w-full border-2 rounded-lg py-2 shadow-sm"
          >
            {Object.keys(MODEL_PROVIDERS).map((provider) => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4">
          <label
            htmlFor="model-select"
            className="text-md font-semibold text-gray-700"
          >
            Choose Model:
          </label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={handleModelChange}
            disabled={!MODEL_PROVIDERS[selectedProvider].length}
            className="mt-2 block w-full border-2 rounded-lg py-2 shadow-sm"
          >
            {MODEL_PROVIDERS[selectedProvider].map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
      </div>
      <h2 className="text-2xl font-bold">Forms</h2>
      <ul className="space-y-2">
        {NEW_TEMPLATES.map((form) => (
          <li key={form.id}>
            <button
              className={`w-full p-2 rounded-lg text-left bg-blue-100 border border-white ${
                activeForm === form.id ? "bg-blue-500 text-white" : ""
              }`}
              onClick={() => handleFormChange(form.id)}
            >
              {form.name}
            </button>
            <p className="text-sm text-gray-500"></p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FormField({
  activeForm,
  formInputs,
  handleInputChange,
  handleFormSubmit,
  characterCount,
  inputPrompt,
}) {
  const formTemplate = NEW_TEMPLATES.find((form) => form.id === activeForm);

  return (
    <div className="p-6 bg-white border-2 ">
      <h2 className="text-2xl font-bold mb-4">{formTemplate.title}</h2>
      <form onSubmit={handleFormSubmit}>
        {formTemplate.instructions.map((item, index) => {
          if (item.includes("{")) {
            const key = item.match(/\{(\w+)\}/)[1];
            return (
              <textarea
                key={index}
                name={key}
                value={formInputs[key]}
                onChange={handleInputChange}
                className="mt-2 block w-full border-2 border-gray-300 rounded-lg p-4 focus:ring-blue-500 focus:border-blue-500"
                placeholder={item.replace(/\{(\w+)\}/, "Enter Context here")}
              />
            );
          }
          return (
            <p key={index} className="text-base mt-4 md:text-lg text-left">
              {item.replace(/\{(\w+)\}/, "")}
            </p>
          );
        })}
        <p className="mt-4 text-md font-semibold">
          Character count: {characterCount}
        </p>
        {/* <p className="text-md font-semibold">Token count: {tokenCount}</p> */}
        <button
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

function AIResponse({ response }) {
  const converter = new showdown.Converter();
  let htmlContent = converter.makeHtml(response);
  // console.log(response);
  // console.log(htmlContent);
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

  return (
    <div className="w-full p-6 bg-white">
      <h2 className="text-2xl font-bold mb-4">AI Response</h2>
      <div className="text-left mx-auto p-6 br-sh rounded-lg bg-white">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </div>
  );
}

function Usagedetails({ response }) {
  return (
    <div className="w-full p-6 bg-white">
      <h2 className="text-2xl font-bold mb-4">Usage Details</h2>
      <div className="text-left mx-auto p-6 br-sh rounded-lg bg-white">
        <div className="text-left">
          <p className="text-md md:text-lg font-semibold">
            Model: {response.model}
          </p>
          {response.usage.total_time ? (
            <p className="text-md md:text-lg font-semibold">
              Total Time: {response.usage.total_time.toFixed(2)} seconds
            </p>
          ) : (
            ""
          )}
          <p className="text-md md:text-lg font-semibold md:flex md:items-center md:gap-2">
            Total Tokens: {response.usage.total_tokens} tokens
            <br></br>
            <span className="text-sm text-gray-600 md:text-lg">
              Prompt: {response.usage.prompt_tokens} tokens
            </span>
            <br></br>
            <span className="text-sm text-gray-600 md:text-lg">
              Completion: {response.usage.completion_tokens} tokens
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

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

function Playground() {
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
  const [completeresponse, setCompleteResponse] = useState("");
  const [inputprompt, setInputPrompt] = useState("");
  const [titletosave, setTitleToSave] = useState("");
  const [characterCount, setCharacterCount] = useState(0);
  const [formInputs, setFormInputs] = useState({});

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormInputs({ ...formInputs, [name]: value });
    setCharacterCount(value.length);
    setInputPrompt(value);
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
      setCompleteResponse(data);
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
    <div className="bg-white">
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
          <div className="container">
            {/* <UserProfile userData={userData} /> */}
            <div className="flex flex-col md:flex-row">
              <SideBar
                activeForm={activeForm}
                handleFormChange={setActiveForm}
                selectedProvider={selectedProvider}
                handleProviderChange={handleProviderChange}
                selectedModel={selectedModel}
                handleModelChange={handleModelChange}
                modelProviders={MODEL_PROVIDERS}
              />
              <div className="flex h-screen flex-col md:w-3/4 w-full">
                <FormField
                  activeForm={activeForm}
                  formInputs={{}}
                  handleInputChange={handleInputChange}
                  handleFormSubmit={handleFormSubmit}
                  templates={NEW_TEMPLATES}
                  characterCount={characterCount}
                  inputPrompt={inputprompt}
                />
                <div className="w-full md:p-6">
                  {smallloading ? (
                    <div className="mt-4">
                      <LoadingSmall />
                    </div>
                  ) : (
                    <>
                      {apiResponse ? (
                        <div className="flex flex-col justify-center items-center">
                          <AIResponse response={apiResponse} />
                          <div className="flex justify-center items-center flex-col md:flex-row gap-4">
                            <input
                              type="text"
                              value={titletosave}
                              onChange={(e) => setTitleToSave(e.target.value)}
                              placeholder="Title to save the response"
                              className="mt-4 block border-2 border-gray-300 rounded-lg py-2 px-1 focus:ring-blue-500 focus:border-blue-500 max-w-56 md:mt-0"
                            />
                            <button
                              onClick={handleSaveResponse}
                              className="mt-2 mb-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded md:m-0"
                            >
                              Save Response
                            </button>
                          </div>
                          <Usagedetails response={completeresponse} />
                        </div>
                      ) : (
                        <div className="mt-4 text-gray-500">
                          No response yet. Please submit a query.
                        </div>
                      )}
                    </>
                  )}
                </div>
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

export default Playground;
