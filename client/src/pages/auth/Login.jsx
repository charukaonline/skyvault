import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/contexts/NotificationContext";
import { Camera, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { showSuccess, showError, showWarning } = useNotification();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Validation functions
  const validateEmail = (email) => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    return "";
  };

  const validateForm = () => {
    const newErrors = {};

    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);

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

  const getRoleWelcomeMessage = (role) => {
    switch (role) {
      case "admin":
        return "Welcome back, Admin! You have full access to the platform.";
      case "creator":
        return "Welcome back, Creator! Ready to showcase your amazing drone footage?";
      case "buyer":
      default:
        return "Welcome back! Discover amazing drone footage from talented creators.";
    }
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
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setErrors({});

        // Clear form
        setFormData({
          email: "",
          password: "",
        });

        // Show success notification with role-specific message
        showSuccess("Login Successful", getRoleWelcomeMessage(data.user.role));

        // Immediate redirect to role-specific dashboard
        setTimeout(() => {
          switch (data.user.role) {
            case "admin":
              navigate("/admin/dashboard", { replace: true });
              break;
            case "creator":
              navigate(`/creator/${data.user.id}/${data.user.email}`, {
                replace: true,
              });
              break;
            case "buyer":
            default:
              navigate(`/buyer/${data.user.id}/${data.user.email}`, {
                replace: true,
              });
              break;
          }
        }, 1500);
      } else {
        // Handle specific server errors
        if (response.status === 400) {
          showError(
            "Invalid Input",
            data.message || "Please check your email and password."
          );
        } else if (response.status === 401) {
          showError(
            "Login Failed",
            "Invalid email or password. Please check your credentials and try again."
          );
        } else if (response.status === 403) {
          // Creator account pending approval
          if (data.code === "PENDING_APPROVAL") {
            showWarning(
              "Account Pending Approval",
              "Your creator account is awaiting admin approval. You'll receive an email notification once approved. Please contact support if you've been waiting for more than 48 hours."
            );
          } else {
            showError(
              "Access Denied",
              data.message ||
                "Your account access has been restricted. Please contact support."
            );
          }
        } else {
          showError(
            "Login Failed",
            data.message || "Something went wrong. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Login error:", error);
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
    <div className="flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Camera className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">SkyVault</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                <p className="mt-1 text-sm text-red-400 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.password}
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
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-400">
              Don't have an account?{" "}
              <a
                href="/auth/signup"
                className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                Sign up
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
