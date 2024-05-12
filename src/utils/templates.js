export const NEW_TEMPLATES = [
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
