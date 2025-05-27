import React from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

const Header = () => {
  return (
    <nav className="container mx-auto px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Camera className="h-8 w-8 text-blue-400" />
          <a href="/" className="text-2xl font-bold text-white">
            SkyVault
          </a>
        </div>
        <div className="flex space-x-4">
          <Button variant="ghost" className="text-white hover:text-blue-400">
            <a href="/login">Sign In</a>
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <a href="/signup">Get Started</a>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
