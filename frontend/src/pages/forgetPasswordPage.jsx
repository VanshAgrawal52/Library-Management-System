import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Shield, Github } from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' or 'reset'
  const [formData, setFormData] = useState({
    email: '',
    newPassword: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      setStatus('Please enter your email address');
      setTimeout(() => setStatus(''), 4000);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus('Please enter a valid email address');
      setTimeout(() => setStatus(''), 4000);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        setStep("reset");
        setStatus("OTP sent to your email successfully!");
      } else {
        setStatus(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setStatus("Something went wrong");
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(""), 4000);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setStatus('Please enter the complete 6-digit code');
      setTimeout(() => setStatus(''), 4000);
      return;
    }

    if (!formData.newPassword) {
      setStatus('Please enter a new password');
      setTimeout(() => setStatus(''), 4000);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: otpString, newPassword: formData.newPassword }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("Password reset successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setStatus(data.message || "Invalid OTP or failed to reset password");
      }
    } catch (err) {
      setStatus("Something went wrong");
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(""), 4000);
    }
  };

  const handleResendOtp = async () => {
    setOtp(['', '', '', '', '', '']); // reset inputs

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("OTP resent to your email!");
      } else {
        setStatus(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      setStatus("Something went wrong while resending OTP");
    } finally {
      setTimeout(() => setStatus(""), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 py-12 px-6">
        <div className="max-w-lg mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Shield className="w-4 h-4" />
              <span>{step === 'email' ? 'Reset Password' : 'Verify OTP'}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {step === 'email' ? (
                <>Reset Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Password</span></>
              ) : (
                <>Verify Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Email</span></>
              )}
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              {step === 'email'
                ? 'Enter your email address to receive a verification code.'
                : `We've sent a 6-digit verification code to ${formData.email}`}
            </p>
          </div>

          {/* Forgot Password/OTP Form Container */}
          <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12">
            {step === 'email' ? (
              // Email Form
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                    <p className="text-gray-600">Enter your email to reset your password</p>
                  </div>
                </div>

                {/* Email Field */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-300"
                      placeholder="your.email@university.edu"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleForgotPassword}
                  disabled={loading || !formData.email}
                  className={`w-full flex items-center justify-center space-x-2 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 ${loading || !formData.email
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg'
                    }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      <span>Send OTP</span>
                    </>
                  )}
                </button>

                {/* Back to Login Link */}
                <div className="text-center text-gray-600">
                  Remember your password?{' '}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    Sign in here
                  </button>
                </div>
              </div>
            ) : (
              // OTP and New Password Form
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-8">
                  <button
                    onClick={() => setStep('email')}
                    className="w-10 h-10 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm flex items-center justify-center hover:border-blue-300 transition-all duration-300 mr-2"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Verify OTP</h2>
                    <p className="text-gray-600">Enter the code and new password</p>
                  </div>
                </div>

                {/* OTP Input */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Enter 6-digit verification code
                  </label>
                  <div className="flex space-x-3 justify-center">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-12 text-center text-lg font-bold border border-gray-200 bg-white/70 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                        maxLength={1}
                      />
                    ))}
                  </div>
                </div>

                {/* New Password Field */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-300"
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Reset Password Button */}
                <button
                  onClick={handleResetPassword}
                  disabled={loading || otp.join('').length !== 6 || !formData.newPassword}
                  className={`w-full flex items-center justify-center space-x-2 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 ${loading || otp.join('').length !== 6 || !formData.newPassword
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-blue-600 hover:shadow-lg'
                    }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Resetting Password...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      <span>Reset Password</span>
                    </>
                  )}
                </button>

                {/* Resend OTP Link */}
                <div className="text-center text-gray-600">
                  Didn't receive the code?{' '}
                  <button
                    onClick={handleResendOtp}
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            )}

            {/* Status Message */}
            {status && (
              <div className={`flex items-center space-x-3 p-4 rounded-xl border transition-all duration-300 mt-6 ${status.includes('successful')
                ? 'bg-green-50 border-green-200 text-green-800'
                : status.includes('sent')
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                {status.includes('successful') ? (
                  <Shield className="w-5 h-5 flex-shrink-0" />
                ) : status.includes('sent') ? (
                  <Mail className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <Mail className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="font-medium">{status}</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-white/80 backdrop-blur-sm border-t border-white/20 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="text-gray-600">© 2025 LibraryX. All rights reserved.</div>
          <div className="flex items-center space-x-3 text-gray-600">
            <span>Built with ❤️ by</span>
            <a
              href="#"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Kavya
            </a>
            <Github className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </footer>
    </div>
  );
}