import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am your cybersecurity assistant. Ask me about IOCs, malware, or threats." },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const OPENROUTER_API_KEY = "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"; 
  const chatEndRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a professional cybersecurity assistant." },
            ...messages.map((m) => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.text,
            })),
            { role: "user", content: input },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const botReply = res.data.choices[0].message.content;
      console.log(res.data)
      // console.log(res.choices[0].message.content)
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Oops! Something went wrong. Please try again." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50">
      {/* Header */}
      {/* <div className="bg-indigo-600 text-white py-4 px-6 shadow-md flex items-center justify-between">
        <h1 className="text-xl font-bold">Cybersecurity Assistant</h1>
        <span className="text-sm opacity-70">Powered by OpenRouter AI</span>
      </div> */}

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex flex-col">
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg break-words ${
                msg.sender === "user"
                  ? "self-end bg-indigo-600 text-white rounded-tr-none"
                  : "self-start bg-gray-200 text-gray-800 rounded-tl-none"
              }`}
            >
              {msg.text}
            </div>
            <span className={`text-xs mt-1 ${msg.sender === "user" ? "self-end text-gray-400" : "self-start text-gray-500"}`}>
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce delay-150"></div>
            <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce delay-300"></div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="sticky bottom-0 bg-white border-t border-gray-300 flex items-center px-6 py-4 space-x-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about malware, IOCs, or threats..."
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
