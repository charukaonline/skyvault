import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    LogOut,
    Settings,
    User,
    ChevronDown,
    Search,
    Plus,
    Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const CreatorHeader = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifications, setNotifications] = useState(3);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/auth/login');
    };

    const handleQuickUpload = () => {
        navigate('/creator/upload');
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 shadow-lg z-50">
            <div className="flex items-center justify-between h-full px-6">
                {/* Left Section - Logo & Platform Name */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center">
                            <Camera className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">
                                SkyVault
                            </h1>
                            <p className="text-xs text-gray-400">Manage your content</p>
                        </div>
                    </div>
                </div>

                {/* Center Section - Search Bar */}
                <div className="flex-1 max-w-md mx-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search your content..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-200 placeholder-gray-500"
                        />
                    </div>
                </div>

                {/* Right Section - Actions & User Menu */}
                <div className="flex items-center space-x-4">
                    {/* Quick Upload Button */}
                    <Button
                        onClick={handleQuickUpload}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        size="sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Upload
                    </Button>

                    {/* Notifications */}
                    <div className="relative">
                        <button className="p-2 text-gray-400 hover:text-gray-200 hover:bg-slate-700 rounded-lg transition-colors">
                            <Bell className="w-5 h-5" />
                            {notifications > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {notifications}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center space-x-3 p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className="text-sm font-medium text-gray-200">
                                    {user?.name || 'Creator'}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {user?.email || 'creator@example.com'}
                                </p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>

                        {/* Dropdown Menu */}
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 z-10">
                                <div className="px-4 py-2 border-b border-slate-700">
                                    <p className="text-sm font-medium text-gray-200">{user?.name || 'Creator'}</p>
                                    <p className="text-xs text-gray-400">{user?.email || 'creator@example.com'}</p>
                                </div>

                                <button
                                    onClick={() => navigate('/creator/settings')}
                                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-slate-700"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span>Settings</span>
                                </button>

                                <button
                                    onClick={() => navigate('/creator/profile')}
                                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-slate-700"
                                >
                                    <User className="w-4 h-4" />
                                    <span>Profile</span>
                                </button>

                                <hr className="my-2 border-slate-700" />

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default CreatorHeader;