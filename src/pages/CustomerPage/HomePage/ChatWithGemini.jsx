import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useSelector } from "react-redux";

const ChatWithGemini = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const { userId } = useSelector((state) => state.user);
  const messagesEndRef = useRef(null); // Tạo ref để tham chiếu đến phần tử chứa tin nhắn

  // Hàm cuộn xuống dưới cùng
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Lấy lịch sử chat từ backend khi component mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get(`https://swd392-chat.onrender.com/chat/history/${userId}`);
        if (response.data && response.data.messages) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    if (userId) {
      fetchChatHistory();
    }
  }, [userId]);

  // Cuộn xuống dưới cùng mỗi khi messages thay đổi hoặc khi mở chat
  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  // Gửi tin nhắn và gọi API Gemini qua backend
  const handleSendMessage = async () => {
    if (input.trim()) {
      const userMessage = {
        text: input,
        sender: "user",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      try {
        const response = await axios.post("https://swd392-chat.onrender.com/chat", {
          userId,
          message: input,
        });

        const aiMessage = {
          text: response.data.text,
          sender: "ai",
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        console.error("Error calling backend API:", error);
        const errorMessage = {
          text: "Error connecting to AI.",
          sender: "ai",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000 }}>
      {!isChatOpen && (
        <motion.button
          onClick={() => setIsChatOpen(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
          }}
        >
          💬
        </motion.button>
      )}

      {isChatOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          style={{
            width: "300px",
            height: "400px",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "10px",
              backgroundColor: "#007bff",
              color: "white",
              borderTopLeftRadius: "10px",
              borderTopRightRadius: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Chat with Vaccinecare AI</span>
            <button
              onClick={() => setIsChatOpen(false)}
              style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
            {messages.map((msg, index) => (
              <div key={index} style={{ textAlign: msg.sender === "user" ? "right" : "left", margin: "10px 0" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    backgroundColor: msg.sender === "user" ? "#007bff" : "#e9ecef",
                    color: msg.sender === "user" ? "white" : "black",
                    borderRadius: "10px",
                    maxWidth: "80%",
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} /> {/* Thêm div này để làm điểm neo cho việc cuộn */}
          </div>

          <div style={{ padding: "10px", display: "flex" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
              placeholder="Type a message..."
            />
            <button
              onClick={handleSendMessage}
              style={{
                marginLeft: "10px",
                padding: "8px 12px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ChatWithGemini;
