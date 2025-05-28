import React, { useEffect, useState } from 'react';
import { Camera, Upload, DollarSign, Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';

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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth/login', { replace: true });
    };

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            className="text-gray-400 hover:text-white"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>
        </div>
    );
};

export default CreatorDashboard;
