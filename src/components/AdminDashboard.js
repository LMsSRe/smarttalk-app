import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatLogs, setChatLogs] = useState([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
        const usersCol = collection(db, "users");
        const userSnapshot = await getDocs(usersCol);
        const userList = userSnapshot.docs.map(doc => ({ id: doc.id }));
        setUsers(userList); 
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;

    const q = query(collection(db, "users", selectedUser, "messages"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const logs = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})).sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
        setChatLogs(logs);
    });

    return () => unsubscribe();
  }, [selectedUser]);

  const dailyActiveUsers = users.length; 
  const totalMessages = chatLogs.length; 

  return (
    <div className="flex h-full">
        <div className="w-1/3 p-4 border-r dark:border-gray-700 overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Users</h2>
            <ul>
                {users.map(user => (
                    <li key={user.id} onClick={() => setSelectedUser(user.id)} className={`p-2 cursor-pointer rounded ${selectedUser === user.id ? 'bg-blue-200 dark:bg-blue-800' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                        User ID: {user.id.substring(0, 10)}...
                    </li>
                ))}
            </ul>
        </div>
        <div className="w-2/3 p-4 flex flex-col">
            <h2 className="text-lg font-bold mb-4">Analytics & Logs</h2>
             <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-gray-200 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-bold">Total Users</h3>
                    <p className="text-2xl">{dailyActiveUsers}</p>
                </div>
                 <div className="p-4 bg-gray-200 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-bold">Message Volume (Selected User)</h3>
                    <p className="text-2xl">{totalMessages}</p>
                </div>
            </div>
            <h3 className="font-bold mb-2">Chat Logs for {selectedUser ? `User ${selectedUser.substring(0,10)}...` : '...'}</h3>
            <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-700">
                {chatLogs.map(log => (
                     <div key={log.id} className={`mb-2 text-sm p-2 rounded ${log.sender === 'user' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        <strong>{log.sender}:</strong> {log.text}
                     </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default AdminDashboard;
