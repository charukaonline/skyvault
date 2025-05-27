import React from "react";
import { Button } from "@/components/ui/button";
import { Camera, Download, Shield, Star, Users, Zap } from "lucide-react";

const LandingPage = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Aerial Content
          <span className="block text-blue-400">Marketplace</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          The premier platform connecting drone content creators with businesses
          seeking high-quality aerial footage. License 4K videos and photos for
          your next project.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
          >
            <a href="/signup" className="flex items-center">
              Start Buying Content
              <Download className="ml-2 h-5 w-5" />
            </a>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white hover:text-slate-900 px-8 py-4 text-lg"
          >
            <a href="/signup" className="flex items-center">
              Sell Your Footage
              <Camera className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">4K+</div>
            <div className="text-gray-300">HD & 4K Content</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">500+</div>
            <div className="text-gray-300">Drone Creators</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">1000+</div>
            <div className="text-gray-300">Happy Buyers</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-800/50 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Why Choose SkyVault?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* For Buyers */}
            <div className="bg-slate-700/50 rounded-lg p-8 backdrop-blur-sm">
              <Download className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">
                For Buyers
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Browse categorized drone footage</li>
                <li>• Preview with watermark protection</li>
                <li>• Multiple licensing options</li>
                <li>• Secure bank transfer payments</li>
              </ul>
            </div>

            {/* For Creators */}
            <div className="bg-slate-700/50 rounded-lg p-8 backdrop-blur-sm">
              <Camera className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">
                For Creators
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Upload 4K/HD content</li>
                <li>• Set custom pricing</li>
                <li>• Track earnings & analytics</li>
                <li>• Manage license types</li>
              </ul>
            </div>

            {/* Security */}
            <div className="bg-slate-700/50 rounded-lg p-8 backdrop-blur-sm">
              <Shield className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">
                Secure Platform
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Manual payment verification</li>
                <li>• Content protection</li>
                <li>• Role-based access control</li>
                <li>• Admin moderation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-16">
            Perfect for Every Industry
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600/20 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Real Estate</h3>
              <p className="text-gray-400 text-sm">
                Showcase properties from above
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600/20 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Star className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Tourism</h3>
              <p className="text-gray-400 text-sm">
                Promote destinations beautifully
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600/20 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Marketing</h3>
              <p className="text-gray-400 text-sm">Create stunning campaigns</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600/20 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Camera className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Media</h3>
              <p className="text-gray-400 text-sm">
                Professional aerial footage
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600/10 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of creators and buyers in the world's leading aerial
            content marketplace.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
            >
              <a href="/signup">Start Your Journey</a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-slate-900 px-8 py-4 text-lg"
            >
              <a href="/login">Sign In</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
