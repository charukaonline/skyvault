import React, { useEffect, useState } from 'react';
import { Camera, Upload, DollarSign, Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import CreatorHeader from '@/components/creatorDashboard/CreatorHeader';
import CreatorSideBar from '@/components/creatorDashboard/CreatorSideBar';

const CreatorDashboard = () => {
    const navigate = useNavigate();
    const { userId, email } = useParams();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);

                // Validate URL parameters
                if (userId !== parsedUser.id || email !== parsedUser.email) {
                    navigate(`/creator/${parsedUser.id}/${parsedUser.email}`, { replace: true });
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                navigate('/auth/login', { replace: true });
            }
        }
    }, [userId, email, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <CreatorHeader />
            <CreatorSideBar />
            
            {/* Main Content Area */}
            <main className="ml-64 pt-16 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-200 mb-2">Welcome back, {user?.name || 'Creator'}!</h1>
                        <p className="text-gray-400">Here's an overview of your drone content performance</p>
                    </div>
                    
                    {/* Dashboard content will go here */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Quick stats cards will be added here */}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreatorDashboard;
