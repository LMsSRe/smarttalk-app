import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase/config';

import AuthPage from './components/AuthPage';
import TopBar from './components/TopBar';
import ChatPage from './components/ChatPage';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [page, setPage] = useState('chat'); // 'chat', 'admin'
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        setIsAdmin(adminDoc.exists());
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  if (loading) {
    return <div>Loading...</div>; // Or a proper spinner component
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <TopBar chatbotName="SmartTalk" onLogout={() => signOut(auth)} onToggleTheme={toggleTheme} theme={theme} setPage={setPage} isAdmin={isAdmin} />
        {page === 'chat' ? <ChatPage user={user} /> : <AdminDashboard />}
      </div>
    </div>
  );
}