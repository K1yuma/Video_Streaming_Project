import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "flowbite-react";
import { HiPaperAirplane } from "react-icons/hi";

const ChatBox = ({ streamName, isStreamer = false }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLive, setIsLive] = useState(false);
  const messagesEndRef = useRef(null);
  
  const userName = useMemo(() => {
    if (isStreamer) return "Người Live";
    const savedName = sessionStorage.getItem("chat_user_name");
    if (savedName) return savedName;
    const newName = `Người xem ${Math.floor(Math.random() * 1000) + 1}`;
    sessionStorage.setItem("chat_user_name", newName);
    return newName;
  }, [isStreamer]);

  const scrollToBottom = (isNewMessage = false) => {
    if (isNewMessage) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [messages.length]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/v1/chat/${streamName}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Lỗi khi tải tin nhắn:", error);
    }
  };

  const checkLiveStatus = async () => {
    try {
      const response = await fetch(`/api/v1/chat/${streamName}/status`);
      if (response.ok) {
        const data = await response.json();
        setIsLive(data.live);
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái live:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    checkLiveStatus();
    const intervalMsg = setInterval(fetchMessages, 2000);
    const intervalStatus = setInterval(checkLiveStatus, 5000); // Kiểm tra status mỗi 5 giây
    return () => {
      clearInterval(intervalMsg);
      clearInterval(intervalStatus);
    };
  }, [streamName]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    const messageObj = {
      user: userName,
      text: newMessage,
      time: new Date().toLocaleTimeString(),
      isMe: true,
      isStreamer: isStreamer
    };

    try {
      const response = await fetch(`/api/v1/chat/${streamName}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageObj)
      });
      
      if (response.ok) {
        const updatedMessages = await response.json();
        setMessages(updatedMessages);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-300 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-100 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-black">Trò chuyện</h3>
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-600 animate-ping' : 'bg-gray-400'}`}></span>
            <span className="text-[10px] font-bold text-gray-600 uppercase">
              {isLive ? 'Trực tiếp' : 'Ngoại tuyến'}
            </span>
          </div>
        </div>
        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded font-bold uppercase">
          {userName}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] bg-white">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm italic mt-4 font-medium">Chưa có tin nhắn nào trong phòng này.</p>
        )}
        {messages.map((msg, index) => (
          <div key={msg.id || index} className="flex flex-col">
            <div className="flex items-baseline space-x-2">
              <span className={`font-black text-sm ${msg.isStreamer ? 'text-red-700' : (msg.user === userName ? 'text-blue-800' : 'text-green-800')}`}>
                {msg.user} {msg.isStreamer && "🔴"}
              </span>
              <span className="text-[10px] text-gray-500 font-bold">{msg.time}</span>
            </div>
            <p className="text-sm text-black font-semibold break-words bg-gray-50 p-2 rounded-lg mt-1 border border-gray-100">
              {msg.text}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 rounded-lg border border-gray-400 bg-white p-2 text-black font-bold focus:border-blue-600 focus:ring-blue-600"
            placeholder={isLive || !isStreamer ? "Nhập nội dung chat..." : "Luồng ngoại tuyến..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button type="submit" color="info" size="sm">
            <HiPaperAirplane className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
