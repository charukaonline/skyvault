import React from "react";
import { Camera } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 py-12 border-t border-slate-700">
      <div className="container mx-auto px-6 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Camera className="h-6 w-6 text-blue-400" />
          <span className="text-xl font-bold text-white">SkyVault</span>
        </div>
        <p className="text-gray-400">
          © 2024 SkyVault. All rights reserved. Aerial content marketplace.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
