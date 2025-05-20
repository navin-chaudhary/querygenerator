// src/components/ChatBot.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Database,
  Trash2,
  ChevronUp,
  Info,
  Copy,
  Sparkles,
  LogOut,
} from "lucide-react";
import { Select, Tooltip } from "antd";
import axios from "axios";
import AuthForm from "./components/AuthForm";

const { Option } = Select;

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [schema, setSchema] = useState("");
  const [database, setDatabase] = useState("MongoDB");
  const [schemaSubmitted, setSchemaSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Check token and fetch messages on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:5005/api/auth/verify", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data.valid) {
            setIsAuthenticated(true);
            // Fetch stored messages
            fetchMessages(token);
          } else {
            localStorage.removeItem("token");
            setIsAuthenticated(false);
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        });
    }
  }, []);

  // Fetch messages from backend
  const fetchMessages = async (token) => {
    try {
      const res = await axios.get("http://localhost:5005/api/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(
        res.data.map((msg) => ({
          sender: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp,
        }))
      );
    } catch (error) {
      console.error('Fetch messages error:', error);
      showToastMessage("Failed to load chat history");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      inputRef.current?.focus();
    }
  }, [isAuthenticated]);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getInputPlaceholder = () => {
    if (!schemaSubmitted) {
      switch (database) {
        case "MongoDB":
          return "Enter MongoDB Schema (e.g., users: {name: String, age: Number, email: String})";
        case "PostgreSQL":
          return "Enter PostgreSQL Schema (e.g., CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(255), age INTEGER))";
        case "MySQL":
          return "Enter MySQL Schema (e.g., CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), age INT))";
        default:
          return "Enter your database schema";
      }
    }
    return `Type your ${database} query request in natural language...`;
  };

  const saveMessageToBackend = async (message, token) => {
    try {
      await axios.post(
        "http://localhost:5005/api/messages",
        {
          sender: message.sender,
          text: message.text,
          database,
          schema,
          timestamp: message.timestamp,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error('Save message error:', error);
      showToastMessage("Failed to save message");
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    const token = localStorage.getItem("token");

    if (!schemaSubmitted) {
      setSchema(input);
      setSchemaSubmitted(true);
      showToastMessage("Schema submitted successfully");

      const systemMessage = {
        sender: "system",
        text: `${database} schema has been set. You can now enter your query requests.`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, systemMessage]);
      await saveMessageToBackend(systemMessage, token);
      setInput("");
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      const userMessage = {
        sender: "user",
        text: input,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, userMessage]);
      await saveMessageToBackend(userMessage, token);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("http://localhost:5005/api/generate-query", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            database,
            schema,
            prompt: input,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to generate query");
        }

        const data = await res.json();
        const aiMessage = {
          sender: "bot",
          text: data.query || "No response from AI.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, aiMessage]);
        await saveMessageToBackend(aiMessage, token);
        setLoading(false);
      } catch (err) {
        console.error(err);
        const errorMessage = {
          sender: "bot",
          text: "❌ Failed to generate query. Please try again or check your connection.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, errorMessage]);
        await saveMessageToBackend(errorMessage, token);
        setLoading(false);
      }
    }
  };

  const resetAll = async () => {
    setMessages([]);
    setSchemaSubmitted(false);
    setSchema("");
    setDatabase("MongoDB");
    setInput("");
    showToastMessage("Reset successful");
    // Optionally clear messages in MongoDB
    try {
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:5000/api/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Clear messages error:', error);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const changeSchema = () => {
    setSchemaSubmitted(false);
    setInput(schema);
    showToastMessage("You can now edit the schema");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToastMessage("Copied to clipboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setMessages([]);
    setSchemaSubmitted(false);
    setSchema("");
    setDatabase("MongoDB");
    setInput("");
    showToastMessage("Logged out successfully");
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <AuthForm onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="max-w-6xl w-full mx-auto my-0 md:my-4 flex-1 flex flex-col overflow-hidden rounded-none md:rounded-2xl shadow-lg bg-gray-900">
        {showToast && (
          <div className="fixed top-4 right-4 left-4 md:left-auto md:w-64 bg-white text-gray-900 py-3 px-4 rounded-lg shadow-xl z-50 flex items-center justify-between animate-fade-in-down">
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}

        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 md:px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-6 w-6 text-indigo-200" />
              <h1 className="text-2xl font-bold">Database Query Assistant</h1>
            </div>
            <div className="flex space-x-2">
              <Tooltip title="Not implemented yet">
              <button
                className="p-2 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center"
                onClick={resetAll}
                aria-label="Reset everything"
                disabled={true}
                cursor="not-allowed"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              </Tooltip>
              {schemaSubmitted && (
                <button
                  className="p-2 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center"
                  onClick={changeSchema}
                  aria-label="Change schema"
                >
                  <ChevronUp className="h-5 w-5" />
                </button>
              )}
              <button
                className="p-2 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center"
                onClick={handleLogout}
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>

          {schemaSubmitted && (
            <div className="mt-4 py-3 px-4 bg-white/10 rounded-xl text-sm backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {database} schema is set successfully
                </span>
                <button
                  onClick={changeSchema}
                  className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors font-medium"
                >
                  Change
                </button>
              </div>
            </div>
          )}
        </div>

        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-900 space-y-6"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 flex-col p-4">
              <div className="bg-indigo-900/30 p-6 rounded-full mb-4">
                <Database className="h-12 w-12 text-indigo-400" />
              </div>
              <p className="text-center max-w-md text-gray-300">
                {!schemaSubmitted
                  ? `Start by selecting your database and submitting its schema below.`
                  : `Now, describe the query you need in natural language.`}
                <br />
                <span className="text-sm text-gray-400 mt-2 block">
                  The AI will help you generate the right {database} queries.
                </span>
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === "user"
                    ? "justify-end"
                    : message.sender === "system"
                    ? "justify-center"
                    : "justify-start"
                }`}
              >
                {message.sender === "system" ? (
                  <div className="bg-indigo-900/50 text-indigo-300 px-4 py-2 rounded-full text-sm font-medium">
                    {message.text}
                  </div>
                ) : (
                  <div
                    className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm
                      ${
                        message.sender === "user"
                          ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-none"
                          : "bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700"
                      }`}
                  >
                    <div className="mb-2 flex justify-between items-start gap-2">
                      <div
                        className={`text-xs px-2 py-1 rounded-full bg-opacity-20 font-medium inline-block
                        ${
                          message.sender === "user"
                            ? "bg-white/20"
                            : "bg-indigo-900/50 text-indigo-300"
                        }`}
                      >
                        {message.sender === "user" ? "You" : "AI"}
                      </div>
                      <div className="flex items-center space-x-2">
                        {message.sender === "bot" && (
                          <button
                            onClick={() => copyToClipboard(message.text)}
                            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                            aria-label="Copy to clipboard"
                          >
                            <Copy className="h-4 w-4 text-gray-400" />
                          </button>
                        )}
                        <span className="text-xs text-gray-400">
                          {message.timestamp}
                        </span>
                      </div>
                    </div>
                    <div className="whitespace-pre-wrap break-words text-sm md:text-base">
                      {message.text}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="pulse-loader">
                <div className="pulse-dot"></div>
                <div className="pulse-dot"></div>
                <div className="pulse-dot"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="border-t border-gray-800 p-4 md:p-6 bg-black">
          {!schemaSubmitted && (
            <div className="flex items-center mb-3 space-x-2">
              <Info className="h-5 w-5 text-indigo-200" />
              <span className="text-white text-sm font-medium">
                Select database and define schema
              </span>
            </div>
          )}

          {!schemaSubmitted && (
            <div className="mb-3">
              <Select
                value={database}
                onChange={setDatabase}
                className="w-full md:w-1/3"
                size="large"
                dropdownStyle={{ zIndex: 1050 }}
              >
                <Option value="MongoDB">MongoDB</Option>
                <Option value="PostgreSQL">PostgreSQL</Option>
                <Option value="MySQL">MySQL</Option>
              </Select>
            </div>
          )}

          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                placeholder={getInputPlaceholder()}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                className="w-full rounded-2xl border border-gray-700 p-4 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all text-white"
                style={{
                  minHeight: "52px",
                  height: input.split("\n").length > 3 ? "100px" : "auto",
                  maxHeight: "150px",
                  paddingRight: "4rem",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <button
                onClick={handleSubmit}
                className="absolute right-2 bottom-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white p-2 rounded-xl flex items-center justify-center h-10 w-10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!input.trim() || loading}
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <style>{`
          .pulse-loader {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          
          .pulse-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: rgba(99, 102, 241, 0.6);
            animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          .pulse-dot:nth-child(2) {
            animation-delay: 0.5s;
          }
          
          .pulse-dot:nth-child(3) {
            animation-delay: 1s;
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.5;
              transform: scale(0.8);
            }
          }
          
          @keyframes fade-in-down {
            0% {
              opacity: 0;
              transform: translateY(-10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in-down {
            animation: fade-in-down 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}

export default ChatBot;