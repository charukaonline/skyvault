import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

const ProtectedRoutes = ({ children, allowedRoles = [] }) => {
  const navigate = useNavigate();
  const { userId, email } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (!token || !user) {
        // No authentication data, redirect to login
        navigate("/auth/login", { replace: true });
        return;
      }

      try {
        const userData = JSON.parse(user);

        // For admin routes, no URL parameters needed
        if (userData.role === "admin" && allowedRoles.includes("admin")) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // Validate URL parameters match user data for non-admin routes
        if (
          userId &&
          email &&
          (userId !== userData.id || email !== userData.email)
        ) {
          // URL doesn't match user data, redirect to correct URL
          switch (userData.role) {
            case "admin":
              navigate("/admin/dashboard", { replace: true });
              break;
            case "creator":
              navigate(`/creator/${userData.id}/${userData.email}`, {
                replace: true,
              });
              break;
            case "buyer":
            default:
              navigate(`/buyer/${userData.id}/${userData.email}`, {
                replace: true,
              });
              break;
          }
          return;
        }

        // Check if user role is allowed for this route
        if (allowedRoles.length > 0 && !allowedRoles.includes(userData.role)) {
          // User role not allowed, redirect to appropriate dashboard
          switch (userData.role) {
            case "admin":
              navigate("/admin/dashboard", { replace: true });
              break;
            case "creator":
              // Check if creator is approved before redirecting
              if (userData.approved === false) {
                // Creator not approved, redirect to login with message
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/auth/login", { replace: true });
                return;
              }
              navigate(`/creator/${userData.id}/${userData.email}`, {
                replace: true,
              });
              break;
            case "buyer":
            default:
              navigate(`/buyer/${userData.id}/${userData.email}`, {
                replace: true,
              });
              break;
          }
          return;
        }

        // Additional check for creators accessing creator routes
        if (
          userData.role === "creator" &&
          allowedRoles.includes("creator") &&
          userData.approved === false
        ) {
          // Creator not approved, clear session and redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/auth/login", { replace: true });
          return;
        }

        // User is authenticated and authorized
        setIsAuthorized(true);
      } catch (error) {
        console.error("Error parsing user data:", error);
        // Clear invalid data and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/auth/login", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, allowedRoles, userId, email]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect, so don't render anything
  }

  return <>{children}</>;
};

export default ProtectedRoutes;
