import React from 'react';
import MoonIcon from '../assets/MoonIcon';
import SunIcon from '../assets/SunIcon';

const TopBar = ({ chatbotName, onLogout, onToggleTheme, theme, setPage, isAdmin }) => {
    return (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md">
            <div className="flex items-center">
                <h1 className="text-xl font-bold">{chatbotName}</h1>
                <span className="ml-4 text-green-500">● Online</span>
            </div>
            <div className="flex items-center space-x-4">
                 {isAdmin && (
                    <>
                        <button onClick={() => setPage('chat')} className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">Chat</button>
                        <button onClick={() => setPage('admin')} className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600">Admin</button>
                    </>
                )}
                <button onClick={onToggleTheme}>
                    {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
                </button>
                <button onClick={onLogout} className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">Logout</button>
            </div>
        </div>
    );
};

export default TopBar;
