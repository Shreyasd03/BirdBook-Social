/**
 * Registration Success Page
 * 
 * Displays a success message after successful registration
 * Provides a button to navigate to login page
 */
export default function RegisterSuccessPage() {

  return (
    // Main container with gradient background and centered layout
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 via-red-500 to-red-600">
      {/* Card wrapper with max width constraint */}
      <div className="w-full max-w-md">
        {/* ===== DAISYUI CARD COMPONENT ===== */}
        <div className="card bg-base-100 shadow-2xl">
          <div className="card-body p-8 text-center">
            
            {/* ===== SUCCESS ICON ===== */}
            <div className="mx-auto w-32 h-32 mb-6 flex items-center justify-center">
              <img 
                src="/CheckPNG.png" 
                alt="Success" 
                className="w-32 h-32 object-contain"
              />
            </div>

            {/* ===== SUCCESS MESSAGE ===== */}
            <h1 className="text-3xl font-bold mb-4">
              Registration Successful!
            </h1>
            
            <p className="text-base-content/70 mb-6">
              Your account has been created successfully!
            </p>

            {/* ===== MANUAL LOGIN BUTTON ===== */}
            <div className="form-control">
              <a 
                href="/login" 
                className="btn w-full bg-purple-600 hover:bg-purple-700 text-white border-none"
              >
                Return to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
