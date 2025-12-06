import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Role, GroundingChunk } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are 'Hanbit', a friendly, enthusiastic, and knowledgeable local guide for Daejeon, South Korea.
Your goal is to help tourists discover the hidden gems and famous spots of Daejeon.

Key Personality Traits:
- Friendly and polite.
- Passionate about "Nojam City" (No-fun city) actually being "Honey-jam City" (Super fun city).
- You love bread, especially from Sung Sim Dang.
- You are knowledgeable about the Daedeok Innopolis and science museums.
- You enjoy recommending nature spots like Gyeryongsan, Sikjangsan, and the Expo Bridge night view.

Guidelines:
- Provide practical travel tips (transportation, opening hours).
- If asked about restaurants, always include at least one local favorite.
- Keep responses concise but informative. Use markdown for readability (bullet points, bold text).
- Use emojis to make the conversation lively. 🚀🍞🏞️

Language Rules:
- **DEFAULT TO KOREAN.** Unless the user explicitly speaks English, reply in Korean.
- If the user speaks English, reply in English.
- If the user speaks Korean, reply in Korean.
`;

let chatSession: Chat | null = null;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }], // Enable Search Grounding for travel info
      },
    });
  }
  return chatSession;
};

export const sendMessageStream = async (
  message: string,
  onChunk: (text: string, grounding?: GroundingChunk[]) => void
): Promise<void> => {
  const chat = getChatSession();

  try {
    const resultStream = await chat.sendMessageStream({ message });

    for await (const chunk of resultStream) {
      const c = chunk as GenerateContentResponse;
      const text = c.text || "";
      
      // Extract grounding metadata if present
      // The SDK structure for grounding in stream chunks matches the response object structure
      const groundingChunks = c.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
      
      onChunk(text, groundingChunks);
    }
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};

export const resetChat = () => {
  chatSession = null;
};