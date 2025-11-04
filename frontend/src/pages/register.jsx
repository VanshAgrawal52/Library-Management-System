import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, CreditCard, Eye, EyeOff, UserPlus, BookOpen, Shield, Users, Zap, GraduationCap, CheckCircle, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '',
        confirmPassword: '',
        rollNo: '',
        department: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [status, setStatus] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const { email, password, confirmPassword, name, rollNo, department } = formData;

        if (!email || !password || !confirmPassword || !name || !rollNo || !department) {
            setStatus('Please fill all required fields');
            setTimeout(() => setStatus(''), 4000);
            return;
        }

        if (password !== confirmPassword) {
            setStatus('Passwords do not match');
            setTimeout(() => setStatus(''), 4000);
            return;
        }

        if (password.length < 6) {
            setStatus('Password must be at least 6 characters long');
            setTimeout(() => setStatus(''), 4000);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setStatus('Please enter a valid email address');
            setTimeout(() => setStatus(''), 4000);
            return;
        }

        // Check if email ends with @iitj.ac.in
        if (!email.toLowerCase().endsWith('@iitj.ac.in')) {
            setStatus('Please enter your IIT Jodhpur email address (@iitj.ac.in)');
            setTimeout(() => setStatus(''), 4000);
            return;
        }

        try {
            setIsSubmitting(true);
            setStatus('');

            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name, rollNo, department }),
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('Account created successfully! Redirecting to login...');
                setFormData({ email: '', password: '', confirmPassword: '', name: '', rollNo: '', department: '' });
                setTimeout(() => {
                    setStatus('');
                    navigate("/login");
                }, 2000);
            } else {
                setStatus(data.message || "Registration failed");
            }
        } catch (error) {
            console.error("Error registering user:", error);
            setStatus("Something went wrong. Try again.");
        } finally {
            setIsSubmitting(false);
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
                <div className="max-w-2xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center space-x-2 bg-blue-100 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium mb-4">
                            <UserPlus className="w-4 h-4" />
                            <span>Account Registration</span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">
                            Create Your Account
                        </h2>
                        <p className="text-slate-600">
                            Register to access the IIT Jodhpur Central Library system
                        </p>
                    </div>

                    {/* Registration Form */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <UserPlus className="w-6 h-6 text-blue-700" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Sign Up</h3>
                                <p className="text-sm text-slate-600">Create your library account</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Roll Number */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Roll Number *</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        name="rollNo"
                                        value={formData.rollNo}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter your roll number"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Department */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Department *</label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                                        required
                                    >
                                        <option value="" disabled>Select your department</option>
                                        <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                                        <option value="Electrical Engineering">Electrical Engineering</option>
                                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                                        <option value="Chemical Engineering">Chemical Engineering</option>
                                        <option value="Civil and Infrastructure Engineering">Civil and Infrastructure Engineering</option>
                                        <option value="Metallurgical and Materials Engineering">Metallurgical and Materials Engineering</option>
                                        <option value="Biosciences and Bioengineering">Biosciences and Bioengineering</option>
                                        <option value="Physics">Physics</option>
                                        <option value="Chemistry">Chemistry</option>
                                        <option value="Mathematics">Mathematics</option>
                                        <option value="Staff">Staff</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address *</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="your.email@iitj.ac.in"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
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
                                        placeholder="Create a strong password"
                                        required
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

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password *</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-12 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Confirm your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Terms Notice */}
                            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <Shield className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium mb-1">Account Security & Terms</p>
                                    <p>By creating an account, you agree to our terms of service and privacy policy. Your data is secure and encrypted.</p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium text-white transition-all ${isSubmitting
                                        ? 'bg-slate-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-5 h-5" />
                                        <span>Create Account</span>
                                    </>
                                )}
                            </button>

                            {/* Login Link */}
                            <div className="text-center text-slate-600 pt-4 border-t border-slate-200">
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                                >
                                    Sign in here
                                </button>
                            </div>

                            {/* Status Message */}
                            {status && (
                                <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-all ${status.includes('successfully')
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                        : 'bg-red-50 border-red-200 text-red-800'
                                    }`}>
                                    {status.includes('successfully') ? (
                                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    )}
                                    <span className="font-medium text-sm">{status}</span>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Features Section */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-6 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <BookOpen className="w-6 h-6 text-blue-700" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2 text-sm">Vast Library</h3>
                            <p className="text-xs text-slate-600">Access thousands of academic resources and research materials</p>
                        </div>
                        <div className="text-center p-6 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Zap className="w-6 h-6 text-emerald-700" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2 text-sm">Quick Access</h3>
                            <p className="text-xs text-slate-600">Instant access to available resources and materials</p>
                        </div>
                        <div className="text-center p-6 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Users className="w-6 h-6 text-purple-700" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2 text-sm">Community</h3>
                            <p className="text-xs text-slate-600">Join researchers, students, and academic professionals</p>
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