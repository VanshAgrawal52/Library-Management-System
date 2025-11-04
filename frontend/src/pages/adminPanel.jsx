import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import { Search, User, BookOpen, Users, Shield, Settings, GraduationCap, Building2, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleLoading, setRoleLoading] = useState({});
    const [statusMessage, setStatusMessage] = useState('');
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

            setStatusMessage(`User role updated to ${newRole}`);
            setTimeout(() => setStatusMessage(''), 3000);

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
            setStatusMessage('Failed to update user role');
            setTimeout(() => setStatusMessage(''), 3000);
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
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const adminCount = users.filter(u => u.role === 'admin').length;
    const userCount = users.filter(u => u.role === 'user').length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading admin panel...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 font-medium text-lg">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
            {/* Status Toast */}
            {statusMessage && (
                <div className="fixed top-4 right-4 z-50 bg-white border-l-4 border-blue-600 shadow-xl rounded-lg p-4 max-w-md animate-slide-in">
                    <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        <p className="text-slate-800 font-medium">{statusMessage}</p>
                    </div>
                </div>
            )}

            {/* Header with IIT Jodhpur Branding */}
            <nav className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Left: Logo and Institute Name */}
                        <div className="flex items-center space-x-4">
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
                            <div className="hidden lg:block w-px h-12 bg-slate-300 ml-4"></div>
                            <div className="hidden lg:flex items-center space-x-2">
                                <Shield className="w-5 h-5 text-blue-700" />
                                <span className="text-lg font-semibold text-slate-800">Admin Panel</span>
                            </div>
                        </div>

                        {/* Right: Navigation */}
                        <div className="flex items-center space-x-6">
                            <div className="hidden md:block relative">
                            </div>
                            <div className="hidden md:flex items-center space-x-6">
                                <Link to="/" className="text-slate-700 hover:text-blue-700 font-medium transition-colors">New Request</Link>
                                <Link to="/dashboard" className="text-slate-700 hover:text-blue-700 font-medium transition-colors">Dashboard</Link>
                                <Link to="/library" className="text-slate-700 hover:text-blue-700 font-medium transition-colors">Library</Link>
                                <Link to="/analytics" className="text-slate-700 hover:text-blue-700 font-medium transition-colors">Analytics</Link>
                                <button onClick={handleLogout} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-all">Logout</button>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
                                <User className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-2 text-sm text-slate-600 mb-3">
                            <Building2 className="w-4 h-4" />
                            <span>Admin Dashboard</span>
                            <span>/</span>
                            <span className="text-blue-700 font-medium">User Management</span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">User Management & Access Control</h2>
                        <p className="text-slate-600">Manage user roles and administrative permissions for the IIT Jodhpur library system</p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6 text-blue-700" />
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-slate-900">{users.length}</div>
                                    <div className="text-sm text-slate-600">Total Users</div>
                                </div>
                            </div>
                            <div className="w-full bg-blue-100 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-purple-700" />
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-slate-900">{adminCount}</div>
                                    <div className="text-sm text-slate-600">Administrators</div>
                                </div>
                            </div>
                            <div className="w-full bg-purple-100 rounded-full h-2">
                                <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(adminCount / users.length) * 100}%` }}></div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <User className="w-6 h-6 text-emerald-700" />
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-slate-900">{userCount}</div>
                                    <div className="text-sm text-slate-600">Regular Users</div>
                                </div>
                            </div>
                            <div className="w-full bg-emerald-100 rounded-full h-2">
                                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${(userCount / users.length) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Search className="w-5 h-5 text-blue-700" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Search Users</h3>
                                <p className="text-sm text-slate-600">Find users by name, email, roll number, or department</p>
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by name, email, roll number, or department..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="mt-4">
                            <p className="text-sm text-slate-600">
                                Showing <span className="font-semibold text-slate-900">{filteredUsers.length}</span> of <span className="font-semibold text-slate-900">{users.length}</span> users
                            </p>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-700 rounded-lg flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">All Users</h3>
                                    <p className="text-sm text-slate-600">Manage user roles and administrative access</p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            User Information
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        {/* <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Department
                                        </th> */}
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Current Role
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-lg">{user.name}</div>
                                                        {user.rollNo && (
                                                            <div className="text-sm text-slate-600 mt-1">
                                                                Roll/ID: {user.rollNo}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center space-x-2">
                                                        <Mail className="w-4 h-4 text-slate-400" />
                                                        <span className="text-sm text-slate-900">{user.email}</span>
                                                    </div>
                                                </td>
                                                {/* <td className="px-6 py-5">
                                                    <div className="text-sm text-slate-900">
                                                        {user.department || 'N/A'}
                                                    </div>
                                                </td> */}
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${user.role === 'admin'
                                                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                                                        }`}>
                                                        {user.role === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                                        <span className="capitalize">{user.role}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <button
                                                        onClick={() => handleRoleToggle(user._id, user.role, user.email)}
                                                        disabled={!!roleLoading[user._id]}
                                                        className={`px-4 py-2 rounded-lg font-medium transition-all text-white text-sm ${user.role === 'user'
                                                                ? 'bg-purple-600 hover:bg-purple-700'
                                                                : 'bg-blue-600 hover:bg-blue-700'
                                                            } ${roleLoading[user._id] ? 'opacity-70 cursor-not-allowed' : 'shadow-sm hover:shadow-md'}`}
                                                    >
                                                        {roleLoading[user._id] ? (
                                                            <div className="flex items-center justify-center space-x-2">
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                <span>{user.role === 'user' ? 'Promoting...' : 'Revoking...'}</span>
                                                            </div>
                                                        ) : (
                                                            user.role === 'user' ? 'Make Admin' : 'Remove Admin'
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-3">
                                                    <AlertCircle className="w-12 h-12 text-slate-300" />
                                                    <p className="text-slate-600 font-medium">No users found</p>
                                                    <p className="text-sm text-slate-500">Try adjusting your search terms</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Table Footer */}
                        {filteredUsers.length > 0 && (
                            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                                <div className="flex items-center justify-between text-sm">
                                    <p className="text-slate-600">
                                        Showing <span className="font-semibold text-slate-900">{filteredUsers.length}</span> of <span className="font-semibold text-slate-900">{users.length}</span> users
                                    </p>
                                    <p className="text-slate-500">IIT Jodhpur Central Library</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info Cards */}
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-8 hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                                <Shield className="w-8 h-8 text-purple-700" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Role Management</h3>
                            <p className="text-slate-600 text-center">Easily promote users to administrators or revoke admin privileges with a single click.</p>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-8 hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                                <Users className="w-8 h-8 text-blue-700" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">User Overview</h3>
                            <p className="text-slate-600 text-center">View comprehensive user information including contact details and department affiliation.</p>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-8 hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                                <Settings className="w-8 h-8 text-emerald-700" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Access Control</h3>
                            <p className="text-slate-600 text-center">Maintain secure access to administrative features and library management tools.</p>
                        </div>
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
};

export default AdminPanel;