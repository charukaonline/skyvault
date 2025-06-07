import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Content = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check user role and redirect to appropriate content page
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (user.role === "creator") {
      navigate("/creator/content", { replace: true });
    } else if (user.role === "buyer") {
      navigate("/buyer/browse", { replace: true });
    } else if (user.role === "admin") {
      navigate("/admin/content", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
};

export default Content;
