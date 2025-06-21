import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const ChatPage = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  
  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY; 

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "messages"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => a.createdAt.toMillis() - b.createdAt.toMillis());
        setMessages(msgs);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage = {
      text: input,
      sender: 'user',
      createdAt: new Date(),
    };
    
    setInput('');
    await addDoc(collection(db, "users", user.uid, "messages"), userMessage);
    
    setIsTyping(true);

    try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: input }] }] }),
          }
        );
        
        if (!response.ok) throw new Error('Failed to fetch from Gemini API');

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;

        const aiMessage = { text: aiText, sender: 'ai', createdAt: new Date() };
        await addDoc(collection(db, "users", user.uid, "messages"), aiMessage);

    } catch (error) {
        console.error("Error with Gemini API:", error);
        const errorMessage = {
            text: "Sorry, I'm having trouble connecting. Please try again later.",
            sender: 'ai',
            createdAt: new Date()
        };
        await addDoc(collection(db, "users", user.uid, "messages"), errorMessage);
    } finally {
        setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4">
      <div className="flex-1 overflow-y-auto space-y-4 pr-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                <div className="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
             </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex items-center mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-l-lg dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600">Send</button>
      </form>
      <style jsx>{`
        .typing-indicator span {
            height: 8px; width: 8px; background-color: #9E9EA1;
            border-radius: 50%; display: inline-block; margin: 0 2px;
            animation: bounce 1.2s infinite ease-in-out both;
        }
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1.0); }
        }
      `}</style>
    </div>
  );
};

export default ChatPage;