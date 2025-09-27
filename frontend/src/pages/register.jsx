import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, CreditCard, Eye, EyeOff, UserPlus, BookOpen, Github, Shield, Users, Zap, GraduationCap } from 'lucide-react';

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
                body: JSON.stringify({ email, password, name, rollNo, department}),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('Account created successfully! Welcome to LibraryX!');
                setFormData({ email: '', password: '', confirmPassword: '' , name: '', rollNo: '', department: ''});
                setTimeout(() => {
                    setStatus('');
                    navigate("/login"); // redirect to login page
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-40 left-40 w-60 h-60 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Main Content */}
            <main className="relative z-10 py-12 px-6">
                <div className="max-w-2xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                            <UserPlus className="w-4 h-4" />
                            <span>Account Registration</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Join <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LibraryX</span>
                        </h1>
                        <p className="text-lg text-gray-600 max-w-xl mx-auto">
                            Create your account to access thousands of academic resources and start your research journey.
                        </p>
                    </div>

                    {/* Registration Form */}
                    <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 w-5 h-5" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-300"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Roll Number */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Roll Number *</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 w-5 h-5" />
                                    <input
                                        type="text"
                                        name="rollNo"
                                        value={formData.rollNo}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-300"
                                        placeholder="Enter your roll number"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Department */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 w-5 h-5" />
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-300"
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
                                    </select>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 w-5 h-5" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-300"
                                        placeholder="your.email@iitj.ac.in"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800 w-5 h-5" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-300"
                                        placeholder="Create a strong password"
                                        required
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

                            {/* Confirm Password */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800 w-5 h-5" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-300"
                                        placeholder="Confirm your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Terms and Conditions */}
                            <div className="flex items-start space-x-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium mb-1">Account Security & Terms</p>
                                    <p>By creating an account, you agree to our terms of service and privacy policy. Your data is secure and encrypted.</p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full flex items-center justify-center space-x-2 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 ${isSubmitting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg'
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
                            <div className="text-center text-gray-600">
                                Already have an account?{' '}
                                <button
                                    onClick={() => navigate("/login")}
                                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                                >
                                    Sign in here
                                </button>
                            </div>

                            {/* Status Message */}
                            {status && (
                                <div className={`flex items-center space-x-3 p-4 rounded-xl border transition-all duration-300 ${status.includes('successfully')
                                    ? 'bg-green-50 border-green-200 text-green-800'
                                    : 'bg-red-50 border-red-200 text-red-800'
                                    }`}>
                                    {status.includes('successfully') ? (
                                        <UserPlus className="w-5 h-5 flex-shrink-0" />
                                    ) : (
                                        <Shield className="w-5 h-5 flex-shrink-0" />
                                    )}
                                    <span className="font-medium">{status}</span>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Features Section */}
                    <div className="mt-12 grid md:grid-cols-3 gap-6">
                        <div className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Vast Library</h3>
                            <p className="text-sm text-gray-600">Access thousands of academic papers, journals, and research materials.</p>
                        </div>
                        <div className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Zap className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Fast Access</h3>
                            <p className="text-sm text-gray-600">Quick document retrieval and instant access to available resources.</p>
                        </div>
                        <div className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
                            <p className="text-sm text-gray-600">Join a community of researchers, students, and academic professionals.</p>
                        </div>
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