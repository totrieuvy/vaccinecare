import React, { useState } from "react";
import { motion } from "framer-motion";
import VaccineSection from "../../../components/homepage/VaccineSection/VaccineSection";
import axios from "axios";

const HomePage = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  // State để quản lý trạng thái chat (mở/đóng và tin nhắn)
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Thay YOUR_API_KEY bằng API key thực tế của bạn
  const GEMINI_API_KEY = "AIzaSyC_mEsbT-IJDMESjDk05NCfIBx60_USwXA";
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const handleSendMessage = async () => {
    if (input.trim()) {
      // Thêm tin nhắn của người dùng vào danh sách
      const userMessage = { text: input, sender: "user" };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      try {
        // Gọi API Gemini
        const response = await axios.post(
          GEMINI_API_URL,
          {
            contents: [
              {
                parts: [{ text: input }],
              },
            ],
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // Lấy phản hồi từ API (giả định cấu trúc phản hồi)
        const aiResponseText = response.data.candidates[0]?.content?.parts[0]?.text || "Sorry, I couldn't respond.";
        const aiMessage = { text: aiResponseText, sender: "ai" };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        console.error("Error calling Gemini API:", error);
        const errorMessage = { text: "Error connecting to AI.", sender: "ai" };
        setMessages((prev) => [...prev, errorMessage]);
      }
    }
  };

  return (
    <div>
      {/* Các section hiện có */}
      <motion.section initial="hidden" animate="visible" variants={sectionVariants}>
        <img
          src="https://t3.ftcdn.net/jpg/04/78/50/80/360_F_478508020_FRSF7DMKj0oWDvlJDnQG0OXnazaZu1nz.jpg"
          alt="Placeholder"
          style={{ width: "100%", height: "500px", objectFit: "cover" }}
        />
      </motion.section>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "50px 100px",
          flexWrap: "wrap",
        }}
      >
        <motion.div
          style={{ maxWidth: "50%", flex: "1 1 300px" }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 style={{ fontSize: "32px", fontWeight: "bold" }}>Vaccines: A Shield for Your Child Future</h2>
          <p style={{ fontSize: "18px", lineHeight: "1.6", marginTop: "20px" }}>
            At Vaccine Care, we believe every child deserves a healthy start in life. Explore our resources to learn
            about recommended vaccines, their benefits, and how they work to protect your child from serious illnesses.
            Together, we can build a healthier tomorrow for all children.
          </p>
        </motion.div>

        <motion.div
          style={{ flex: "1 1 300px", textAlign: "right" }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <img
            src="https://static.vecteezy.com/system/resources/previews/004/698/308/non_2x/female-doctor-injecting-vaccine-to-patient-healthcare-and-medical-concept-drawn-cartoon-art-illustration-vector.jpg"
            alt="Placeholder"
            style={{ width: "100%", maxWidth: "500px", height: "auto" }}
          />
        </motion.div>
      </motion.section>

      <VaccineSection />

      {/* Chat UI */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        {/* Nút mở chat */}
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

        {/* Giao diện chat khi mở */}
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
            {/* Header */}
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
              <span>Chat With Vaccine Care AI Supporter</span>
              <button
                onClick={() => setIsChatOpen(false)}
                style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {/* Tin nhắn */}
            <div
              style={{
                flex: 1,
                padding: "10px",
                overflowY: "auto",
              }}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    textAlign: msg.sender === "user" ? "right" : "left",
                    margin: "10px 0",
                  }}
                >
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
            </div>

            {/* Input */}
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
    </div>
  );
};

export default HomePage;
