import { useEffect, useState } from "react";
import { db, ref, push, onValue, serverTimestamp, set, remove } from "../config/firebase";
import { useSelector } from "react-redux";
import "./ChatRoom.scss";

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const user = useSelector((state) => state?.user);

  useEffect(() => {
    const chatRef = ref(db, "chats/admin_manager");
    const typingRef = ref(db, "typing/admin_manager");

    onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      const messagesArray = data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : [];
      setMessages(messagesArray);
    });

    onValue(typingRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const typingArray = Object.keys(data)
          .filter((key) => data[key].isTyping && key !== user?.userName)
          .map((key) => data[key].userName);
        setTypingUsers(typingArray);
      } else {
        setTypingUsers([]);
      }
    });

    return () => {};
  }, [user?.userName]);

  const handleTyping = (e) => {
    setText(e.target.value);
    const typingRef = ref(db, `typing/admin_manager/${user?.userName}`);
    set(typingRef, {
      userName: user?.userName,
      isTyping: e.target.value.length > 0,
      timestamp: serverTimestamp(),
    });
  };

  const sendMessage = async () => {
    if (text.trim()) {
      await push(ref(db, "chats/admin_manager"), {
        sender: user?.userName || "Unknown",
        role: user?.roleName,
        text,
        timestamp: serverTimestamp(),
      });
      const typingRef = ref(db, `typing/admin_manager/${user?.userName}`);
      await set(typingRef, null);
      setText("");
    }
  };

  // Xóa với bạn (chỉ xóa ở phía client)
  const deleteForMe = (messageId) => {
    setMessages(messages.filter((msg) => msg.id !== messageId));
  };

  // Xóa với mọi người (xóa trên Firebase)
  const deleteForEveryone = async (messageId) => {
    const messageRef = ref(db, `chats/admin_manager/${messageId}`);
    await remove(messageRef);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="chat-room">
      <h2>Chat giữa Admin & Manager</h2>
      <div className="messages-container">
        {messages.map((msg) => {
          const isCurrentUser = msg.sender === user?.userName;
          return (
            <div key={msg.id} className={`message-wrapper ${isCurrentUser ? "current-user" : "other-user"}`}>
              <div className="message">
                <p>
                  <strong className={msg.role === "admin" ? "admin" : "manager"}>
                    {msg.sender} ({msg.role}):
                  </strong>{" "}
                  {msg.text}
                </p>
                <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
                {isCurrentUser && (
                  <div className="message-actions">
                    <button className="delete-for-me" onClick={() => deleteForMe(msg.id)}>
                      Xóa với tôi
                    </button>
                    <button className="delete-for-everyone" onClick={() => deleteForEveryone(msg.id)}>
                      Xóa với mọi người
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {typingUsers.length > 0 && <div className="typing-indicator">{typingUsers.join(", ")} is typing...</div>}
      <div className="input-container">
        <input type="text" value={text} onChange={handleTyping} placeholder="Nhập tin nhắn..." />
        <button onClick={sendMessage}>Gửi</button>
      </div>
    </div>
  );
};

export default ChatRoom;
