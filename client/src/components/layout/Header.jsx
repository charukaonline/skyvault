import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Menu, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to="/">
            <Camera className="h-8 w-8 text-blue-400" />
          </Link>
          <Link to="/" className="text-2xl font-bold text-white">
            SkyVault
          </Link>
        </div>
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
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
        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded hover:bg-slate-800 transition"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Open menu"
        >
          {mobileOpen ? (
            <X className="h-7 w-7 text-white" />
          ) : (
            <Menu className="h-7 w-7 text-white" />
          )}
        </button>
      </div>
      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden mt-3 bg-slate-900 rounded-lg shadow-lg py-4 px-4 flex flex-col gap-3 animate-fade-in">
          <Link
            to="/"
            className="text-white hover:text-blue-400 font-medium transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/explore"
            className="text-white hover:text-blue-400 font-medium transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Explore Contents
          </Link>
          <Button
            variant="ghost"
            className="text-white hover:text-blue-400 w-full justify-start"
            onClick={() => {
              setMobileOpen(false);
              navigate("/auth/login");
            }}
          >
            Sign In
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            onClick={() => {
              setMobileOpen(false);
              navigate("/auth/signup");
            }}
          >
            Get Started
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Header;
