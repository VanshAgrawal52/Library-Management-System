import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn, BookOpen, Shield, Users, Zap, GraduationCap, Building2, CheckCircle, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('login'); // 'login' or 'otp'
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setStatus('Please fill in all fields');
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
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        setStep("otp");
        setStatus("OTP sent to your email successfully!");
      } else {
        setStatus(data.message || "Login failed");
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setStatus('Please enter the complete 6-digit code');
      setTimeout(() => setStatus(''), 4000);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: otpString }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.accessToken); // Save JWT
        localStorage.setItem("user", JSON.stringify(data.user)) // Save user info
        console.log("Token:", data.accessToken); // Log the token to the console
        setStatus("Login successful! Welcome back!");
        setTimeout(() => {
          navigate("/user"); // redirect after login
        }, 1500);
      } else {
        setStatus(data.message || "Invalid OTP");
      }
    } catch (err) {
      setStatus("Something went wrong");
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(""), 4000);
    }
  };

  const resendOtp = async () => {
    setOtp(['', '', '', '', '', '']); // reset inputs

    try {
      const res = await fetch("http://localhost:5000/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("OTP resent!");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header with IIT Jodhpur Branding */}
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <img
                src="/src/assets/logo.png"
                alt="IIT Jodhpur Logo"
                className="w-14 h-14 object-contain rounded-lg shadow-md"
              />
              <div>
                <h1 className="text-xl font-bold text-slate-800 leading-tight">Indian Institute of Technology</h1>
                <p className="text-sm text-blue-700 font-semibold">Jodhpur</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-700" />
              <span className="text-lg font-semibold text-slate-800">Central Library Portal</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-blue-100 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium mb-4">
              <LogIn className="w-4 h-4" />
              <span>{step === 'login' ? 'Account Login' : 'Email Verification'}</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {step === 'login' ? 'Welcome Back' : 'Verify Your Email'}
            </h2>
            <p className="text-slate-600">
              {step === 'login'
                ? 'Sign in to access the IIT Jodhpur Central Library system'
                : `We've sent a 6-digit verification code to ${formData.email}`
              }
            </p>
          </div>

          {/* Login/OTP Form Container */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            {step === 'login' ? (
              // Login Form
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <LogIn className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Sign In</h3>
                    <p className="text-sm text-slate-600">Access your library account</p>
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="your.email@iitj.ac.in"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-12 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => navigate("/forgot-password")}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Login Button */}
                <button
                  onClick={handleLogin}
                  disabled={loading || !formData.email || !formData.password}
                  className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium text-white transition-all ${loading || !formData.email || !formData.password
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>

                {/* Register Link */}
                <div className="text-center text-slate-600 pt-4 border-t border-slate-200">
                  Don't have an account?{' '}
                  <button
                    onClick={() => navigate("/register")}
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    Create one here
                  </button>
                </div>
              </div>
            ) : (
              // OTP Verification Form
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <button
                    onClick={() => setStep('login')}
                    className="w-10 h-10 rounded-lg border border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-all"
                  >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Verify Email</h3>
                    <p className="text-sm text-slate-600">Enter verification code</p>
                  </div>
                </div>

                {/* OTP Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3 text-center">
                    Enter 6-digit verification code
                  </label>
                  <div className="flex space-x-2 justify-center">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-12 text-center text-lg font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        maxLength={1}
                      />
                    ))}
                  </div>
                </div>

                {/* Verify Button */}
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.join('').length !== 6}
                  className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium text-white transition-all ${loading || otp.join('').length !== 6
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      <span>Verify Code</span>
                    </>
                  )}
                </button>

                {/* Resend Link */}
                <div className="text-center text-slate-600 pt-4 border-t border-slate-200">
                  Didn't receive the code?{' '}
                  <button
                    onClick={resendOtp}
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            )}

            {/* Status Message */}
            {status && (
              <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-all mt-6 ${status.includes('successful')
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : status.includes('sent') || status.includes('resent')
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                {status.includes('successful') ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : status.includes('sent') || status.includes('resent') ? (
                  <Mail className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="font-medium text-sm">{status}</span>
              </div>
            )}
          </div>

          {/* Features Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-6 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 text-sm">Secure Access</h3>
              <p className="text-xs text-slate-600">Two-factor authentication protects your account</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 text-sm">Quick Access</h3>
              <p className="text-xs text-slate-600">Instant access to library resources</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-700" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 text-sm">Personalized</h3>
              <p className="text-xs text-slate-600">Customized experience for researchers</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              For support, contact{' '}
              <a href="mailto:library@iitj.ac.in" className="text-blue-600 hover:text-blue-700 font-medium">
                library@iitj.ac.in
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <img
                src="/src/assets/logo.png"
                alt="IIT Jodhpur Logo"
                className="w-14 h-14 object-contain rounded-lg shadow-md"
              />
              <div>
                <p className="text-sm font-bold text-slate-800">Indian Institute of Technology, Jodhpur</p>
                <p className="text-xs text-slate-600">NH 62, Surpura Bypass Road, Karwar, Jodhpur - 342030</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-slate-600">© 2025 IIT Jodhpur Central Library. All rights reserved.</p>
              <p className="text-xs text-slate-500 mt-1">Library Management System v2.0</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}