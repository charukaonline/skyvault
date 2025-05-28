import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthenticatedUser = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            try {
                const userData = JSON.parse(user);

                // Redirect based on user role
                switch (userData.role) {
                    case 'admin':
                        navigate('/admin/dashboard', { replace: true });
                        break;
                    case 'creator':
                        navigate(`/creator/${userData.id}/${userData.email}`, { replace: true });
                        break;
                    case 'buyer':
                    default:
                        navigate(`/buyer/${userData.id}/${userData.email}`, { replace: true });
                        break;
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                // Clear invalid data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
    }, [navigate]);

    // If user is not authenticated, render the auth page
    return <>{children}</>;
};

export default AuthenticatedUser;