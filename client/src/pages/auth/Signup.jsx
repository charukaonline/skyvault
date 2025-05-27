import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, User } from "lucide-react";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleToggle = (role) => {
    setFormData({
      ...formData,
      role,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log("Registration successful:", data);
        // TODO: Redirect to dashboard based on role
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Camera className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">SkyVault</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Join SkyVault
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Create your account to start buying or selling drone footage
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Role Selection Toggle */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">
              I want to join as:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleToggle("buyer")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.role === "buyer"
                    ? "border-blue-500 bg-blue-900/30 text-blue-300"
                    : "border-slate-600 bg-slate-800 text-gray-300 hover:border-slate-500"
                }`}
              >
                <User className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Buyer</div>
                <div className="text-xs text-gray-400">
                  Purchase drone footage
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleToggle("creator")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.role === "creator"
                    ? "border-blue-500 bg-blue-900/30 text-blue-300"
                    : "border-slate-600 bg-slate-800 text-gray-300 hover:border-slate-500"
                }`}
              >
                <Camera className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Creator</div>
                <div className="text-xs text-gray-400">
                  Sell your drone footage
                </div>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-slate-600 bg-slate-800 placeholder-gray-400 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Full name"
              />
            </div>
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-slate-600 bg-slate-800 placeholder-gray-400 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-slate-600 bg-slate-800 placeholder-gray-400 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
              />
            </div>
            <div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-slate-600 bg-slate-800 placeholder-gray-400 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm password"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-400">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-medium text-blue-400 hover:text-blue-300"
              >
                Sign in
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
