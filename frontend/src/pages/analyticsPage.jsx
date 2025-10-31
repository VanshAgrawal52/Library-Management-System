import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, TrendingUp, Users, FileText, BarChart3, Calendar, Clock, Target, AlertCircle, CheckCircle, XCircle, BookOpen, User, GraduationCap, Building2 } from 'lucide-react';
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
    const [statusMessage, setStatusMessage] = useState('');

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

    const formatMostRequested = (most) => {
        if (!most || most.length === 0) return 'None';
        return most.map(item => `${item.documentTitle} (${item.count})`).join(', ');
    };

    const SafeChart = ({ data, children }) => {
        if (!data || data.length === 0) {
            return (
                <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No data available</p>
                    </div>
                </div>
            );
        }
        return children;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
                <div className="bg-white border-l-4 border-red-600 shadow-xl rounded-lg p-6 max-w-md">
                    <div className="flex items-center space-x-3">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                        <div>
                            <p className="font-bold text-slate-900">Error Loading Analytics</p>
                            <p className="text-sm text-slate-600">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!analytics) return null;

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
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-800 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                                    <GraduationCap className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-slate-800 leading-tight">Indian Institute of Technology</h1>
                                    <p className="text-sm text-blue-700 font-semibold">Jodhpur</p>
                                </div>
                            </div>
                            <div className="hidden lg:block w-px h-12 bg-slate-300 ml-4"></div>
                            <div className="hidden lg:flex items-center space-x-2">
                                <BarChart3 className="w-5 h-5 text-blue-700" />
                                <span className="text-lg font-semibold text-slate-800">Analytics Dashboard</span>
                            </div>
                        </div>

                        {/* Right: Navigation */}
                        <div className="flex items-center space-x-6">
                            <div className="hidden md:flex items-center space-x-6">
                                <Link to="/" className="text-slate-700 hover:text-blue-700 font-medium transition-colors">New Request</Link>
                                <Link to="/dashboard" className="text-slate-700 hover:text-blue-700 font-medium transition-colors">Dashboard</Link>
                                <Link to="/library" className="text-slate-700 hover:text-blue-700 font-medium transition-colors">Library</Link>
                                <Link to="/adminPanel" className="text-slate-700 hover:text-blue-700 font-medium transition-colors">Admin Panel</Link>
                                <button onClick={handleLogout} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-all">Logout</button>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
                                <User className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-2 text-sm text-slate-600 mb-3">
                            <Building2 className="w-4 h-4" />
                            <span>Admin Dashboard</span>
                            <span>/</span>
                            <span className="text-blue-700 font-medium">Analytics & Insights</span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">
                            {isAdmin ? 'System Analytics & Insights' : 'My Request Analytics'}
                        </h2>
                        <p className="text-slate-600">
                            {isAdmin ? 'Comprehensive analytics and statistics for the IIT Jodhpur library system' : 'Track your document request performance and history'}
                        </p>
                    </div>

                    {/* Search and Date Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Search className="w-5 h-5 text-blue-700" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Search</h3>
                                    <p className="text-sm text-slate-600">Filter data by keyword</p>
                                </div>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder={isAdmin ? "Search requests or users..." : "Search your requests..."}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-purple-700" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Date Range</h3>
                                    <p className="text-sm text-slate-600">Filter by time period</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 mb-2 block">Start Date</label>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        selectsStart
                                        startDate={startDate}
                                        endDate={endDate}
                                        maxDate={endDate || null}
                                        isClearable
                                        placeholderText="Select start"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 mb-2 block">End Date</label>
                                    <DatePicker
                                        selected={endDate}
                                        onChange={(date) => setEndDate(date)}
                                        selectsEnd
                                        startDate={startDate}
                                        endDate={endDate}
                                        minDate={startDate || null}
                                        isClearable
                                        placeholderText="Select end"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            {(startDate || endDate) && (
                                <button
                                    onClick={() => { setStartDate(null); setEndDate(null); }}
                                    className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Clear Date Range
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {isAdmin ? (
                            <>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Users className="w-6 h-6 text-blue-700" />
                                        </div>
                                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <h3 className="text-slate-600 text-sm font-medium mb-1">Total Users</h3>
                                    <p className="text-3xl font-bold text-slate-900">{analytics.totalUsers}</p>
                                    <p className="text-xs text-slate-500 mt-2">{analytics.activeUsers} active users</p>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-purple-700" />
                                        </div>
                                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <h3 className="text-slate-600 text-sm font-medium mb-1">Total Requests</h3>
                                    <p className="text-3xl font-bold text-slate-900">{analytics.totalRequests}</p>
                                    <p className="text-xs text-slate-500 mt-2">{analytics.averageRequestsPerUser} avg per user</p>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                            <CheckCircle className="w-6 h-6 text-emerald-700" />
                                        </div>
                                    </div>
                                    <h3 className="text-slate-600 text-sm font-medium mb-1">Success Rate</h3>
                                    <p className="text-3xl font-bold text-slate-900">{analytics.successMetrics?.successRate}%</p>
                                    <p className="text-xs text-slate-500 mt-2">{analytics.successMetrics?.acceptedCount} accepted</p>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-amber-700" />
                                        </div>
                                    </div>
                                    <h3 className="text-slate-600 text-sm font-medium mb-1">Avg Response Time</h3>
                                    <p className="text-3xl font-bold text-slate-900">{analytics.timeMetrics?.averageResponseTimeDays} days</p>
                                    <p className="text-xs text-slate-500 mt-2">{analytics.timeMetrics?.completedRequestsCount} completed</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                        <FileText className="w-6 h-6 text-blue-700" />
                                    </div>
                                    <h3 className="text-slate-600 text-sm font-medium mb-1">Total Requests</h3>
                                    <p className="text-3xl font-bold text-slate-900">{analytics.totalRequests}</p>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                                        <CheckCircle className="w-6 h-6 text-emerald-700" />
                                    </div>
                                    <h3 className="text-slate-600 text-sm font-medium mb-1">Success Rate</h3>
                                    <p className="text-3xl font-bold text-slate-900">{analytics.successMetrics?.successRate}%</p>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                        <BarChart3 className="w-6 h-6 text-purple-700" />
                                    </div>
                                    <h3 className="text-slate-600 text-sm font-medium mb-1">Category</h3>
                                    <p className="text-2xl font-bold text-slate-900">{analytics.category}</p>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                                        <Target className="w-6 h-6 text-amber-700" />
                                    </div>
                                    <h3 className="text-slate-600 text-sm font-medium mb-1">Most Requested</h3>
                                    <p className="text-sm font-bold text-slate-900 line-clamp-2">{formatMostRequested(analytics.mostRequested)}</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Status Distribution Bar Chart */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                                <BarChart3 className="w-5 h-5 text-purple-600" />
                                <span>Requests by Status</span>
                            </h3>
                            <SafeChart data={Object.entries(analytics?.statusCounts || {})}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={Object.entries(analytics?.statusCounts || {}).map(([status, count]) => ({ status, count }))}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="status" stroke="#64748b" />
                                        <YAxis stroke="#64748b" />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                        />
                                        <Bar dataKey="count" fill="#A855F7" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </SafeChart>
                        </div>

                        {/* Status Distribution Pie Chart */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                                <span>Status Distribution</span>
                            </h3>
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

                        {/* Monthly Trends */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                                <span>Monthly Trends</span>
                            </h3>
                            <SafeChart data={analytics.trends?.monthly}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={analytics.trends?.monthly || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="month" stroke="#64748b" />
                                        <YAxis stroke="#64748b" />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                        />
                                        <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </SafeChart>
                        </div>

                        {/* Peak Activity Hours */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-amber-600" />
                                <span>Peak Activity Hours</span>
                            </h3>
                            <SafeChart data={analytics.peakActivity?.hourlyDistribution}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analytics.peakActivity?.hourlyDistribution || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="hour" stroke="#64748b" />
                                        <YAxis stroke="#64748b" />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                        />
                                        <Bar dataKey="count" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </SafeChart>
                        </div>

                        {isAdmin && Object.keys(analytics.categoryData || {}).length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                                    <BarChart3 className="w-5 h-5 text-orange-600" />
                                    <span>Requests by Category</span>
                                </h3>
                                <SafeChart data={Object.entries(analytics.categoryData || {})}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={Object.entries(analytics.categoryData || {}).map(([category, v]) => ({ category, count: v.totalRequests }))}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="category" stroke="#64748b" />
                                            <YAxis stroke="#64748b" />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                            />
                                            <Bar dataKey="count" fill="#FB923C" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </SafeChart>
                            </div>
                        )}

                        {isAdmin && Object.keys(analytics.departmentData || {}).length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                                    <Building2 className="w-5 h-5 text-emerald-600" />
                                    <span>Requests by Department</span>
                                </h3>
                                <SafeChart data={Object.entries(analytics.departmentData || {})}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={Object.entries(analytics.departmentData || {}).map(([department, v]) => ({ department, count: v.totalRequests }))}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="department" stroke="#64748b" />
                                            <YAxis stroke="#64748b" />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                            />
                                            <Bar dataKey="count" fill="#22C55E" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </SafeChart>
                            </div>
                        )}

                        {/* Publication Year Distribution */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                                <Calendar className="w-5 h-5 text-pink-600" />
                                <span>Publication Year Distribution</span>
                            </h3>
                            <SafeChart data={analytics.publicationYearDistribution}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analytics.publicationYearDistribution || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="year" stroke="#64748b" />
                                        <YAxis stroke="#64748b" />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                        />
                                        <Bar dataKey="count" fill="#EC4899" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </SafeChart>
                        </div>

                        {/* Daily Activity Distribution */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                                <BarChart3 className="w-5 h-5 text-cyan-600" />
                                <span>Activity by Day of Week</span>
                            </h3>
                            <SafeChart data={analytics.peakActivity?.dailyDistribution}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analytics.peakActivity?.dailyDistribution || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="day" stroke="#64748b" />
                                        <YAxis stroke="#64748b" />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                        />
                                        <Bar dataKey="count" fill="#06B6D4" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </SafeChart>
                        </div>
                    </div>

                    {/* Rejection Analysis */}
                    {analytics.rejectionAnalysis?.totalRejected > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
                                <XCircle className="w-6 h-6 text-red-600" />
                                <span>Rejection Analysis</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-slate-600 mb-4">
                                        Total Rejections: <span className="text-2xl font-bold text-red-600">{analytics.rejectionAnalysis.totalRejected}</span>
                                    </p>
                                    <div className="space-y-3">
                                        {analytics.rejectionAnalysis.rejectionReasons.map((reason, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                                                <span className="text-slate-900 font-medium">{reason.reason}</span>
                                                <span className="font-bold text-red-600">{reason.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <SafeChart data={analytics.rejectionAnalysis.rejectionReasons}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={analytics.rejectionAnalysis.rejectionReasons || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="reason" stroke="#64748b" />
                                            <YAxis stroke="#64748b" />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                            />
                                            <Bar dataKey="count" fill="#EF4444" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </SafeChart>
                            </div>
                        </div>
                    )}

                    {/* Admin Specific Tables */}
                    {isAdmin && (
                        <>
                            {/* Category Data Table */}
                            {Object.keys(analytics.categoryData || {}).length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
                                        <BarChart3 className="w-6 h-6 text-orange-600" />
                                        <span>Category Analytics</span>
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Category</th>
                                                    <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Users</th>
                                                    <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Total Requests</th>
                                                    <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Avg/User</th>
                                                    <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Most Requested</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {Object.entries(analytics.categoryData || {}).map(([cat, data]) => (
                                                    <tr key={cat} className="hover:bg-slate-50 transition-colors">
                                                        <td className="py-4 px-4 text-slate-900 font-medium">{cat}</td>
                                                        <td className="py-4 px-4 text-slate-600">{data.users}</td>
                                                        <td className="py-4 px-4 text-slate-600">{data.totalRequests}</td>
                                                        <td className="py-4 px-4 text-slate-600">{data.averageRequestsPerUser}</td>
                                                        <td className="py-4 px-4 text-slate-600 text-sm">{formatMostRequested(data.mostRequested)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Department Data Table */}
                            {Object.keys(analytics.departmentData || {}).length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
                                        <Building2 className="w-6 h-6 text-emerald-600" />
                                        <span>Department Analytics</span>
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Department</th>
                                                    <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Users</th>
                                                    <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Total Requests</th>
                                                    <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Avg/User</th>
                                                    <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Most Requested</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {Object.entries(analytics.departmentData || {}).map(([dep, data]) => (
                                                    <tr key={dep} className="hover:bg-slate-50 transition-colors">
                                                        <td className="py-4 px-4 text-slate-900 font-medium">{dep}</td>
                                                        <td className="py-4 px-4 text-slate-600">{data.users}</td>
                                                        <td className="py-4 px-4 text-slate-600">{data.totalRequests}</td>
                                                        <td className="py-4 px-4 text-slate-600">{data.averageRequestsPerUser}</td>
                                                        <td className="py-4 px-4 text-slate-600 text-sm">{formatMostRequested(data.mostRequested)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Top Publishers & Authors */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* Top Publishers */}
                                {Array.isArray(analytics.topPublishers) && analytics.topPublishers.length > 0 && (
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                                            <BarChart3 className="w-5 h-5 text-blue-600" />
                                            <span>Top Publishers</span>
                                        </h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-50 border-b border-slate-200">
                                                    <tr>
                                                        <th className="text-left py-3 px-4 text-xs font-bold text-slate-700">Rank</th>
                                                        <th className="text-left py-3 px-4 text-xs font-bold text-slate-700">Publisher</th>
                                                        <th className="text-right py-3 px-4 text-xs font-bold text-slate-700">Requests</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200">
                                                    {analytics.topPublishers.map((p, idx) => (
                                                        <tr key={p.publisher || idx} className="hover:bg-slate-50">
                                                            <td className="py-3 px-4 text-slate-600">{idx + 1}</td>
                                                            <td className="py-3 px-4 text-slate-900 font-medium">{p.publisher}</td>
                                                            <td className="py-3 px-4 text-right text-slate-600 font-bold">{p.count}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Top Authors */}
                                {Array.isArray(analytics.topAuthors) && analytics.topAuthors.length > 0 && (
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                                            <FileText className="w-5 h-5 text-indigo-600" />
                                            <span>Top Authors</span>
                                        </h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-50 border-b border-slate-200">
                                                    <tr>
                                                        <th className="text-left py-3 px-4 text-xs font-bold text-slate-700">Rank</th>
                                                        <th className="text-left py-3 px-4 text-xs font-bold text-slate-700">Author</th>
                                                        <th className="text-right py-3 px-4 text-xs font-bold text-slate-700">Requests</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200">
                                                    {analytics.topAuthors.map((a, idx) => (
                                                        <tr key={a.author || idx} className="hover:bg-slate-50">
                                                            <td className="py-3 px-4 text-slate-600">{idx + 1}</td>
                                                            <td className="py-3 px-4 text-slate-900 font-medium">{a.author}</td>
                                                            <td className="py-3 px-4 text-right text-slate-600 font-bold">{a.count}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Analytics Table */}
                            {analytics.usersAnalytics?.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
                                        <Users className="w-6 h-6 text-blue-600" />
                                        <span>User Performance Analytics</span>
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">User Email</th>
                                                    <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Total Requests</th>
                                                    <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Success Rate</th>
                                                    <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Accepted</th>
                                                    <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Rejected</th>
                                                    <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Most Requested</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {analytics.usersAnalytics
                                                    .filter(user => user.userEmail.toLowerCase().includes(searchTerm.toLowerCase()))
                                                    .map((user, index) => (
                                                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                            <td className="py-4 px-4 text-slate-900 font-medium">{user.userEmail}</td>
                                                            <td className="py-4 px-4 text-slate-600">{user.totalRequests}</td>
                                                            <td className="py-4 px-4">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                                    user.successRate >= 70 
                                                                        ? 'bg-emerald-100 text-emerald-800' 
                                                                        : user.successRate >= 40 
                                                                            ? 'bg-amber-100 text-amber-800' 
                                                                            : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {user.successRate}%
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-4 text-emerald-600 font-medium">{user.acceptedCount}</td>
                                                            <td className="py-4 px-4 text-red-600 font-medium">{user.rejectedCount}</td>
                                                            <td className="py-4 px-4 text-slate-600 text-xs">{formatMostRequested(user.mostRequested)}</td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Recent Requests Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
                            <FileText className="w-6 h-6 text-blue-600" />
                            <span>{isAdmin ? 'Recent Requests (All Users)' : 'My Recent Requests'}</span>
                        </h3>
                        {filteredRequests.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            {isAdmin && <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">User</th>}
                                            <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Document Title</th>
                                            <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Publisher</th>
                                            <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Status</th>
                                            {isAdmin && <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Category</th>}
                                            {isAdmin && <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Department</th>}
                                            <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {filteredRequests.map((request, index) => (
                                            <tr key={request._id || index} className="hover:bg-slate-50 transition-colors">
                                                {isAdmin && <td className="py-4 px-4 text-slate-600 text-xs">{request.userEmail}</td>}
                                                <td className="py-4 px-4 text-slate-900 font-medium">{request.documentTitle}</td>
                                                <td className="py-4 px-4 text-slate-600">{request.publisher}</td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        request.status === 'accepted'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : request.status === 'rejected'
                                                                ? 'bg-red-100 text-red-800'
                                                                : request.status === 'pending'
                                                                    ? 'bg-amber-100 text-amber-800'
                                                                    : request.status === 'processing'
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : 'bg-slate-100 text-slate-800'
                                                    }`}>
                                                        {request.status}
                                                    </span>
                                                </td>
                                                {isAdmin && <td className="py-4 px-4 text-slate-600">{request.category}</td>}
                                                {isAdmin && <td className="py-4 px-4 text-slate-600">{request.department}</td>}
                                                <td className="py-4 px-4 text-slate-600">
                                                    {new Date(request.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">No requests found</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-800 to-blue-600 rounded-lg flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
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

export default AnalyticsPage;