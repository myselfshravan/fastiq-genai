/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, Fragment, useRef } from "react";
import Header from "../components/Header";

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

function About() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto py-16">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-8 py-12 text-left">
            <h1 className="text-4xl font-bold mb-8 text-center">
              About FastIQ
            </h1>
            <p className="text-lg mb-8 leading-relaxed">
              <strong>FastIQ</strong> is an innovative platform designed to
              streamline the integration and utilization of multiple API
              providers for large language models (LLMs). Our platform serves as
              a hub for developers, researchers, and businesses to access a
              diverse range of AI models from leading providers such as Groq,
              OpenAI, Anyscale, and TogetherAI, among others.
            </p>
            <h2 className="text-2xl font-bold mb-4">Key Features:</h2>
            <ul className="list-disc pl-6 mb-8">
              <li className="mb-2">
                <strong>Extensive Model Catalogue:</strong> FastIQ offers an
                extensive range of models, from well-known architectures like
                GPT-4 Turbo to specialized models like Llama and Mistral,
                facilitating a wide array of applications from chatbots to
                complex data analysis tasks.
              </li>
              <li className="mb-2">
                <strong>Flexible Integration:</strong> Users can seamlessly
                switch between different models and providers, allowing for
                flexibility and experimentation in deployment strategies.
              </li>
              <li className="mb-2">
                <strong>User-Centric Design:</strong> With an intuitive
                interface, FastIQ ensures that both novice users and experienced
                developers can effectively interact with advanced AI
                technologies. Our platform supports various forms of
                interactions including textual responses, grammar corrections,
                and even creating complex AI responses.
              </li>
            </ul>
            <h2 className="text-2xl font-bold mb-4">Applications:</h2>
            <p className="mb-8">
              FastIQ is built to cater to a multitude of scenarios, ranging from
              academic research that requires robust data analysis tools to
              businesses needing to deploy conversational agents for customer
              service. Our templates and customizable settings ensure that each
              user can tailor the experience to their specific needs, making
              FastIQ a versatile choice for many sectors.
            </p>
            <h2 className="text-2xl font-bold mb-4">
              Commitment to Innovation:
            </h2>
            <p className="mb-8">
              At FastIQ, we are continuously expanding our offerings and
              improving user experience based on feedback and emerging trends in
              the AI space. We are committed to providing our users with the
              most up-to-date tools and resources, empowering them to achieve
              exceptional results in their respective fields.
            </p>
            <h2 className="text-2xl font-bold mb-4">Join Us:</h2>
            <p className="mb-8">
              Explore the possibilities with FastIQ and harness the power of AI
              to elevate your projects. Whether you are looking to improve
              interaction dynamics, enhance data processing capabilities, or
              explore new avenues of AI applications, FastIQ provides a reliable
              and efficient platform to bring your ideas to life.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
