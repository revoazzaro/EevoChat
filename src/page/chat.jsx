import { useState, useEffect, useRef } from "react";
import { getAIResponse, fetchModels } from "../utils/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";

const Chat = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

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
      const recentMessages = [...chatHistory, newMessage]
        .slice(-3)
        .map((msg) => ({
          role: msg.type === "user" ? "user" : "assistant",
          content: msg.text,
        }));

      const aiResponse = await getAIResponse(recentMessages, selectedModel);

      const fullText =
        aiResponse?.choices?.[0]?.message?.content || "No response";

      setChatHistory((prev) => [
        ...prev,
        { text: "", type: "bot", typing: true },
      ]);

      let index = 0;
      const interval = setInterval(() => {
        setChatHistory((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];

          if (lastMsg?.typing) {
            lastMsg.text = fullText.substring(0, index + 1);
          }
          return updated;
        });

        index++;
        if (index >= fullText.length) {
          clearInterval(interval);

          setChatHistory((prev) => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg?.typing) lastMsg.typing = false;
            return updated;
          });
        }
      }, 40);
    } catch (error) {
      console.error("Error fetching AI response:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyButton = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <section className="flex flex-col h-dvh relative">
      <nav className="flex items-center p-4 rounded-b-md gap-3 z-20 bg-white shadow-md md:shadow-none md:hidden">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="cursor-pointer md:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 100 100"
            className="text-black"
          >
            <g>
              <path
                d="M 16.999688 10.000312 L 3 10.000312"
                transform="matrix(4.166667,0,0,4.166667,0,0)"
                fill="none"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 21 6 L 3 6"
                transform="matrix(4.166667,0,0,4.166667,0,0)"
                fill="none"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 21 13.999688 L 3 13.999688"
                transform="matrix(4.166667,0,0,4.166667,0,0)"
                fill="none"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 16.999688 18 L 3 18"
                transform="matrix(4.166667,0,0,4.166667,0,0)"
                fill="none"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-black">RevAI</h1>
      </nav>
      <main
        className={`flex-1 overflow-y-auto p-4 space-y-4 transition-all ${
          isSidebarOpen ? "blur-sm" : "md:w-[75%] md:ml-auto"
        }`}
      >
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`flex ${
              (chat.type || chat.role) === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`font-medium p-3 rounded-xl md:max-w-[70%] max-w-full border border-black shadow-[4px_4px_0px_black] ${
                (chat.type || chat.role) === "user"
                  ? "bg-white text-black"
                  : "bg-[#88aaee] text-black"
              }`}
            >
              <ReactMarkdown
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
              <div className="justify-end flex gap-x-3 mt-4">
                <div
                  onClick={() => copyButton(chat.text)}
                  className="hover:cursor-pointer"
                >
                  {(chat.type || chat.role) === "user" ? null : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 384 512"
                      height="21"
                      width="15"
                    >
                      <path d="M192 0c-41.8 0-77.4 26.7-90.5 64L64 64C28.7 64 0 92.7 0 128L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64l-37.5 0C269.4 26.7 233.8 0 192 0zm0 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM112 192l160 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
        {loading && (
          <div className="flex justify-start">
            <div className="bg-transparent text-black px-6 py-4 rounded-2xl border-black border-[3px] w-[60%] min-h-[60px] animate-pulse">
              Wait......
            </div>
          </div>
        )}
      </main>
      <footer
        className={`p-4 flex items-center gap-2 transition-all ${
          isSidebarOpen ? "blur-sm" : "md:w-[75%] md:ml-auto"
        }`}
      >
        <textarea
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          rows={1}
          placeholder="Ask me anything..."
          className="flex-1 field-sizing-content max-h-[150px] resize-none rounded-lg border-2 px-4 py-3 text-md focus:outline-none focus:ring-2 focus:ring-black bg-white text-black font-medium"
        />
        <button
          onClick={handleSend}
          className="text-md font-medium bg-[#88aaee] border-2 rounded-md border-black px-6 py-3 shadow-[4px_4px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
        >
          Send
        </button>
      </footer>
      <aside
        className={`fixed top-0 left-0 h-full w-[75%] md:w-[25%] flex flex-col bg-white transform transition-transform duration-300 z-30 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="cursor-pointer md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 100 100"
              className="text-black"
            >
              <g>
                <path
                  d="M 16.999688 10.000312 L 3 10.000312"
                  transform="matrix(4.166667,0,0,4.166667,0,0)"
                  fill="none"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 21 6 L 3 6"
                  transform="matrix(4.166667,0,0,4.166667,0,0)"
                  fill="none"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 21 13.999688 L 3 13.999688"
                  transform="matrix(4.166667,0,0,4.166667,0,0)"
                  fill="none"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 16.999688 18 L 3 18"
                  transform="matrix(4.166667,0,0,4.166667,0,0)"
                  fill="none"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-black">RevAI</h1>
        </div>
        <div className="bg-white flex flex-col gap-1 text-black p-2 overflow-y-auto">
          {models.map((model) => (
            <button
              key={model}
              onClick={() => setSelectedModel(model)}
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className={`${
                selectedModel === model
                  ? "bg-[#88aaee] border-2 rounded-md border-black shadow-[2px_2px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
                  : "bg-white text-gray-500 transition-all"
              } text-sm text-left p-2 rounded-lg cursor-pointer w-full`}
            >
              {model}
            </button>
          ))}
        </div>
      </aside>
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20"
        />
      )}
    </section>
  );
};

export default Chat;
