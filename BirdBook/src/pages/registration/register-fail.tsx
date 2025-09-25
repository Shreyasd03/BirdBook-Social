/**
 * Registration Fail Page
 * 
 * Displays an error message after failed registration
 * Provides options to try again or go back to login
 */
export default function RegisterFailPage() {

  return (
    // Main container with gradient background and centered layout
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 via-red-500 to-red-600">
      {/* Card wrapper with max width constraint */}
      <div className="w-full max-w-md">
        {/* ===== DAISYUI CARD COMPONENT ===== */}
        <div className="card bg-base-100 shadow-2xl">
          <div className="card-body p-0 text-center">
            
            {/* ===== ERROR ICON ===== */}
            <div className="mx-auto w-32 h-32 mb-6 flex items-center justify-center">
              <img 
                src="/crossPNG.png" 
                alt="Error" 
                className="w-32 h-32 object-contain"
              />
            </div>

            {/* ===== ERROR MESSAGE ===== */}
            <h1 className="text-3xl font-bold mb-4">
              Registration Failed
            </h1>
            
            <p className="text-base-content/70 mb-6">
              We encountered an error while creating your account. Please try again later.
            </p>

            {/* ===== ACTION BUTTON ===== */}
            <div className="form-control">
              <a 
                href="/registration/register" 
                className="btn w-full bg-purple-600 hover:bg-purple-700 text-white border-none"
              >
                Return to Registration
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
