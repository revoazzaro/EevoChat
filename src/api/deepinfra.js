const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_AI;

export const getAIResponse = async (message) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "Austism/chronos-hermes-13b-v2",
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!response.ok) throw new Error("Network response was not ok");

    return await response.json();
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return null;
  }
};
