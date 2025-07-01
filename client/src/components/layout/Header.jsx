import React from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <nav className="container mx-auto px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to="/">
            <Camera className="h-8 w-8 text-blue-400" />
          </Link>
          <Link to="/" className="text-2xl font-bold text-white">
            SkyVault
          </Link>
        </div>
        {/* Navigation Menu */}
        <div className="flex items-center space-x-6">
          <Link
            to="/"
            className="text-white hover:text-blue-400 font-medium transition-colors"
          >
            Home
          </Link>
          <Link
            to="/explore"
            className="text-white hover:text-blue-400 font-medium transition-colors"
          >
            Explore Contents
          </Link>
          <Button
            variant="ghost"
            className="text-white hover:text-blue-400"
            onClick={() => navigate("/auth/login")}
          >
            Sign In
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => navigate("/auth/signup")}
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
