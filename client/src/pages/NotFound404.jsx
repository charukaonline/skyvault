import React from "react";
import { Button } from "@/components/ui/button";
import { Camera, Home, ArrowLeft, Search, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound404 = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* 404 Hero Section */}
      <section className="relative container mx-auto px-6 py-20 text-center overflow-hidden min-h-screen flex items-center justify-center">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-red-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>

        {/* Flying Drone Animation - Lost Drones */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Lost Camera 1 - Erratic movement */}
          <div className="drone-container-lost-1">
            <div className="drone-path-lost-1">
              <Camera className="h-10 w-10 text-red-400 opacity-60 drone-icon-lost" />
            </div>
          </div>

          {/* Lost Camera 2 - Searching pattern */}
          <div className="drone-container-lost-2">
            <div className="drone-path-lost-2">
              <Camera className="h-8 w-8 text-orange-400 opacity-40 drone-icon-lost" />
            </div>
          </div>

          {/* Lost Camera 3 - Confused orbit */}
          <div className="drone-container-lost-3">
            <div className="drone-path-lost-3">
              <Camera className="h-6 w-6 text-yellow-400 opacity-50 drone-icon-lost" />
            </div>
          </div>
        </div>

        {/* Lost drone animation styles */}
        <style jsx>{`
          /* Lost Camera 1 - Erratic zigzag movement */
          .drone-container-lost-1 {
            position: absolute;
            top: 20%;
            left: 20%;
            width: 60%;
            height: 40%;
            transform: translate(0, 0);
          }

          .drone-path-lost-1 {
            position: relative;
            width: 100%;
            height: 100%;
            animation: lostPath1 8s ease-in-out infinite;
          }

          /* Lost Camera 2 - Searching back and forth */
          .drone-container-lost-2 {
            position: absolute;
            top: 40%;
            left: 10%;
            width: 80%;
            height: 20%;
            transform: translate(0, 0);
          }

          .drone-path-lost-2 {
            position: relative;
            width: 100%;
            height: 100%;
            animation: lostPath2 6s linear infinite;
          }

          /* Lost Camera 3 - Confused circular orbit */}
          .drone-container-lost-3 {
            position: absolute;
            top: 60%;
            left: 60%;
            width: 30%;
            height: 30%;
            transform: translate(0, 0);
          }

          .drone-path-lost-3 {
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            animation: lostPath3 4s ease-in-out infinite alternate;
          }

          .drone-icon-lost {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            animation: lostDrone 2s ease-in-out infinite,
              droneGlitch 0.5s ease-in-out infinite;
            filter: drop-shadow(0 0 15px rgba(239, 68, 68, 0.6));
          }

          @keyframes lostPath1 {
            0% { transform: translateX(0) translateY(0); }
            25% { transform: translateX(100px) translateY(-50px); }
            50% { transform: translateX(-50px) translateY(50px); }
            75% { transform: translateX(80px) translateY(30px); }
            100% { transform: translateX(0) translateY(0); }
          }

          @keyframes lostPath2 {
            0% { transform: translateX(0); }
            50% { transform: translateX(100%); }
            100% { transform: translateX(0); }
          }

          @keyframes lostPath3 {
            from { transform: rotate(0deg) scale(1); }
            to { transform: rotate(180deg) scale(1.2); }
          }

          @keyframes lostDrone {
            0%, 100% {
              transform: translateX(-50%) rotate(0deg);
            }
            50% {
              transform: translateX(-50%) rotate(15deg);
            }
          }

          @keyframes droneGlitch {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 0.3; }
          }

          @media (max-width: 768px) {
            .drone-container-lost-1 {
              top: 25%;
              left: 25%;
              width: 50%;
              height: 30%;
            }
            .drone-container-lost-2 {
              top: 45%;
              left: 15%;
              width: 70%;
              height: 15%;
            }
            .drone-container-lost-3 {
              top: 65%;
              left: 65%;
              width: 25%;
              height: 25%;
            }

            .drone-container-lost-1 .drone-icon-lost {
              width: 28px;
              height: 28px;
            }
            .drone-container-lost-2 .drone-icon-lost {
              width: 24px;
              height: 24px;
            }
            .drone-container-lost-3 .drone-icon-lost {
              width: 20px;
              height: 20px;
            }
          }
        `}</style>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="animate-fade-in-up">
            {/* 404 Number */}
            <div className="text-9xl md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 mb-6 leading-none animate-gradient-x">
              404
            </div>
          </div>

          <div className="animate-fade-in-up delay-300">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Drone Signal
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                Lost
              </span>
            </h1>
          </div>

          <div className="animate-fade-in-up delay-500">
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Oops! Our aerial scouts couldn't locate the page you're looking for.
              It seems to have drifted beyond our flight path. Let's navigate you back to familiar skies.
            </p>
          </div>

          <div className="animate-fade-in-up delay-900">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                onClick={() => navigate("/")}
              >
                <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                Return Home
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default NotFound404;
