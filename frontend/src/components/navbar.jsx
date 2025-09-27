import React from "react";
import { BookOpen, Search, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {  
        try {
            const response = await fetch("http://localhost:5000/api/auth/logout", {
                method: 'POST',
                credentials: 'include', // Include cookies in the request
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Clear any client-side user data (e.g., localStorage, context, or state)
                localStorage.removeItem('token'); // Example: Remove user data if stored
                localStorage.removeItem('user'); // Example: Remove user data if stored
                // Redirect to login page
                navigate('/login');
            } else {
                console.error('Logout failed:', response.statusText);
                alert('Failed to log out. Please try again.');
            }
        } catch (err) {
            console.error('Logout error:', err);
            alert('An error occurred during logout. Please try again.');
        }
    };

    return (
        <nav className="relative z-10 backdrop-blur-sm bg-white/80 border-b border-white/20 px-6 py-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                {/* Logo Section */}
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        LibraryX
                    </span>
                </div>

                {/* Links */}
                <div className="hidden md:flex items-center space-x-8">
                    {/* Navigation Links */}
                    <div className="flex items-center space-x-6 text-gray-600">
                        <Link to="/user" className="hover:text-blue-600 transition-colors font-medium">
                            My Requests
                        </Link>
                        <Link to="/bookmarks" className="hover:text-blue-600 transition-colors font-medium">
                            Bookmarks
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="hover:text-blue-600 transition-colors font-medium"
                        >
                            Logout
                        </button>
                    </div>

                    {/* User Icon */}
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <User className="w-5 h-5 text-white" />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;