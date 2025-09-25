import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

/**
 * RegistrationPage Component
 * 
 * A modern, responsive registration form with gradient background and clean UI.
 * Features email/password registration with form validation and password confirmation.
 */
export default function RegistrationPage() {
  // ===== STATE MANAGEMENT =====
  // Form input states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Next.js router for navigation
  const router = useRouter();

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

    // Validate username length
    if (username.length < 3) {
      alert("Username must be at least 3 characters long.");
      setIsSubmitting(false);
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      alert("Passwords do not match. Please try again.");
      setIsSubmitting(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Attempting registration with:", { username, email, password: "[HIDDEN]" });
      
      // Send registration request using Axios
      const response = await axios.post("/api/auth/register", {
        username,
        email,
        password,
      });

      console.log("Registration successful:", response.data);
      
      // Redirect to success page
      router.push("/registration/register-success");
      
    } catch (err) {
      console.error("Registration error caught:", err);
      
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = err.response?.data?.message || "An error occurred";
        
        if (status === 500) {
          // Internal server error - redirect to fail page
          console.log("Internal server error - redirecting to fail page");
          router.push("/registration/register-fail");
          return;
        } else if (status === 400 || status === 409) {
          // Validation error or user already exists - show inline error
          setErrorMessage(message);
        } else {
          // Other errors - show generic message
          setErrorMessage("An unexpected error occurred. Please try again.");
        }
      } else {
        // Non-Axios error - show generic message
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== RENDER =====
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
              {/* Main heading with custom typography */}
              <h1 className="text-3xl font-bold mb-2">Create Account</h1>
              {/* Subtitle using DaisyUI theme-aware text color */}
              <p className="text-base-content/70">Join us today!</p>
            </div>

            {/* ===== REGISTRATION FORM ===== */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* ===== ERROR MESSAGE DISPLAY ===== */}
              {errorMessage && (
                <div className="alert alert-error">
                  <span>{errorMessage}</span>
                </div>
              )}
              
              {/* ===== USERNAME INPUT FIELD ===== */}
              <div className="form-control">
                <label className="label" htmlFor="username">
                  <span className="label-text font-medium">Username</span>
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              
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

              {/* ===== CONFIRM PASSWORD INPUT FIELD ===== */}
              {/* DaisyUI form control wrapper for proper spacing and styling */}
              <div className="form-control">
                {/* DaisyUI label component with proper accessibility */}
                <label className="label" htmlFor="confirmPassword">
                  <span className="label-text font-medium">Confirm Password</span>
                </label>
                {/* DaisyUI input component with bordered style */}
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>

            {/* ===== FOOTER SECTION ===== */}
            {/* Login link for existing users */}
            <div className="text-center mt-6">
              {/* Text using DaisyUI theme-aware color with opacity */}
              <p className="text-sm text-base-content/70">
                Already have an account?{" "}
                {/* DaisyUI link component with primary color */}
                <a href="/login" className="link link-primary font-medium">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ); 
}
