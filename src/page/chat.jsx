import React, { useState } from "react";
import { getAIResponse } from "../api/deepinfra";

const chat = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    const newMessage = { text: message, type: "user" };
    setChatHistory((prev) => [...prev, newMessage]);

    setMessage("");

    setLoading(true);
    try {
      const aiResponse = await getAIResponse(newMessage.text);
      const botResponse = {
        text: aiResponse?.choices?.[0]?.message?.content || "No response",
        type: "bot",
      };

      setChatHistory((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="h-full mr-2 ml-2 w-auto">
      <div className="">
        <div className="text-center text-black text-[22px] md:text-3xl mt-5 ">
          Rev-AI
        </div>
        <div className="flex flex-col w-auto p-4 space-y-4">
        {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`flex ${
                chat.type === "user" ? "justify-end mr-10" : "justify-start ml-10"
              }`}
            >
              <div
                className={`relative transition-transform duration-300 ease-in-out ${
                  chat.type === "user"
                    ? "bg-white text-black"
                    : "bg-[#88aaee] text-black"
                } px-6 py-4 rounded-2xl border-black border-[3px] w-[60%]`}
              >
                <div>{chat.text}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start ml-10">
              <div className="bg-transparent text-black px-6 py-4 rounded-2xl border-black border-[3px] w-[60%] min-h-[60px] animate-pulse">
                Wait......
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex w-auto justify-center fixed bottom-0 items-end inset-x-0 mx-auto md:mb-8 mb-5">
        <textarea
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          type="text"
          placeholder="ask me anything"
          className="md:w-[500px] w-[270px] md:max-h-[220px] max-h-[270px] pb-10 pl-5 pr-5 pt-3 rounded-lg field-sizing-content resize-none rounded-base border-2 font-base border-border px-3 py-2 text-md ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-50 bg-white text-black "
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bottom-0 text-md bg-[#88aaee] border-2 rounded-md border-black px-6 py-3 border-solid shadow-[4px_4px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] md:ml-4 ml-2 transition-all hover:cursor-pointer"
        >
          send
        </button>
      </div>
    </div>
  );
};

export default chat;
