import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Image from "next/image";
import { hasAuthToken, verifyToken } from "./api/auth/auth-client";

/**
 * LoginPage Component
 * 
 * A modern, responsive login form with gradient background and clean UI.
 * Features email/password authentication with form validation.
 */
export default function LoginPage() {
  // ===== STATE MANAGEMENT =====
  // Form input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Next.js router for navigation
  const router = useRouter();

  // ===== AUTHENTICATION CHECK =====
  useEffect(() => {
    // Check if user has a token and verify it server-side
    const checkAuth = async () => {
      if (!hasAuthToken()) {
        setIsCheckingAuth(false);
        return; // No token, show login form
      }

      try {
        // Verify token using auth utility function
        const result = await verifyToken();
        
        if (result.valid) {
          // Token is valid, redirect to feed
          router.push('/feed');
        } else {
          setIsCheckingAuth(false);
        }
      } catch (error) {
        // Token is invalid, show login form
        console.error('Token verification failed:', error);
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  // ===== FORM HANDLING =====
  /**
   * Handles form submission using Axios
   * @param e - Form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    // Prevent multiple submissions
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(""); // Clear any previous error messages

    try {
      // Send login request using Axios
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });

      // Check if request was successful (Axios throws for 4xx/5xx status codes)
      if (response.status === 200) {
        console.log("Login successful:", response.data);
        
        // Store JWT token in localStorage for future API requests
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        // Redirect to feed page
        router.push("/feed");
      }
    } catch (err) {
      console.error("Login error:", err);
      
      // Handle different types of errors
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = err.response?.data?.message || "An error occurred";
        
        if (status === 401) {
          alert("Invalid email or password. Please try again.");
        } else if (status === 500) {
          alert("Server error. Please try again later.");
        } else {
          alert(message);
        }
      } else {
        alert("Login failed. Please check your connection and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== RENDER =====
  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 via-red-500 to-red-600">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-white mb-4"></div>
          <p className="text-white text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    // Main container with gradient background and centered layout
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 via-red-500 to-red-600">
      {/* Card wrapper with max width constraint */}
      <div className="w-full max-w-md">
        {/* ===== DAISYUI CARD COMPONENT ===== */}
        {/* DaisyUI card with base theme background and large shadow */}
        <div className="card bg-base-100 shadow-2xl">
          {/* DaisyUI card body with padding */}
          <div className="card-body p-8">
            
            {/* ===== HEADER SECTION ===== */}
            <div className="text-center mb-8">
              {/* Company logo container */}
              <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center">
                {/* Next.js optimized image component */}
                <Image
                  src="/Placeholder logo.png"
                  alt="Logo"
                  width={64}
                  height={64}
                  className="object-contain"
                  priority // Loads image with high priority for above-the-fold content
                />
              </div>
              {/* Main heading with custom typography */}
              <h1 className="text-3xl font-bold mb-2">Welcome!</h1>
              {/* Subtitle using DaisyUI theme-aware text color */}
              <p className="text-base-content/70">Please enter your credentials</p>
            </div>

            {/* ===== LOGIN FORM ===== */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* ===== ERROR MESSAGE DISPLAY ===== */}
              {errorMessage && (
                <div className="alert alert-error">
                  <span>{errorMessage}</span>
                </div>
              )}
              
              {/* ===== EMAIL INPUT FIELD ===== */}
              {/* DaisyUI form control wrapper for proper spacing and styling */}
              <div className="form-control">
                {/* DaisyUI label component with proper accessibility */}
                <label className="label" htmlFor="email">
                  <span className="label-text font-medium">Email Address</span>
                </label>
                {/* DaisyUI input component with bordered style */}
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* ===== PASSWORD INPUT FIELD ===== */}
              {/* DaisyUI form control wrapper for proper spacing and styling */}
              <div className="form-control">
                {/* DaisyUI label component with proper accessibility */}
                <label className="label" htmlFor="password">
                  <span className="label-text font-medium">Password</span>
                </label>
                {/* DaisyUI input component with bordered style */}
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* ===== SUBMIT BUTTON ===== */}
              {/* DaisyUI form control wrapper for button spacing */}
              <div className="form-control mt-6">
                {/* DaisyUI button component with custom purple color scheme */}
                <button 
                  type="submit" 
                  className="btn w-full bg-purple-600 hover:bg-purple-700 text-white border-none"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </div>
            </form>

            {/* ===== FOOTER SECTION ===== */}
            {/* Sign up link for new users */}
            <div className="text-center mt-6">
              {/* Text using DaisyUI theme-aware color with opacity */}
              <p className="text-sm text-base-content/70">
                Don't have an account?{" "}
                {/* DaisyUI link component with primary color */}
                <a href="/registration/register" className="link link-primary font-medium">
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ); 
}