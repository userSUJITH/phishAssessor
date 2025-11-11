import React, { useState, useRef, useEffect } from "react";

// --- SVG Icons ---
const ShieldCheckIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx={12} cy={7} r={4} />
  </svg>
);

const SendIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22 11 13 2 9 22 2z" />
  </svg>
);

// --- Main Chat Component ---
export default function App() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hello! I’m your Cybersecurity Assistant. Ask me anything about IOCs, malware, or threats.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const OPENROUTER_API_KEY = import.meta.env.VITE_API_KEY_1; 
console.log(OPENROUTER_API_KEY)
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault(); 
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const systemMessage = {
      role: "system",
      content: "You are a professional cybersecurity assistant.",
    };
    const apiMessages = [
      ...messages.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      })),
      { role: "user", content: input },
    ];

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [systemMessage, ...apiMessages],
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || "API request failed");
      }

      const data = await response.json();
      const botReply = data.choices[0].message.content;
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (err)
    {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `⚠️ Oops! Something went wrong: ${err.message}. Please check your API key or try again.`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    // Main container
    <div className="flex flex-col h-screen bg-[#1B1C1D] text-slate-200 font-sans">
      {/* Custom animation */}
      <style>{`
        @keyframes messageFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chat-message {
          animation: messageFadeIn 0.3s ease-out;
        }
      `}</style>

      {/* Header removed */}

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-6 pt-8 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-[#1B1C1D]">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 chat-message ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {/* Bot Avatar */}
            {msg.sender === "bot" && (
              <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center border border-slate-600">
                <ShieldCheckIcon className="w-5 h-5 text-blue-500" />
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-xl shadow-md text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-lg" 
                  : "bg-slate-800 text-slate-200 rounded-bl-lg border border-slate-700" 
              }`}
            >
              {/* Error text */}
              {msg.text.startsWith("⚠️") ? (
                <span className="text-red-400">{msg.text}</span>
              ) : (
                <pre className="font-sans whitespace-pre-wrap">{msg.text}</pre>
              )}
            </div>

            {/* User Avatar */}
            {msg.sender === "user" && (
              <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center border border-slate-600">
                <UserIcon className="w-5 h-5 text-slate-400" />
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start gap-3 chat-message">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center border border-slate-600">
              <ShieldCheckIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-800 px-4 py-3 rounded-xl rounded-bl-lg border border-slate-700">
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        )}
        
        {/* Scroll anchor */}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <footer className="bg-[#1B1C1D] border-t border-slate-700 p-4">
        <form onSubmit={handleSend} className="flex items-center max-w-3xl mx-auto gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about malware, IOCs, or any threat..."
            className="flex-1 bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </footer>
    </div>
  );
}   