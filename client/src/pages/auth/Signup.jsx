import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/contexts/NotificationContext";
import { Camera, User, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    if (name.trim().length > 50) return "Name must not exceed 50 characters";
    if (!/^[a-zA-Z\s]+$/.test(name.trim()))
      return "Name can only contain letters and spaces";
    return "";
  };

  const validateEmail = (email) => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password.length > 128) return "Password must not exceed 128 characters";
    if (!/(?=.*[a-z])/.test(password))
      return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password))
      return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(password))
      return "Password must contain at least one number";
    return "";
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  const validateForm = () => {
    const newErrors = {};

    newErrors.name = validateName(formData.name);
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    newErrors.confirmPassword = validateConfirmPassword(
      formData.confirmPassword,
      formData.password
    );

    // Remove empty error messages
    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRoleToggle = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));

    // Clear any existing errors
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      showError(
        "Validation Error",
        "Please fix the errors in the form and try again."
      );
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
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        showSuccess(
          "Welcome to SkyVault!",
          "Your account has been created successfully. Redirecting to dashboard..."
        );
        setErrors({});

        // Clear form
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "buyer",
        });

        // Redirect to dashboard based on role
        setTimeout(() => {
          switch (data.user.role) {
            case 'admin':
              navigate('/admin/dashboard', { replace: true });
              break;
            case 'creator':
              navigate(`/creator/${data.user.id}/${data.user.email}`, { replace: true });
              break;
            case 'buyer':
            default:
              navigate(`/buyer/${data.user.id}/${data.user.email}`, { replace: true });
              break;
          }
        }, 1500);
      } else {
        // Handle specific server errors
        if (response.status === 400) {
          showError(
            "Registration Failed",
            data.message || "Please check your information and try again."
          );
        } else if (response.status === 409) {
          setErrors({ email: "An account with this email already exists" });
          showError(
            "Email Already Exists",
            "An account with this email address already exists. Please use a different email or try logging in."
          );
        } else {
          showError(
            "Registration Failed",
            data.message || "Something went wrong. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      showError(
        "Connection Error",
        "Unable to connect to the server. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getInputClassName = (fieldName) => {
    const baseClasses =
      "appearance-none rounded-md relative block w-full px-3 py-2 border bg-slate-800 placeholder-gray-400 text-white focus:outline-none transition-colors duration-200";
    const errorClasses =
      "border-red-500 focus:ring-red-500 focus:border-red-500";
    const normalClasses =
      "border-slate-600 focus:ring-blue-500 focus:border-blue-500";

    return `${baseClasses} ${errors[fieldName] ? errorClasses : normalClasses}`;
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  formData.role === "buyer"
                    ? "border-blue-500 bg-blue-900/30 text-blue-300 shadow-lg"
                    : "border-slate-600 bg-slate-800 text-gray-300 hover:border-slate-500 hover:bg-slate-700"
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
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  formData.role === "creator"
                    ? "border-blue-500 bg-blue-900/30 text-blue-300 shadow-lg"
                    : "border-slate-600 bg-slate-800 text-gray-300 hover:border-slate-500 hover:bg-slate-700"
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
            {/* Name Field */}
            <div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className={getInputClassName("name")}
                placeholder="Full name"
                disabled={loading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={getInputClassName("email")}
                placeholder="Email address"
                disabled={loading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                className={`${getInputClassName("password")} pr-10`}
                placeholder="Password"
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400 flex items-start">
                  <AlertCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`${getInputClassName("confirmPassword")} pr-10`}
                placeholder="Confirm password"
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-400">
              Already have an account?{" "}
              <a
                href="/auth/login"
                className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200"
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
