import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, TrendingUp, Users, FileText, BarChart3, Calendar, Github, Clock, Target, AlertCircle, CheckCircle, XCircle, BookOpen, User } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { Link, useNavigate } from "react-router-dom";
import 'react-datepicker/dist/react-datepicker.css';
import { fetchWithAuth } from '../utils/fetchWithAuth';
const AnalyticsPage = () => {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#EF4444', '#6366F1'];

    useEffect(() => {
        verifyAndFetch();
    }, [startDate, endDate]);

    // Secure admin check + data fetching combined
    const verifyAndFetch = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            // Check if user is admin (securely)
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

            // Admin verified → fetch analytics and users
            await Promise.all([fetchAnalytics(), fetchAllUsers()]);
        } catch (err) {
            console.error('Error verifying admin or fetching data:', err);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const baseUrl = 'http://localhost:5000/api/analytics';
            const params = new URLSearchParams();

            if (startDate) params.append('startDate', startDate.toISOString());
            if (endDate) params.append('endDate', endDate.toISOString());

            const url = params.toString() ? `${baseUrl}?${params}` : baseUrl;

            const response = await fetchWithAuth(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch analytics');

            const data = await response.json();
            setAnalytics(data);
            setError(null);
        } catch (err) {
            console.error('Fetch analytics error:', err);
            setError('Failed to fetch analytics. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = analytics?.totalUsers !== undefined;

    const filteredRequests = analytics?.requests?.filter(request =>
        request.documentTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.publisher?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];


    const filteredUsers = allUsers.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const publisherData = {
        labels: Object.keys(analytics?.publisherCounts || {}),
        datasets: [
            {
                label: 'Requests by Publisher',
                data: Object.values(analytics?.publisherCounts || {}),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    const statusData = {
        labels: Object.keys(analytics?.statusCounts || {}),
        datasets: [
            {
                label: 'Requests by Status',
                data: Object.values(analytics?.statusCounts || {}),
                backgroundColor: 'rgba(168, 85, 247, 0.7)',
                borderColor: 'rgba(168, 85, 247, 1)',
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: { size: 12, weight: '600' },
                    padding: 15,
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)' }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    const formatMostRequested = (most) => {
        if (!most || most.length === 0) return 'None';
        return most.map(item => `${item.documentTitle} (${item.count})`).join(', ');
    };

    const SafeChart = ({ data, children }) => {
        if (!data || data.length === 0) {
            return (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No data available</p>
                </div>
            );
        }
        return children;
    };

    const fetchAllUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetchWithAuth('http://localhost:5000/api/admin/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAllUsers(data);
            }
        } catch (err) {
            console.error('Fetch users error:', err);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl max-w-md">
                    <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="w-5 h-5" />
                        <p className="font-medium">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!analytics) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Animated Background */}
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
                        <div className="flex items-center space-x-6 text-gray-600">
                            <Link to="/dashboard" className="hover:text-blue-600 transition-colors font-medium">
                                Dashboard
                            </Link>
                            <Link to="/adminPanel" className="hover:text-blue-600 transition-colors font-medium">Admin Panel</Link>
                            <button onClick={handleLogout} className="hover:text-blue-600 transition-colors font-medium">Logout</button>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                            <User className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                            <BarChart3 className="w-4 h-4" />
                            <span>{isAdmin ? 'Admin Analytics' : 'My Analytics'}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Analytics <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</span>
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            {isAdmin ? 'Monitor system-wide statistics and manage user requests' : 'Track your document requests and activity'}
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-6 mb-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder={isAdmin ? "Search requests or users..." : "Search your requests..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>
                    </div>

                    {/* Date Filters */}
                    <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-6 mb-32">
                        <div className="flex flex-wrap items-center gap-4">
                            <Calendar className="w-5 h-5 text-gray-600" />
                            <div className="flex flex-wrap gap-4 flex-1">
                                <div>
                                    <label className="text-gray-700 font-semibold text-sm block mb-2">Start Date:</label>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        selectsStart
                                        startDate={startDate}
                                        endDate={endDate}
                                        maxDate={endDate || null}
                                        popperPlacement="top-start"
                                        popperModifiers={[
                                            { name: 'offset', options: { offset: [0, 12] } },
                                            { name: 'preventOverflow', options: { padding: 8 } },
                                            { name: 'flip', options: { fallbackPlacements: [] } }
                                        ]}
                                        isClearable
                                        placeholderText="Select start date"
                                        className="px-4 py-2 border border-gray-200 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-700 font-semibold text-sm block mb-2">End Date:</label>
                                    <DatePicker
                                        selected={endDate}
                                        onChange={(date) => setEndDate(date)}
                                        selectsEnd
                                        startDate={startDate}
                                        endDate={endDate}
                                        minDate={startDate || null}
                                        popperPlacement="top-start"
                                        popperModifiers={[
                                            { name: 'offset', options: { offset: [0, 12] } },
                                            { name: 'preventOverflow', options: { padding: 8 } },
                                            { name: 'flip', options: { fallbackPlacements: [] } }
                                        ]}
                                        isClearable
                                        placeholderText="Select end date"
                                        className="px-4 py-2 border border-gray-200 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                                {(startDate || endDate) && (
                                    <button
                                        onClick={() => { setStartDate(null); setEndDate(null); }}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium self-end"
                                    >
                                        Clear Dates
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 mt-8">
                        {isAdmin ? (
                            <>
                                <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-6 transform hover:scale-105 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                                            <Users className="w-6 h-6 text-white" />
                                        </div>
                                        <TrendingUp className="w-5 h-5 text-green-500" />
                                    </div>
                                    <h3 className="text-gray-600 text-sm font-medium mb-1">Total Users</h3>
                                    <p className="text-3xl font-bold text-gray-900">{analytics.totalUsers}</p>
                                    <p className="text-xs text-gray-500 mt-2">{analytics.activeUsers} active</p>
                                </div>
                                <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-6 transform hover:scale-105 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                            <FileText className="w-6 h-6 text-white" />
                                        </div>
                                        <TrendingUp className="w-5 h-5 text-green-500" />
                                    </div>
                                    <h3 className="text-gray-600 text-sm font-medium mb-1">Total Requests</h3>
                                    <p className="text-3xl font-bold text-gray-900">{analytics.totalRequests}</p>
                                    <p className="text-xs text-gray-500 mt-2">{analytics.averageRequestsPerUser} avg/user</p>
                                </div>
                                <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-6 transform hover:scale-105 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                                            <CheckCircle className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="text-gray-600 text-sm font-medium mb-1">Success Rate</h3>
                                    <p className="text-3xl font-bold text-gray-900">{analytics.successMetrics?.successRate}%</p>
                                    <p className="text-xs text-gray-500 mt-2">{analytics.successMetrics?.acceptedCount} accepted</p>
                                </div>
                                <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-6 transform hover:scale-105 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                                            <Clock className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="text-gray-600 text-sm font-medium mb-1">Avg Response Time</h3>
                                    <p className="text-3xl font-bold text-gray-900">{analytics.timeMetrics?.averageResponseTimeDays} days</p>
                                    <p className="text-xs text-gray-500 mt-2">{analytics.timeMetrics?.completedRequestsCount} completed</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-6 transform hover:scale-105 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                                            <FileText className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="text-gray-600 text-sm font-medium mb-1">Total Requests</h3>
                                    <p className="text-3xl font-bold text-gray-900">{analytics.totalRequests}</p>
                                </div>
                                <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-6 transform hover:scale-105 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                            <CheckCircle className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="text-gray-600 text-sm font-medium mb-1">Success Rate</h3>
                                    <p className="text-3xl font-bold text-gray-900">{analytics.successMetrics?.successRate}%</p>
                                </div>
                                <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-6 transform hover:scale-105 transition-all duration-300">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                                        <BarChart3 className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-gray-600 text-sm font-medium mb-1">Category</h3>
                                    <p className="text-2xl font-bold text-gray-900">{analytics.category}</p>
                                </div>
                                <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-6 transform hover:scale-105 transition-all duration-300">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                                        <Target className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-gray-600 text-sm font-medium mb-1">Most Requested</h3>
                                    <p className="text-sm font-bold text-gray-900 line-clamp-2">{formatMostRequested(analytics.mostRequested)}</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-6 relative z-10">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                <BarChart3 className="w-5 h-5 text-purple-600" />
                                <span>Requests by Status</span>
                            </h2>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={Object.entries(analytics?.statusCounts || {}).map(([status, count]) => ({ status, count }))}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="status" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#A855F7" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {isAdmin && Object.keys(analytics.categoryData || {}).length > 0 && (
                            <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-6 relative z-10">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                    <BarChart3 className="w-5 h-5 text-orange-600" />
                                    <span>Requests by Category</span>
                                </h2>
                                <div style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={Object.entries(analytics.categoryData || {}).map(([category, v]) => ({ category, count: v.totalRequests }))}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="category" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#FB923C" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {isAdmin && Object.keys(analytics.departmentData || {}).length > 0 && (
                            <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                    <BarChart3 className="w-5 h-5 text-green-600" />
                                    <span>Requests by Department</span>
                                </h2>
                                <div style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={Object.entries(analytics.departmentData || {}).map(([department, v]) => ({ department, count: v.totalRequests }))}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="department" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#22C55E" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Status Distribution */}
                        <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                <BarChart3 className="w-5 h-5 text-purple-600" />
                                <span>Request Status Distribution</span>
                            </h2>
                            <SafeChart data={Object.entries(analytics.statusCounts || {})}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={Object.entries(analytics.statusCounts || {}).map(([name, value]) => ({ name, value }))}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {Object.entries(analytics.statusCounts || {}).map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </SafeChart>
                        </div>

                        {/* Trends - Monthly */}
                        <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                <span>Monthly Trends</span>
                            </h2>
                            <SafeChart data={analytics.trends?.monthly}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={analytics.trends?.monthly || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 5 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </SafeChart>
                        </div>

                        {/* Peak Activity */}
                        <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-orange-600" />
                                <span>Peak Activity Hours</span>
                            </h2>
                            <SafeChart data={analytics.peakActivity?.hourlyDistribution}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analytics.peakActivity?.hourlyDistribution || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hour" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </SafeChart>
                        </div>



                        {/* Publication Year Distribution */}
                        <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                <Calendar className="w-5 h-5 text-pink-600" />
                                <span>Publication Year Distribution</span>
                            </h2>
                            <SafeChart data={analytics.publicationYearDistribution}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analytics.publicationYearDistribution || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="year" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#EC4899" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </SafeChart>
                        </div>

                        {/* Daily Activity Distribution */}
                        <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-6 lg:col-span-2">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                <BarChart3 className="w-5 h-5 text-cyan-600" />
                                <span>Activity by Day of Week</span>
                            </h2>
                            <SafeChart data={analytics.peakActivity?.dailyDistribution}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analytics.peakActivity?.dailyDistribution || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="day" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#06B6D4" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </SafeChart>
                        </div>
                    </div>

                    {/* Rejection Analysis */}
                    {analytics.rejectionAnalysis?.totalRejected > 0 && (
                        <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                                <XCircle className="w-6 h-6 text-red-600" />
                                <span>Rejection Analysis</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <p className="text-gray-600 mb-4">Total Rejections: <span className="text-2xl font-bold text-red-600">{analytics.rejectionAnalysis.totalRejected}</span></p>
                                    <div className="space-y-3">
                                        {analytics.rejectionAnalysis.rejectionReasons.map((reason, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                                <span className="text-gray-700">{reason.reason}</span>
                                                <span className="font-bold text-red-600">{reason.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <SafeChart data={analytics.rejectionAnalysis.rejectionReasons}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={analytics.rejectionAnalysis.rejectionReasons || []}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="reason" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#EF4444" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </SafeChart>
                            </div>
                        </div>
                    )}

                    {/* Admin Specific Sections */}
                    {isAdmin && (
                        <>
                            {/* Category Data Table */}
                            <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                                    <BarChart3 className="w-6 h-6 text-orange-600" />
                                    <span>Category Analytics</span>
                                </h2>
                                {Object.keys(analytics.categoryData || {}).length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Category</th>
                                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Users</th>
                                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Total Requests</th>
                                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Avg/User</th>
                                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Most Requested</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(analytics.categoryData || {}).map(([cat, data]) => (
                                                    <tr key={cat} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                                                        <td className="py-4 px-4 text-gray-900 font-medium">{cat}</td>
                                                        <td className="py-4 px-4 text-gray-600">{data.users}</td>
                                                        <td className="py-4 px-4 text-gray-600">{data.totalRequests}</td>
                                                        <td className="py-4 px-4 text-gray-600">{data.averageRequestsPerUser}</td>
                                                        <td className="py-4 px-4 text-gray-600 text-sm">{formatMostRequested(data.mostRequested)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No category data available</p>
                                )}
                            </div>

                            {/* Top Authors (table) */}
                            <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-6 mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                    <FileText className="w-5 h-5 text-indigo-600" />
                                    <span>Top Authors</span>
                                </h2>
                                {Array.isArray(analytics.topAuthors) && analytics.topAuthors.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Author</th>
                                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Requests</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analytics.topAuthors.map((a, idx) => (
                                                    <tr key={a.author || idx} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                                                        <td className="py-3 px-4 text-gray-600">{idx + 1}</td>
                                                        <td className="py-3 px-4 text-gray-900 font-medium">{a.author}</td>
                                                        <td className="py-3 px-4 text-right text-gray-600 font-bold">{a.count}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No author data available</p>
                                )}
                            </div>

                            {/* Top Publishers (table) */}
                            <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-6 mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                    <span>Top Publishers</span>
                                </h2>
                                {Array.isArray(analytics.topPublishers) && analytics.topPublishers.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Publisher</th>
                                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Requests</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analytics.topPublishers.map((p, idx) => (
                                                    <tr key={p.publisher || idx} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                                                        <td className="py-3 px-4 text-gray-600">{idx + 1}</td>
                                                        <td className="py-3 px-4 text-gray-900 font-medium">{p.publisher}</td>
                                                        <td className="py-3 px-4 text-right text-gray-600 font-bold">{p.count}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No publisher data available</p>
                                )}
                            </div>



                            {/* Department Data Table */}
                            <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                                    <BarChart3 className="w-6 h-6 text-green-600" />
                                    <span>Department Analytics</span>
                                </h2>
                                {Object.keys(analytics.departmentData || {}).length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Department</th>
                                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Users</th>
                                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Total Requests</th>
                                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Avg/User</th>
                                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Most Requested</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(analytics.departmentData || {}).map(([dep, data]) => (
                                                    <tr key={dep} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                                                        <td className="py-4 px-4 text-gray-900 font-medium">{dep}</td>
                                                        <td className="py-4 px-4 text-gray-600">{data.users}</td>
                                                        <td className="py-4 px-4 text-gray-600">{data.totalRequests}</td>
                                                        <td className="py-4 px-4 text-gray-600">{data.averageRequestsPerUser}</td>
                                                        <td className="py-4 px-4 text-gray-600 text-sm">{formatMostRequested(data.mostRequested)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No department data available</p>
                                )}
                            </div>

                            {/* User Analytics Table */}
                            <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                                    <Users className="w-6 h-6 text-blue-600" />
                                    <span>User Analytics</span>
                                </h2>
                                {analytics.usersAnalytics?.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">User Email</th>
                                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Total Requests</th>
                                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Success Rate</th>
                                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Accepted</th>
                                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Rejected</th>
                                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Most Requested</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analytics.usersAnalytics
                                                    .filter(user => user.userEmail.toLowerCase().includes(searchTerm.toLowerCase()))
                                                    .map((user, index) => (
                                                        <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                                                            <td className="py-4 px-4 text-gray-900 font-medium">{user.userEmail}</td>
                                                            <td className="py-4 px-4 text-gray-600">{user.totalRequests}</td>
                                                            <td className="py-4 px-4">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.successRate >= 70 ? 'bg-green-100 text-green-800' : user.successRate >= 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                                    {user.successRate}%
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-4 text-green-600 font-medium">{user.acceptedCount}</td>
                                                            <td className="py-4 px-4 text-red-600 font-medium">{user.rejectedCount}</td>
                                                            <td className="py-4 px-4 text-gray-600 text-xs">{formatMostRequested(user.mostRequested)}</td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No user analytics found</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Recent Requests Table */}
                    <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                            <FileText className="w-6 h-6 text-blue-600" />
                            <span>{isAdmin ? 'Recent Requests (All Users)' : 'My Recent Requests'}</span>
                        </h2>
                        {filteredRequests.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            {isAdmin && <th className="text-left py-4 px-4 font-semibold text-gray-700">User</th>}
                                            <th className="text-left py-4 px-4 font-semibold text-gray-700">Document Title</th>
                                            <th className="text-left py-4 px-4 font-semibold text-gray-700">Publisher</th>
                                            <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                                            {isAdmin && <th className="text-left py-4 px-4 font-semibold text-gray-700">Category</th>}
                                            {isAdmin && <th className="text-left py-4 px-4 font-semibold text-gray-700">Department</th>}
                                            <th className="text-left py-4 px-4 font-semibold text-gray-700">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRequests.map((request, index) => (
                                            <tr key={request._id || index} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                                                {isAdmin && <td className="py-4 px-4 text-gray-600 text-xs">{request.userEmail}</td>}
                                                <td className="py-4 px-4 text-gray-900 font-medium">{request.documentTitle}</td>
                                                <td className="py-4 px-4 text-gray-600">{request.publisher}</td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${request.status === 'accepted'
                                                        ? 'bg-green-100 text-green-800'
                                                        : request.status === 'rejected'
                                                            ? 'bg-red-100 text-red-800'
                                                            : request.status === 'pending'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : request.status === 'processing'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {request.status}
                                                    </span>
                                                </td>
                                                {isAdmin && <td className="py-4 px-4 text-gray-600">{request.category}</td>}
                                                {isAdmin && <td className="py-4 px-4 text-gray-600">{request.department}</td>}
                                                <td className="py-4 px-4 text-gray-600">
                                                    {new Date(request.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No requests found</p>
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
                        <span>Built with ❤️ by Kavya</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AnalyticsPage;