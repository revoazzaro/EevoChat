import React, { useEffect, useState } from "react";
import { getAIResponse, fetchModels } from "../utils/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");

  useEffect(() => {
    const loadModels = async () => {
      const fetchedModels = await fetchModels();
      if (fetchedModels.length > 0) {
        setModels(fetchedModels);
        setSelectedModel(fetchedModels[0]);
      }
    };
    loadModels();
  }, []);

  const handleSend = async () => {
    if (!message.trim() || loading || !selectedModel) return;

    const newMessage = { text: message, type: "user" };
    setChatHistory((prev) => [...prev, newMessage]);
    setMessage("");
    setLoading(true);

    try {
      const aiResponse = await getAIResponse(message, selectedModel);
      const botResponse = {
        text: aiResponse?.choices?.[0]?.message.content || "No response",
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
      <div className="overflow-y-auto h-full mb-32">
        <div className="text-center text-black text-[22px] md:text-3xl mt-5 font-publicSans font-bold">
          Rev - AI
        </div>
        <div className="flex justify-center mt-3 font-publicSans font-medium text-lg">
          <label className="mr-2 text-black font-publicSans font-medium text-xl">
            Model:
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="border-2 border-gray-400 rounded-lg px-4 py-2 text-black w-[270px] md:w-[350px] font-medium"
          >
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col w-auto p-4 space-y-4">
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`flex ${
                (chat.type || chat.role) === "user"
                  ? "justify-end md:mr-10 mr-0"
                  : "justify-start md:ml-10 ml-0"
              }`}
            >
              <div
                className={`relative transition-transform duration-300 ease-in-out ${
                  (chat.type || chat.role) === "user"
                    ? "bg-white text-black w-[95%] font-bold"
                    : "bg-[#88aaee] text-black w-[95%] font-medium"
                } px-6 py-4 rounded-2xl border-black border-[3px] md:w-[60%]`}
              >
                <ReactMarkdown
                  className="prose prose-sm max-w-none"
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    pre: ({ node, children }) => (
                      <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto text-sm">
                        {children}
                      </pre>
                    ),
                    code: ({ node, inline, className, children, ...props }) => {
                      return inline ? (
                        <code className="bg-gray-400 text-black px-1 py-0.5 rounded">
                          {children}
                        </code>
                      ) : (
                        <code className={`hljs ${className || ""}`} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {chat.text}
                </ReactMarkdown>
                <div className="justify-end flex gap-x-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    height="21"
                    width="15"
                  >
                    <path d="M192 0c-41.8 0-77.4 26.7-90.5 64L64 64C28.7 64 0 92.7 0 128L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64l-37.5 0C269.4 26.7 233.8 0 192 0zm0 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM112 192l160 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z" />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    height="20"
                    width="20"
                  >
                    <path d="M386.3 160L336 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l128 0c17.7 0 32-14.3 32-32l0-128c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0s-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3s163.8-62.5 226.3 0L386.3 160z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start md:ml-10 ml-0">
              <div className="bg-transparent text-black px-6 py-4 rounded-2xl border-black border-[3px] w-[60%] min-h-[60px] animate-pulse">
                Wait......
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex w-auto justify-center fixed bottom-0 items-end inset-x-0 mx-auto bg-[#dfe5f2] h-auto py-5">
        <textarea
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          type="text"
          placeholder="ask me anything"
          className="md:w-[600px] w-[270px] md:max-h-[220px] max-h-[270px] pb-10 pl-5 pr-5 pt-3 rounded-lg field-sizing-content resize-none rounded-base border-2 font-base border-border px-3 py-2 text-md ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-50 bg-white text-black font-bold"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bottom-0 text-md font-publicSans font-medium bg-[#88aaee] border-2 rounded-md border-black px-6 py-3 border-solid shadow-[4px_4px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] md:ml-4 ml-2 transition-all hover:cursor-pointer"
        >
          send
        </button>
      </div>
    </div>
  );
};

export default Chat;
