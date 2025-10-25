import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import { Search, User, BookOpen, Users, Shield, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleLoading, setRoleLoading] = useState({});
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                // Securely check admin role from backend
                const checkRes = await fetchWithAuth('http://localhost:5000/api/admin/check-admin', {
                    method: 'GET',
                });

                if (checkRes.status === 403) {
                    navigate('/user');
                    return;
                } else if (!checkRes.ok) {
                    throw new Error(`Error verifying admin: ${checkRes.status}`);
                }

                const checkData = await checkRes.json();
                if (!checkData.isAdmin) {
                    navigate('/user');
                    return;
                }

                // Only if admin verified → fetch users
                const response = await fetchWithAuth('http://localhost:5000/api/admin/users', {
                    method: 'GET',
                });

                if (!response.ok) {
                    throw new Error(`Error fetching users: ${response.status}`);
                }

                const data = await response.json();
                setUsers(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to fetch users');
                setLoading(false);

                // If token invalid or expired → redirect to login
                if (err.message === 'No token found' || err.message.includes('401')) {
                    navigate('/login');
                }
            }
        };

        fetchUsers();
    }, [navigate]);


    // Handle role toggle
    const handleRoleToggle = async (userId, currentRole, userEmail) => {
        // set loading for this user button
        setRoleLoading(prev => ({ ...prev, [userId]: true }));
        try {
            const newRole = currentRole === "user" ? "admin" : "user";
            const response = await fetchWithAuth(
                `http://localhost:5000/api/admin/users/${userId}/role`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ role: newRole }),
                }
            );

            if (!response.ok) {
                throw new Error(`Error updating role: ${response.status}`);
            }

            const updatedUser = await response.json();

            // Update state
            setUsers((prevUsers) =>
                prevUsers.map((u) =>
                    u._id === userId ? { ...u, role: updatedUser.role } : u
                )
            );

            // If the currently logged-in user changed their own role
            if (user && user?.email === userEmail) {
                const updatedLocalUser = { ...user, role: updatedUser.role };
                localStorage.setItem("user", JSON.stringify(updatedLocalUser));
                // Optionally redirect if they lost admin rights
                if (updatedUser.role !== "admin") {
                    navigate("/user");
                }
            }
        } catch (err) {
            setError("Failed to update user role");
            if (err.message === "No token found") {
                navigate("/login");
            }
        } finally {
            // clear loading flag for this user
            setRoleLoading(prev => { const copy = { ...prev }; delete copy[userId]; return copy; });
        }
    };

    const handleLogout = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/auth/logout", {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
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

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="p-10 text-center">Loading users...</div>;
    }

    if (error) {
        return <div className="p-10 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-40 left-40 w-60 h-60 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Header */}
            <nav className="relative z-10 backdrop-blur-sm bg-white/80 border-b border-white/20 px-6 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LibraryX Admin</span>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-64 rounded-full border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>

                        {/* Navigation Links */}
                        <div className="flex items-center space-x-6 text-gray-600">
                            <Link to="/dashboard" className="hover:text-blue-600 transition-colors font-medium">
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="hover:text-blue-600 transition-colors font-medium"
                            >
                                Logout
                            </button>
                        </div>

                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                            <User className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 py-12 px-6 flex-grow">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                            <Shield className="w-4 h-4" />
                            <span>Admin Panel</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            User <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Management</span>
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Manage user roles and permissions with full administrative control over your system.
                        </p>
                    </div>

                    {/* Users Table */}
                    <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                        <div className="px-8 py-6 border-b border-white/20">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">All Users</h2>
                                    <p className="text-gray-600">Manage user roles and permissions</p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/50 backdrop-blur-sm border-b border-white/20">
                                    <tr>
                                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Current Role
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white/30 backdrop-blur-sm divide-y divide-white/20">
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-white/50 transition-all duration-300">
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-gray-900 text-lg">{user.name}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="font-semibold text-gray-900">{user.email}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold shadow-sm ${user.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {user.role === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                                    <span className="capitalize">{user.role}</span>
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <button
                                                    onClick={() => handleRoleToggle(user._id, user.role, user.email)}
                                                    disabled={!!roleLoading[user._id]}
                                                    className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-md text-white ${user.role === 'user'
                                                            ? 'bg-purple-600'
                                                            : 'bg-blue-500'
                                                        } ${roleLoading[user._id] ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'} `}
                                                >
                                                    {roleLoading[user._id] ? (
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            <span>{user.role === 'user' ? 'Making Admin...' : 'Reverting...'}</span>
                                                        </div>
                                                    ) : (
                                                        user.role === 'user' ? 'Make Admin' : 'Make User'
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-8 py-6 bg-white/50 backdrop-blur-sm border-t border-white/20">
                            <div className="flex items-center justify-between">
                                <div className="font-semibold text-gray-700">
                                    Showing <span className="text-blue-600">1</span> to <span className="text-blue-600">{filteredUsers.length}</span> of{' '}
                                    <span className="text-blue-600">{users.length}</span> users
                                </div>
                                <div className="text-gray-600 font-medium">
                                    © 2025 LibraryX
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 bg-white/80 backdrop-blur-sm border-t border-white/20 py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="text-gray-600">© 2025 LibraryX. All rights reserved.</div>
                    <div className="flex items-center space-x-3 text-gray-600">
                        <span>Built with ❤️ by</span>
                        <a href="#" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                            Kavya
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AdminPanel;