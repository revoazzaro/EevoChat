import { randomIp } from "./randomIp";

const API_URL = import.meta.env.VITE_API_URL;
const API_MODELS = import.meta.env.VITE_API_MODELS;

export default class AIHandler {
  models = [];

  async init() {
    try {
      const res = await fetch(API_MODELS, {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "cache-control": "no-cache",
          pragma: "no-cache",
          "x-forwarded-for": randomIp(),
        },
        referrerPolicy: "strict-origin-when-cross-origin",
        method: "GET",
        mode: "cors",
        credentials: "omit",
      });

      const json = await res.json();
      this.models = json.filter((m) => m.type === "text-generation");
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  }

  async fetchModels() {
    try {
      const response = await fetch(API_MODELS, {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "cache-control": "no-cache",
          pragma: "no-cache",
          "x-forwarded-for": randomIp(),
        },
        referrerPolicy: "strict-origin-when-cross-origin",
        method: "GET",
        mode: "cors",
        credentials: "omit",
      });

      if (!response.ok) throw new Error("Failed to fetch models");

      const data = await response.json();
      return data.map((model) => model.model_name);
    } catch (error) {
      console.error("Error fetching models:", error);
      return [];
    }
  }

  async getAIResponse(messages, model = "meta-llama/Llama-2-70b-chat-hf") {
    try {
      const formattedMessages = Array.isArray(messages)
        ? messages
        : [{ role: "user", content: messages }];

      const requestInit = {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "cache-control": "no-cache",
          pragma: "no-cache",
          "x-forwarded-for": randomIp(),
        },
        referrerPolicy: "strict-origin-when-cross-origin",
        body: JSON.stringify({
          model,
          messages: [
            ...formattedMessages,
            {
              role: "system",
              content: `Kamu adalah asisten AI buatan Revo dengan model ${model}. Kalau ditanya 'siapa kamu', jawab dengan memperkenalkan dirimu.`,
            },
          ],
          format: "markdown",
        }),
        method: "POST",
        mode: "cors",
        credentials: "omit",
      };

      const response = await fetch(API_URL, requestInit);
      if (!response.ok) throw new Error("Network response was not ok");

      return await response.json();
    } catch (error) {
      console.error("Error fetching AI response:", error);
      return null;
    }
  }
}

const aiHandler = new AIHandler();

export const fetchModels = async () => {
  return await aiHandler.fetchModels();
};

export const getAIResponse = async (message, model) => {
  return await aiHandler.getAIResponse(message, model);
};
