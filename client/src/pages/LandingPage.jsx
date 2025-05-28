import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Download,
  Shield,
  Star,
  Users,
  Zap,
  ArrowRight,
  Play,
  Plane,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [statsVisible, setStatsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    content: 0,
    creators: 0,
    buyers: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setStatsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (statsVisible) {
      const animateStats = () => {
        const targets = { content: 4000, creators: 500, buyers: 1000 };
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;

        let currentStep = 0;
        const timer = setInterval(() => {
          currentStep++;
          const progress = currentStep / steps;

          setAnimatedStats({
            content: Math.floor(targets.content * progress),
            creators: Math.floor(targets.creators * progress),
            buyers: Math.floor(targets.buyers * progress),
          });

          if (currentStep >= steps) clearInterval(timer);
        }, interval);
      };
      animateStats();
    }
  }, [statsVisible]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative container mx-auto px-6 py-20 text-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>

        {/* Flying Drone Animation */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Camera 1 - Large orbit */}
          <div className="drone-container-1">
            <div className="drone-path-1">
              <Camera className="h-12 w-12 text-blue-400 opacity-60 drone-icon" />
            </div>
          </div>

          {/* Camera 2 - Medium orbit, opposite direction */}
          <div className="drone-container-2">
            <div className="drone-path-2">
              <Camera className="h-8 w-8 text-cyan-400 opacity-40 drone-icon" />
            </div>
          </div>

          {/* Camera 3 - Small orbit, fast */}
          <div className="drone-container-3">
            <div className="drone-path-3">
              <Camera className="h-6 w-6 text-purple-400 opacity-50 drone-icon" />
            </div>
          </div>

          {/* Camera 4 - Large elliptical orbit */}
          <div className="drone-container-4">
            <div className="drone-path-4">
              <Camera className="h-10 w-10 text-blue-300 opacity-30 drone-icon" />
            </div>
          </div>
        </div>

        {/* Add drone animation styles */}
        <style jsx>{`
          /* Camera 1 - Large circular orbit covering full width */
          .drone-container-1 {
            position: absolute;
            top: 10%;
            left: 10%;
            width: 80%;
            height: 80%;
            transform: translate(0, 0);
          }

          .drone-path-1 {
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            animation: rotatePath1 20s linear infinite;
          }

          /* Camera 2 - Medium orbit, upper area */
          .drone-container-2 {
            position: absolute;
            top: 5%;
            left: 20%;
            width: 60%;
            height: 50%;
            transform: translate(0, 0);
          }

          .drone-path-2 {
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            animation: rotatePath2 15s linear infinite reverse;
          }

          /* Camera 3 - Small fast orbit, lower right */
          .drone-container-3 {
            position: absolute;
            top: 60%;
            left: 60%;
            width: 35%;
            height: 35%;
            transform: translate(0, 0);
          }

          .drone-path-3 {
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            animation: rotatePath3 10s linear infinite;
          }

          /* Camera 4 - Large elliptical orbit spanning full section */
          .drone-container-4 {
            position: absolute;
            top: 15%;
            left: 5%;
            width: 90%;
            height: 70%;
            transform: translate(0, 0);
          }

          .drone-path-4 {
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            animation: rotatePath4 25s linear infinite;
          }

          .drone-icon {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            animation: rotateDrone 20s linear infinite,
              droneFloat 3s ease-in-out infinite;
            filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.5));
          }

          @keyframes rotatePath1 {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes rotatePath2 {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes rotatePath3 {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes rotatePath4 {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes rotateDrone {
            from {
              transform: translateX(-50%) rotate(0deg);
            }
            to {
              transform: translateX(-50%) rotate(-360deg);
            }
          }

          @keyframes droneFloat {
            0%,
            100% {
              transform: translateX(-50%) translateY(0) scale(1);
            }
            50% {
              transform: translateX(-50%) translateY(-10px) scale(1.1);
            }
          }

          @media (max-width: 768px) {
            .drone-container-1 {
              top: 15%;
              left: 15%;
              width: 70%;
              height: 70%;
            }
            .drone-container-2 {
              top: 10%;
              left: 25%;
              width: 50%;
              height: 40%;
            }
            .drone-container-3 {
              top: 65%;
              left: 65%;
              width: 30%;
              height: 30%;
            }
            .drone-container-4 {
              top: 20%;
              left: 10%;
              width: 80%;
              height: 60%;
            }

            .drone-container-1 .drone-icon {
              width: 32px;
              height: 32px;
            }
            .drone-container-2 .drone-icon {
              width: 24px;
              height: 24px;
            }
            .drone-container-3 .drone-icon {
              width: 20px;
              height: 20px;
            }
            .drone-container-4 .drone-icon {
              width: 28px;
              height: 28px;
            }
          }
        `}</style>

        <div className="relative z-10">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Aerial Content
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 animate-gradient-x">
                Marketplace
              </span>
            </h1>
          </div>

          <div className="animate-fade-in-up delay-300">
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              The premier platform connecting drone content creators with
              businesses seeking high-quality aerial footage. License 4K videos
              and photos for your next project.
            </p>
          </div>

          <div className="animate-fade-in-up delay-500">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                onClick={() => navigate("/")}
              >
                Start Buying Content
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="group border-2 border-white/30 text-white hover:bg-white hover:text-slate-900 px-8 py-4 text-lg backdrop-blur-sm transition-all duration-300 transform hover:scale-105"
                onClick={() => navigate("/auth/signup")}
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                Sell Your Footage
              </Button>
            </div>
          </div>

          {/* Animated Stats */}
          <div className="animate-fade-in-up delay-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="group text-center p-6 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-slate-600/30 hover:border-blue-400/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2 transition-all duration-300">
                  {animatedStats.content.toLocaleString()}+
                </div>
                <div className="text-gray-300 group-hover:text-blue-300 transition-colors duration-300">
                  HD & 4K Content
                </div>
              </div>
              <div className="group text-center p-6 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-slate-600/30 hover:border-blue-400/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2 transition-all duration-300">
                  {animatedStats.creators.toLocaleString()}+
                </div>
                <div className="text-gray-300 group-hover:text-blue-300 transition-colors duration-300">
                  Drone Creators
                </div>
              </div>
              <div className="group text-center p-6 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-slate-600/30 hover:border-blue-400/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2 transition-all duration-300">
                  {animatedStats.buyers.toLocaleString()}+
                </div>
                <div className="text-gray-300 group-hover:text-blue-300 transition-colors duration-300">
                  Happy Buyers
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 py-20 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="animate-fade-in-up">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              Why Choose{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                SkyVault
              </span>
              ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* For Buyers */}
            <div className="group animate-fade-in-up delay-100">
              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-8 backdrop-blur-sm border border-slate-600/30 hover:border-blue-400/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl h-full">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-lg w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Download className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-blue-300 transition-colors duration-300">
                  For Buyers
                </h3>
                <ul className="text-gray-300 space-y-3">
                  <li className="flex items-center hover:text-blue-300 transition-colors duration-300">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Browse categorized drone footage
                  </li>
                  <li className="flex items-center hover:text-blue-300 transition-colors duration-300">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Preview with watermark protection
                  </li>
                  <li className="flex items-center hover:text-blue-300 transition-colors duration-300">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Multiple licensing options
                  </li>
                  <li className="flex items-center hover:text-blue-300 transition-colors duration-300">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Secure bank transfer payments
                  </li>
                </ul>
              </div>
            </div>

            {/* For Creators */}
            <div className="group animate-fade-in-up delay-200">
              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-8 backdrop-blur-sm border border-slate-600/30 hover:border-blue-400/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl h-full">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-purple-300 transition-colors duration-300">
                  For Creators
                </h3>
                <ul className="text-gray-300 space-y-3">
                  <li className="flex items-center hover:text-purple-300 transition-colors duration-300">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                    Upload 4K/HD content
                  </li>
                  <li className="flex items-center hover:text-purple-300 transition-colors duration-300">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                    Set custom pricing
                  </li>
                  <li className="flex items-center hover:text-purple-300 transition-colors duration-300">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                    Track earnings & analytics
                  </li>
                  <li className="flex items-center hover:text-purple-300 transition-colors duration-300">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                    Manage license types
                  </li>
                </ul>
              </div>
            </div>

            {/* Security */}
            <div className="group animate-fade-in-up delay-300">
              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-8 backdrop-blur-sm border border-slate-600/30 hover:border-green-400/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl h-full">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-lg w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-green-300 transition-colors duration-300">
                  Secure Platform
                </h3>
                <ul className="text-gray-300 space-y-3">
                  <li className="flex items-center hover:text-green-300 transition-colors duration-300">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Manual payment verification
                  </li>
                  <li className="flex items-center hover:text-green-300 transition-colors duration-300">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Content protection
                  </li>
                  <li className="flex items-center hover:text-green-300 transition-colors duration-300">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Role-based access control
                  </li>
                  <li className="flex items-center hover:text-green-300 transition-colors duration-300">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Admin moderation
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="animate-fade-in-up">
            <h2 className="text-4xl font-bold text-white mb-16">
              Perfect for Every{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Industry
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: "Real Estate",
                desc: "Showcase properties from above",
                color: "from-blue-500 to-cyan-500",
                delay: "delay-100",
              },
              {
                icon: Star,
                title: "Tourism",
                desc: "Promote destinations beautifully",
                color: "from-purple-500 to-pink-500",
                delay: "delay-200",
              },
              {
                icon: Zap,
                title: "Marketing",
                desc: "Create stunning campaigns",
                color: "from-orange-500 to-red-500",
                delay: "delay-300",
              },
              {
                icon: Camera,
                title: "Media",
                desc: "Professional aerial footage",
                color: "from-green-500 to-emerald-500",
                delay: "delay-400",
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`group text-center animate-fade-in-up ${item.delay}`}
              >
                <div className="relative mb-6">
                  <div
                    className={`bg-gradient-to-r ${item.color} rounded-full p-6 w-20 h-20 mx-auto flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-2xl`}
                  >
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-full opacity-20 blur-xl transform scale-150 group-hover:scale-[2] transition-all duration-500`}
                  ></div>
                </div>
                <h3 className="text-white font-semibold mb-2 text-lg group-hover:text-blue-300 transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-blue-600/20 to-purple-600/20 py-20 backdrop-blur-sm overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delayed"></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="animate-fade-in-up">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Get{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Started
              </span>
              ?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of creators and buyers in the world's leading
              aerial content marketplace.
            </p>
          </div>

          <div className="animate-fade-in-up delay-300">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                onClick={() => navigate("/auth/signup")}
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="group border-2 border-white/30 text-white hover:bg-white hover:text-slate-900 px-8 py-4 text-lg backdrop-blur-sm transition-all duration-300 transform hover:scale-105"
                onClick={() => navigate("/auth/login")}
              >
                Sign In
                <Users className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
