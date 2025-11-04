import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, TrendingUp, Users, FileText, BarChart3, Calendar, Clock, Target, AlertCircle, CheckCircle, XCircle, BookOpen, User, GraduationCap, Building2, Download } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { Link, useNavigate } from "react-router-dom";
import 'react-datepicker/dist/react-datepicker.css';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logo from '../assets/logo.png';

const AnalyticsPage = () => {
    const navigate = useNavigate();
    const reportRef = useRef(null);
    const [analytics, setAnalytics] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

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

    const generateReport = async () => {
        setIsGeneratingReport(true);
        setStatusMessage('Generating report... Please wait.');

        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            let yPosition = margin;

            // Helper function to add new page if needed
            const checkPageBreak = (requiredSpace) => {
                if (yPosition + requiredSpace > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                    return true;
                }
                return false;
            };

            // ==================== COVER PAGE ====================
            // Modern gradient background with multiple layers
            pdf.setFillColor(15, 23, 42); // Deep navy - top
            pdf.rect(0, 0, pageWidth, pageHeight * 0.35, 'F');

            pdf.setFillColor(30, 58, 138); // Royal blue - middle
            pdf.rect(0, pageHeight * 0.35, pageWidth, pageHeight * 0.30, 'F');

            pdf.setFillColor(37, 99, 235); // Bright blue
            pdf.rect(0, pageHeight * 0.65, pageWidth, pageHeight * 0.20, 'F');

            pdf.setFillColor(59, 130, 246); // Light blue - bottom
            pdf.rect(0, pageHeight * 0.85, pageWidth, pageHeight * 0.15, 'F');

            // Decorative geometric patterns
            pdf.setFillColor(255, 255, 255);
            pdf.setGState(new pdf.GState({ opacity: 0.05 }));

            // Large circles
            pdf.circle(pageWidth * 0.85, pageHeight * 0.15, 45, 'F');
            pdf.circle(pageWidth * 0.15, pageHeight * 0.25, 35, 'F');
            pdf.circle(pageWidth * 0.90, pageHeight * 0.75, 50, 'F');
            pdf.circle(pageWidth * 0.10, pageHeight * 0.85, 40, 'F');

            // Geometric shapes
            pdf.setLineWidth(2);
            pdf.setDrawColor(255, 255, 255);
            pdf.circle(pageWidth * 0.20, pageHeight * 0.50, 20, 'S');
            pdf.circle(pageWidth * 0.80, pageHeight * 0.45, 25, 'S');

            pdf.setGState(new pdf.GState({ opacity: 1 }));

            // Accent line at top
            pdf.setFillColor(251, 191, 36); // Golden accent
            pdf.rect(0, pageHeight * 0.12, pageWidth, 3, 'F');

            pdf.setFillColor(16, 185, 129); // Emerald accent
            pdf.rect(0, pageHeight * 0.125, pageWidth, 1, 'F');

            // Institution Logo/Icon Area
            const logoSize = 24;
            const logoX = (pageWidth - logoSize) / 2;
            const logoY = 25;

            pdf.setFillColor(255, 255, 255);
            pdf.setGState(new pdf.GState({ opacity: 0.15 }));
            pdf.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize, 'F');
            pdf.setGState(new pdf.GState({ opacity: 1 }));

            // Main Institution Name
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(38);
            pdf.setFont('helvetica', 'bold');
            pdf.text('IIT JODHPUR', pageWidth / 2, 65, { align: 'center' });

            // Decorative underline
            pdf.setDrawColor(251, 191, 36);
            pdf.setLineWidth(1.5);
            pdf.line(pageWidth * 0.35, 68, pageWidth * 0.65, 68);

            // Subtitle
            pdf.setFontSize(24);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Central Library', pageWidth / 2, 80, { align: 'center' });

            // Main Report Title with background
            const titleBoxY = 100;
            const titleBoxHeight = 35;

            pdf.setFillColor(255, 255, 255);
            pdf.setGState(new pdf.GState({ opacity: 0.95 }));
            pdf.roundedRect(margin + 10, titleBoxY, pageWidth - 2 * margin - 20, titleBoxHeight, 4, 4, 'F');
            pdf.setGState(new pdf.GState({ opacity: 1 }));

            // Gradient effect bars on title box
            pdf.setFillColor(59, 130, 246);
            pdf.roundedRect(margin + 10, titleBoxY, 4, titleBoxHeight, 2, 2, 'F');
            pdf.setFillColor(251, 191, 36);
            pdf.roundedRect(pageWidth - margin - 14, titleBoxY, 4, titleBoxHeight, 2, 2, 'F');

            pdf.setTextColor(30, 58, 138);
            pdf.setFontSize(32);
            pdf.setFont('helvetica', 'bold');
            pdf.text('ANALYTICS REPORT', pageWidth / 2, titleBoxY + 15, { align: 'center' });

            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(71, 85, 105);
            pdf.text('Comprehensive Performance & Insights Dashboard', pageWidth / 2, titleBoxY + 27, { align: 'center' });

            // Report Metadata Cards
            const cardY = 150;
            const coverCardWidth = (pageWidth - 2 * margin - 20) / 2;
            const coverCardHeight = 45;
            const cardGap = 10;

            // Date Card
            pdf.setFillColor(255, 255, 255);
            pdf.setGState(new pdf.GState({ opacity: 0.95 }));
            pdf.roundedRect(margin + 10, cardY, coverCardWidth, coverCardHeight, 4, 4, 'F');
            pdf.setGState(new pdf.GState({ opacity: 1 }));

            // Accent bar
            pdf.setFillColor(59, 130, 246);
            pdf.roundedRect(margin + 10, cardY, 5, coverCardHeight, 4, 4, 'F');

            pdf.setTextColor(30, 58, 138);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text('REPORT GENERATED', margin + 20, cardY + 12);

            pdf.setFontSize(13);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(51, 65, 85);
            pdf.text(new Date().toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }), margin + 20, cardY + 22);

            pdf.setFontSize(10);
            pdf.setTextColor(100, 116, 139);
            pdf.text(`Time: ${new Date().toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit'
            })}`, margin + 20, cardY + 32);

            // Period Card
            pdf.setFillColor(255, 255, 255);
            pdf.setGState(new pdf.GState({ opacity: 0.95 }));
            pdf.roundedRect(margin + 10 + coverCardWidth + cardGap, cardY, coverCardWidth, coverCardHeight, 4, 4, 'F');
            pdf.setGState(new pdf.GState({ opacity: 1 }));

            // Accent bar
            pdf.setFillColor(251, 191, 36);
            pdf.roundedRect(margin + 10 + coverCardWidth + cardGap, cardY, 5, coverCardHeight, 4, 4, 'F');

            pdf.setTextColor(30, 58, 138);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text('REPORTING PERIOD', margin + 20 + coverCardWidth + cardGap, cardY + 12);

            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(51, 65, 85);
            if (startDate || endDate) {
                const periodText = `${startDate ? startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Beginning'}`;
                const periodText2 = `to ${endDate ? endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Present'}`;
                pdf.text(periodText, margin + 20 + coverCardWidth + cardGap, cardY + 22);
                pdf.text(periodText2, margin + 20 + coverCardWidth + cardGap, cardY + 30);
            } else {
                pdf.text('Complete Historical Data', margin + 20 + coverCardWidth + cardGap, cardY + 22);
                pdf.text('All Time Records', margin + 20 + coverCardWidth + cardGap, cardY + 30);
            }

            // Stats Preview Bar
            const statsY = 210;
            const statsHeight = 28;

            pdf.setFillColor(16, 185, 129);
            pdf.setGState(new pdf.GState({ opacity: 0.90 }));
            pdf.roundedRect(margin + 10, statsY, pageWidth - 2 * margin - 20, statsHeight, 4, 4, 'F');
            pdf.setGState(new pdf.GState({ opacity: 1 }));

            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');

            const statSpacing = (pageWidth - 2 * margin - 20) / 4;
            const statsStartX = margin + 10 + statSpacing / 2;

            pdf.text(`${analytics.totalUsers}`, statsStartX, statsY + 12, { align: 'center' });
            pdf.text(`${analytics.totalRequests}`, statsStartX + statSpacing, statsY + 12, { align: 'center' });
            pdf.text(`${analytics.successMetrics?.successRate}%`, statsStartX + statSpacing * 2, statsY + 12, { align: 'center' });
            pdf.text(`${analytics.timeMetrics?.averageResponseTimeDays}d`, statsStartX + statSpacing * 3, statsY + 12, { align: 'center' });

            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Total Users', statsStartX, statsY + 20, { align: 'center' });
            pdf.text('Requests', statsStartX + statSpacing, statsY + 20, { align: 'center' });
            pdf.text('Success Rate', statsStartX + statSpacing * 2, statsY + 20, { align: 'center' });
            pdf.text('Avg Response', statsStartX + statSpacing * 3, statsY + 20, { align: 'center' });

            // Footer section on cover
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'italic');
            pdf.setGState(new pdf.GState({ opacity: 0.8 }));
            pdf.text('CONFIDENTIAL DOCUMENT', pageWidth / 2, pageHeight - 35, { align: 'center' });
            pdf.setFontSize(8);
            pdf.text('For Internal Use Only - Authorized Personnel', pageWidth / 2, pageHeight - 27, { align: 'center' });
            pdf.setGState(new pdf.GState({ opacity: 1 }));

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(7);
            pdf.setGState(new pdf.GState({ opacity: 0.7 }));
            pdf.text('NH 62, Surpura Bypass Road, Karwar, Jodhpur - 342030, Rajasthan, India', pageWidth / 2, pageHeight - 15, { align: 'center' });
            pdf.text('library@iitj.ac.in | +91-291-280-1234', pageWidth / 2, pageHeight - 10, { align: 'center' });
            pdf.setGState(new pdf.GState({ opacity: 1 }));

            // ==================== TABLE OF CONTENTS ====================
            pdf.addPage();
            yPosition = margin;

            // Elegant header with gradient
            pdf.setFillColor(15, 23, 42);
            pdf.rect(0, 0, pageWidth, 45, 'F');

            // Accent stripe
            pdf.setFillColor(251, 191, 36);
            pdf.rect(0, 45, pageWidth, 3, 'F');

            // Decorative elements
            pdf.setFillColor(255, 255, 255);
            pdf.setGState(new pdf.GState({ opacity: 0.05 }));
            pdf.circle(pageWidth * 0.15, 22, 30, 'F');
            pdf.circle(pageWidth * 0.85, 22, 35, 'F');
            pdf.setGState(new pdf.GState({ opacity: 1 }));

            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(28);
            pdf.setFont('helvetica', 'bold');
            pdf.text('TABLE OF CONTENTS', pageWidth / 2, 28, { align: 'center' });

            yPosition = 65;

            const tocItems = [
                { title: 'Executive Summary', icon: '📊', color: [59, 130, 246] },
                { title: 'Key Performance Indicators', icon: '📈', color: [168, 85, 247] },
                { title: 'Visual Analytics', icon: '📉', color: [16, 185, 129] },
                { title: 'Status Distribution Analysis', icon: '🎯', color: [245, 158, 11] },
                { title: 'Category & Department Breakdown', icon: '📚', color: [236, 72, 153] },
                { title: 'Publication Trends', icon: '📖', color: [14, 165, 233] },
                { title: 'Top Publishers & Authors', icon: '🏆', color: [251, 191, 36] },
                { title: 'User Performance Metrics', icon: '👥', color: [139, 92, 246] },
                { title: 'Peak Activity Analysis', icon: '⏰', color: [239, 68, 68] },
                { title: 'Recommendations & Insights', icon: '💡', color: [34, 197, 94] }
            ];

            tocItems.forEach((item, index) => {
                checkPageBreak(18);

                // Alternating style for visual interest
                if (index % 2 === 0) {
                    pdf.setFillColor(248, 250, 252);
                    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 14, 3, 3, 'F');
                } else {
                    pdf.setFillColor(255, 255, 255);
                    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 14, 3, 3, 'F');
                    pdf.setDrawColor(226, 232, 240);
                    pdf.setLineWidth(0.5);
                    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 14, 3, 3, 'S');
                }

                // Colored accent dot
                pdf.setFillColor(...item.color);
                pdf.circle(margin + 8, yPosition + 7, 3, 'F');

                // Section number with colored background
                pdf.setFillColor(...item.color);
                pdf.setGState(new pdf.GState({ opacity: 0.15 }));
                pdf.roundedRect(margin + 15, yPosition + 3, 12, 8, 2, 2, 'F');
                pdf.setGState(new pdf.GState({ opacity: 1 }));

                pdf.setTextColor(...item.color);
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold');
                pdf.text(`${index + 1}`, margin + 21, yPosition + 9, { align: 'center' });

                // Section title
                pdf.setTextColor(30, 41, 59);
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'bold');
                pdf.text(item.title, margin + 32, yPosition + 9);

                // Dotted line to page number
                pdf.setDrawColor(203, 213, 225);
                pdf.setLineWidth(0.3);
                pdf.setLineDash([1, 2], 0);
                const textWidth = pdf.getTextWidth(item.title);
                pdf.line(margin + 35 + textWidth, yPosition + 8, pageWidth - margin - 20, yPosition + 8);
                pdf.setLineDash([], 0);

                // Page number
                pdf.setTextColor(100, 116, 139);
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');
                pdf.text(`${index + 3}`, pageWidth - margin - 15, yPosition + 9);

                yPosition += 17;
            });

            // Bottom decorative note
            yPosition += 10;
            pdf.setFillColor(240, 249, 255);
            pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 20, 3, 3, 'F');

            pdf.setFillColor(59, 130, 246);
            pdf.roundedRect(margin, yPosition, 4, 20, 2, 2, 'F');

            pdf.setTextColor(71, 85, 105);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'italic');
            pdf.text('This document contains comprehensive analytics and insights for strategic decision-making.', margin + 10, yPosition + 8);
            pdf.text('Navigate to any section using the page numbers listed above.', margin + 10, yPosition + 15);

            // ==================== EXECUTIVE SUMMARY ====================
            pdf.addPage();
            yPosition = margin;

            // Modern gradient header
            pdf.setFillColor(15, 23, 42);
            pdf.rect(0, 0, pageWidth, 40, 'F');

            // Multi-colored accent stripes
            pdf.setFillColor(59, 130, 246);
            pdf.rect(0, 40, pageWidth * 0.33, 2.5, 'F');
            pdf.setFillColor(251, 191, 36);
            pdf.rect(pageWidth * 0.33, 40, pageWidth * 0.34, 2.5, 'F');
            pdf.setFillColor(16, 185, 129);
            pdf.rect(pageWidth * 0.67, 40, pageWidth * 0.33, 2.5, 'F');

            // Decorative corner elements
            pdf.setFillColor(255, 255, 255);
            pdf.setGState(new pdf.GState({ opacity: 0.06 }));
            pdf.circle(pageWidth * 0.10, 20, 25, 'F');
            pdf.circle(pageWidth * 0.90, 20, 28, 'F');
            pdf.setGState(new pdf.GState({ opacity: 1 }));

            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(26);
            pdf.setFont('helvetica', 'bold');
            pdf.text('EXECUTIVE SUMMARY', pageWidth / 2, 26, { align: 'center' });

            yPosition = 55;

            // Date Range if applicable
            pdf.setTextColor(0, 0, 0);
            if (startDate || endDate) {
                pdf.setFillColor(240, 249, 255);
                pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 12, 2, 2, 'F');
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(30, 64, 175);
                pdf.text('Report Period:', margin + 5, yPosition + 8);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(0, 0, 0);
                const dateRange = `${startDate ? startDate.toLocaleDateString() : 'Beginning'} to ${endDate ? endDate.toLocaleDateString() : 'Present'}`;
                pdf.text(dateRange, margin + 45, yPosition + 8);
                yPosition += 20;
            }

            // Key Highlights Section with modern design
            pdf.setFillColor(240, 249, 255);
            pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 12, 3, 3, 'F');

            // Gradient accent bar
            pdf.setFillColor(59, 130, 246);
            pdf.roundedRect(margin, yPosition, 5, 12, 3, 3, 'F');

            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(30, 58, 138);
            pdf.text('KEY HIGHLIGHTS', margin + 12, yPosition + 8);

            yPosition += 17;

            const highlights = [
                { icon: '👥', text: `Total of ${analytics.totalUsers} registered users with ${analytics.activeUsers} active users`, color: [59, 130, 246] },
                { icon: '📄', text: `${analytics.totalRequests} document requests processed`, color: [168, 85, 247] },
                { icon: '✅', text: `${analytics.successMetrics?.successRate}% success rate with ${analytics.successMetrics?.acceptedCount} accepted requests`, color: [16, 185, 129] },
                { icon: '⏱️', text: `Average response time of ${analytics.timeMetrics?.averageResponseTimeDays} days`, color: [245, 158, 11] },
                { icon: '🎯', text: `${analytics.timeMetrics?.completedRequestsCount} requests successfully completed`, color: [34, 197, 94] }
            ];

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            highlights.forEach((highlight, index) => {
                checkPageBreak(12);

                // Stylish card for each highlight
                pdf.setFillColor(255, 255, 255);
                pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, 'F');

                pdf.setDrawColor(...highlight.color);
                pdf.setLineWidth(0.5);
                pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, 'S');

                // Colored icon background
                pdf.setFillColor(...highlight.color);
                pdf.setGState(new pdf.GState({ opacity: 0.1 }));
                pdf.circle(margin + 6, yPosition + 5, 4, 'F');
                pdf.setGState(new pdf.GState({ opacity: 1 }));

                // Colored dot
                pdf.setFillColor(...highlight.color);
                pdf.circle(margin + 6, yPosition + 5, 2, 'F');

                pdf.setTextColor(51, 65, 85);
                const splitText = pdf.splitTextToSize(highlight.text, pageWidth - 2 * margin - 20);
                pdf.text(splitText, margin + 13, yPosition + 6.5);

                yPosition += 12;
            });

            yPosition += 8;

            // ==================== KPI CARDS ====================
            // Section header with modern styling
            pdf.setFillColor(240, 249, 255);
            pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 12, 3, 3, 'F');

            pdf.setFillColor(168, 85, 247);
            pdf.roundedRect(margin, yPosition, 5, 12, 3, 3, 'F');

            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(30, 58, 138);
            pdf.text('KEY PERFORMANCE INDICATORS', margin + 12, yPosition + 8);

            yPosition += 17;

            const kpiData = [
                { label: 'TOTAL USERS', value: analytics.totalUsers, color: [59, 130, 246], bgColor: [219, 234, 254], subtext: `${analytics.activeUsers} active`, icon: '👥' },
                { label: 'TOTAL REQUESTS', value: analytics.totalRequests, color: [168, 85, 247], bgColor: [243, 232, 255], subtext: `${analytics.averageRequestsPerUser} avg/user`, icon: '📊' },
                { label: 'SUCCESS RATE', value: `${analytics.successMetrics?.successRate}%`, color: [16, 185, 129], bgColor: [209, 250, 229], subtext: `${analytics.successMetrics?.acceptedCount} accepted`, icon: '✅' },
                { label: 'AVG RESPONSE', value: `${analytics.timeMetrics?.averageResponseTimeDays}d`, color: [245, 158, 11], bgColor: [254, 243, 199], subtext: `${analytics.timeMetrics?.completedRequestsCount} completed`, icon: '⏱️' }
            ];

            const cardWidth = (pageWidth - 2 * margin - 15) / 2;
            const cardHeight = 32;
            let xPos = margin;
            let cardRow = 0;

            kpiData.forEach((kpi, index) => {
                checkPageBreak(cardHeight + 5);

                // Card with shadow effect
                pdf.setFillColor(255, 255, 255);
                pdf.roundedRect(xPos, yPosition, cardWidth, cardHeight, 4, 4, 'F');

                // Colored gradient effect on top
                pdf.setFillColor(...kpi.color);
                pdf.setGState(new pdf.GState({ opacity: 0.08 }));
                pdf.roundedRect(xPos, yPosition, cardWidth, cardHeight, 4, 4, 'F');
                pdf.setGState(new pdf.GState({ opacity: 1 }));

                // Border
                pdf.setDrawColor(...kpi.color);
                pdf.setLineWidth(1);
                pdf.roundedRect(xPos, yPosition, cardWidth, cardHeight, 4, 4, 'S');

                // Top colored strip
                pdf.setFillColor(...kpi.color);
                pdf.roundedRect(xPos, yPosition, cardWidth, 3, 4, 4, 'F');

                // Icon background circle
                pdf.setFillColor(...kpi.bgColor);
                pdf.circle(xPos + 10, yPosition + 13, 6, 'F');

                // Label
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(100, 116, 139);
                pdf.text(kpi.label, xPos + 19, yPosition + 12);

                // Value - larger and prominent
                pdf.setFontSize(20);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(...kpi.color);
                pdf.text(String(kpi.value), xPos + 19, yPosition + 22);

                // Subtext with icon
                pdf.setFontSize(8);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(100, 116, 139);
                pdf.text(`↳ ${kpi.subtext}`, xPos + 19, yPosition + 28);

                if (index % 2 === 0) {
                    xPos = margin + cardWidth + 5;
                } else {
                    xPos = margin;
                    yPosition += cardHeight + 5;
                    cardRow++;
                }
            });

            if (kpiData.length % 2 !== 0) {
                yPosition += cardHeight + 5;
            }

            yPosition += 12;

            // ==================== VISUAL ANALYTICS ====================
            checkPageBreak(80);

            // Add page break for charts section with elegant header
            pdf.addPage();
            yPosition = margin;

            // Modern gradient header
            pdf.setFillColor(15, 23, 42);
            pdf.rect(0, 0, pageWidth, 40, 'F');

            // Multi-colored accent stripes
            pdf.setFillColor(59, 130, 246);
            pdf.rect(0, 40, pageWidth * 0.25, 2.5, 'F');
            pdf.setFillColor(168, 85, 247);
            pdf.rect(pageWidth * 0.25, 40, pageWidth * 0.25, 2.5, 'F');
            pdf.setFillColor(16, 185, 129);
            pdf.rect(pageWidth * 0.50, 40, pageWidth * 0.25, 2.5, 'F');
            pdf.setFillColor(251, 191, 36);
            pdf.rect(pageWidth * 0.75, 40, pageWidth * 0.25, 2.5, 'F');

            // Decorative corner elements
            pdf.setFillColor(255, 255, 255);
            pdf.setGState(new pdf.GState({ opacity: 0.06 }));
            pdf.circle(pageWidth * 0.12, 20, 25, 'F');
            pdf.circle(pageWidth * 0.88, 20, 28, 'F');
            pdf.setGState(new pdf.GState({ opacity: 1 }));

            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(26);
            pdf.setFont('helvetica', 'bold');
            pdf.text('VISUAL ANALYTICS', pageWidth / 2, 26, { align: 'center' });

            yPosition = 55;

            // Wait for all charts to fully render (animations are disabled)
            setStatusMessage('Rendering charts... Please wait.');
            await new Promise(resolve => setTimeout(resolve, 500));

            // Capture and add charts
            const chartElements = document.querySelectorAll('[data-chart]');
            setStatusMessage(`Capturing ${chartElements.length} charts...`);

            for (let i = 0; i < chartElements.length; i++) {
                const element = chartElements[i];
                const chartTitle = element.getAttribute('data-chart-title');

                setStatusMessage(`Capturing chart ${i + 1} of ${chartElements.length}: ${chartTitle}...`);

                // Check if chart has actual content (not just "No data available")
                const hasContent = element.querySelector('svg') || element.querySelector('canvas');

                if (!hasContent) {
                    console.log(`Skipping chart "${chartTitle}" - no content found`);
                    continue;
                }

                checkPageBreak(90);

                // Modern chart header with gradient accent
                const chartColors = [
                    [59, 130, 246],    // Blue
                    [168, 85, 247],    // Purple
                    [16, 185, 129],    // Green
                    [245, 158, 11],    // Orange
                    [236, 72, 153],    // Pink
                    [14, 165, 233]     // Cyan
                ];
                const chartColor = chartColors[i % chartColors.length];

                // Header background with gradient effect
                pdf.setFillColor(255, 255, 255);
                pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 14, 3, 3, 'F');

                // Colored accent strip on left
                pdf.setFillColor(...chartColor);
                pdf.roundedRect(margin, yPosition, 4, 14, 3, 3, 'F');

                // Decorative top border
                pdf.setFillColor(...chartColor);
                pdf.setGState(new pdf.GState({ opacity: 0.3 }));
                pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 3, 3, 3, 'F');
                pdf.setGState(new pdf.GState({ opacity: 1 }));

                // Chart number badge
                pdf.setFillColor(...chartColor);
                pdf.setGState(new pdf.GState({ opacity: 0.15 }));
                pdf.circle(margin + 12, yPosition + 7, 5, 'F');
                pdf.setGState(new pdf.GState({ opacity: 1 }));

                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(...chartColor);
                pdf.text(`${i + 1}`, margin + 12, yPosition + 9, { align: 'center' });

                // Chart title
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(30, 41, 59);
                pdf.text(chartTitle, margin + 20, yPosition + 9);

                yPosition += 16;

                try {
                    // Small delay per chart to ensure DOM is stable
                    await new Promise(resolve => setTimeout(resolve, 100));

                    const canvas = await html2canvas(element, {
                        scale: 2,
                        backgroundColor: '#ffffff',
                        logging: false,
                        useCORS: true,
                        allowTaint: true,
                        windowWidth: element.scrollWidth,
                        windowHeight: element.scrollHeight
                    });

                    const imgData = canvas.toDataURL('image/png');
                    const imgWidth = pageWidth - (2 * margin) - 4;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;

                    // Check if image fits on current page
                    if (yPosition + imgHeight > pageHeight - margin) {
                        pdf.addPage();
                        yPosition = margin;
                    }

                    // Stylish border with shadow effect
                    pdf.setFillColor(248, 250, 252);
                    pdf.roundedRect(margin, yPosition, imgWidth + 6, imgHeight + 6, 3, 3, 'F');

                    // Inner white background
                    pdf.setFillColor(255, 255, 255);
                    pdf.roundedRect(margin + 2, yPosition + 2, imgWidth + 2, imgHeight + 2, 2, 2, 'F');

                    // Colored border matching chart theme
                    pdf.setDrawColor(...chartColor);
                    pdf.setLineWidth(1);
                    pdf.roundedRect(margin + 2, yPosition + 2, imgWidth + 2, imgHeight + 2, 2, 2, 'S');

                    pdf.addImage(imgData, 'PNG', margin + 3, yPosition + 3, imgWidth, imgHeight);
                    yPosition += imgHeight + 18;
                } catch (error) {
                    console.error(`Error capturing chart "${chartTitle}":`, error);
                    // Add a note that chart couldn't be captured
                    pdf.setFontSize(10);
                    pdf.setTextColor(220, 38, 38);
                    pdf.text(`[Chart could not be captured]`, margin + 5, yPosition + 10);
                    yPosition += 20;
                }
            }

            setStatusMessage('Finalizing report...');

            // ==================== STATUS DISTRIBUTION TABLE ====================
            checkPageBreak(50);

            // Modern section header
            pdf.setFillColor(255, 255, 255);
            pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 14, 3, 3, 'F');

            pdf.setFillColor(59, 130, 246);
            pdf.roundedRect(margin, yPosition, 4, 14, 3, 3, 'F');

            pdf.setFillColor(59, 130, 246);
            pdf.setGState(new pdf.GState({ opacity: 0.2 }));
            pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 3, 3, 3, 'F');
            pdf.setGState(new pdf.GState({ opacity: 1 }));

            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(30, 58, 138);
            pdf.text('STATUS DISTRIBUTION BREAKDOWN', margin + 12, yPosition + 9);
            yPosition += 18;

            // Modern table header with gradient
            pdf.setFillColor(15, 23, 42);
            pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 12, 3, 3, 'F');

            pdf.setFillColor(59, 130, 246);
            pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 2, 3, 3, 'F');

            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            pdf.text('STATUS', margin + 8, yPosition + 8);
            pdf.text('COUNT', pageWidth / 2, yPosition + 8);
            pdf.text('PERCENTAGE', pageWidth - margin - 35, yPosition + 8);
            yPosition += 14;

            // Table rows with enhanced styling
            pdf.setFontSize(10);
            const statusEntries = Object.entries(analytics.statusCounts || {});
            const totalStatusCount = statusEntries.reduce((sum, [, count]) => sum + count, 0);
            let rowIndex = 0;

            const statusColors = {
                'accepted': [16, 185, 129],
                'pending': [245, 158, 11],
                'rejected': [239, 68, 68],
                'completed': [34, 197, 94]
            };

            statusEntries.forEach(([status, count]) => {
                checkPageBreak(10);

                const statusColor = statusColors[status.toLowerCase()] || [100, 116, 139];

                // Modern alternating row design
                if (rowIndex % 2 === 0) {
                    pdf.setFillColor(248, 250, 252);
                } else {
                    pdf.setFillColor(255, 255, 255);
                }
                pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 9, 2, 2, 'F');

                // Status indicator dot
                pdf.setFillColor(...statusColor);
                pdf.circle(margin + 5, yPosition + 4.5, 2, 'F');

                // Status text
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(51, 65, 85);
                pdf.text(status.charAt(0).toUpperCase() + status.slice(1), margin + 10, yPosition + 6);

                // Count with background
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(...statusColor);
                pdf.text(String(count), pageWidth / 2, yPosition + 6);

                // Percentage with mini progress bar
                const percentage = ((count / totalStatusCount) * 100).toFixed(1);

                // Progress bar background
                const barWidth = 25;
                const barX = pageWidth - margin - 60;
                pdf.setFillColor(226, 232, 240);
                pdf.roundedRect(barX, yPosition + 2, barWidth, 5, 1, 1, 'F');

                // Progress bar fill
                pdf.setFillColor(...statusColor);
                const fillWidth = (barWidth * parseFloat(percentage)) / 100;
                pdf.roundedRect(barX, yPosition + 2, fillWidth, 5, 1, 1, 'F');

                // Percentage text
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(51, 65, 85);
                pdf.text(`${percentage}%`, pageWidth - margin - 30, yPosition + 6);

                yPosition += 10;
                rowIndex++;
            });

            yPosition += 12;

            // ==================== CATEGORY ANALYTICS TABLE ====================
            if (Object.keys(analytics.categoryData || {}).length > 0) {
                checkPageBreak(50);

                pdf.setFillColor(240, 249, 255);
                pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, 'F');
                pdf.setFontSize(14);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(30, 64, 175);
                pdf.text('Category Analytics', margin + 5, yPosition + 7);
                yPosition += 15;

                // Table header
                pdf.setFillColor(168, 85, 247);
                pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, 'F');
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(255, 255, 255);
                pdf.text('Category', margin + 5, yPosition + 7);
                pdf.text('Users', margin + 55, yPosition + 7);
                pdf.text('Requests', margin + 80, yPosition + 7);
                pdf.text('Avg/User', margin + 110, yPosition + 7);
                yPosition += 12;

                // Table rows
                pdf.setFontSize(9);
                rowIndex = 0;

                Object.entries(analytics.categoryData).forEach(([cat, data]) => {
                    checkPageBreak(8);

                    // Alternating row colors
                    if (rowIndex % 2 === 0) {
                        pdf.setFillColor(248, 250, 252);
                        pdf.roundedRect(margin, yPosition - 1, pageWidth - 2 * margin, 8, 1, 1, 'F');
                    }

                    pdf.setFont('helvetica', 'bold');
                    pdf.setTextColor(51, 65, 85);
                    pdf.text(cat, margin + 5, yPosition + 5);

                    pdf.setFont('helvetica', 'normal');
                    pdf.text(String(data.users), margin + 55, yPosition + 5);
                    pdf.text(String(data.totalRequests), margin + 80, yPosition + 5);
                    pdf.text(String(data.averageRequestsPerUser), margin + 110, yPosition + 5);

                    yPosition += 8;
                    rowIndex++;
                });

                yPosition += 12;
            }

            // ==================== DEPARTMENT ANALYTICS TABLE ====================
            if (Object.keys(analytics.departmentData || {}).length > 0) {
                checkPageBreak(50);

                pdf.setFillColor(240, 249, 255);
                pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, 'F');
                pdf.setFontSize(14);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(30, 64, 175);
                pdf.text('Department Analytics', margin + 5, yPosition + 7);
                yPosition += 15;

                // Table header
                pdf.setFillColor(16, 185, 129);
                pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, 'F');
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(255, 255, 255);
                pdf.text('Department', margin + 5, yPosition + 7);
                pdf.text('Users', margin + 55, yPosition + 7);
                pdf.text('Requests', margin + 80, yPosition + 7);
                pdf.text('Avg/User', margin + 110, yPosition + 7);
                yPosition += 12;

                // Table rows
                pdf.setFontSize(8);
                rowIndex = 0;

                Object.entries(analytics.departmentData).forEach(([dep, data]) => {
                    checkPageBreak(8);

                    // Alternating row colors
                    if (rowIndex % 2 === 0) {
                        pdf.setFillColor(248, 250, 252);
                        pdf.roundedRect(margin, yPosition - 1, pageWidth - 2 * margin, 8, 1, 1, 'F');
                    }

                    pdf.setFont('helvetica', 'bold');
                    pdf.setTextColor(51, 65, 85);
                    const deptText = dep.length > 30 ? dep.substring(0, 30) + '...' : dep;
                    pdf.text(deptText, margin + 5, yPosition + 5);

                    pdf.setFont('helvetica', 'normal');
                    pdf.text(String(data.users), margin + 55, yPosition + 5);
                    pdf.text(String(data.totalRequests), margin + 80, yPosition + 5);
                    pdf.text(String(data.averageRequestsPerUser), margin + 110, yPosition + 5);

                    yPosition += 8;
                    rowIndex++;
                });

                yPosition += 12;
            }

            // ==================== TOP PUBLISHERS ====================
            if (analytics.topPublishers?.length > 0) {
                checkPageBreak(50);

                pdf.setFillColor(240, 249, 255);
                pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, 'F');
                pdf.setFontSize(14);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(30, 64, 175);
                pdf.text('Top Publishers (Top 10)', margin + 5, yPosition + 7);
                yPosition += 15;

                // Table header
                pdf.setFillColor(59, 130, 246);
                pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, 'F');
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(255, 255, 255);
                pdf.text('Rank', margin + 5, yPosition + 7);
                pdf.text('Publisher Name', margin + 20, yPosition + 7);
                pdf.text('Requests', pageWidth - margin - 25, yPosition + 7);
                yPosition += 12;

                pdf.setFontSize(9);
                rowIndex = 0;

                analytics.topPublishers.slice(0, 10).forEach((p, idx) => {
                    checkPageBreak(8);

                    if (rowIndex % 2 === 0) {
                        pdf.setFillColor(248, 250, 252);
                        pdf.roundedRect(margin, yPosition - 1, pageWidth - 2 * margin, 8, 1, 1, 'F');
                    }

                    // Medal icons for top 3
                    pdf.setFont('helvetica', 'bold');
                    if (idx === 0) {
                        pdf.setTextColor(255, 215, 0); // Gold
                    } else if (idx === 1) {
                        pdf.setTextColor(192, 192, 192); // Silver
                    } else if (idx === 2) {
                        pdf.setTextColor(205, 127, 50); // Bronze
                    } else {
                        pdf.setTextColor(51, 65, 85);
                    }
                    pdf.text(`${idx + 1}`, margin + 8, yPosition + 5);

                    pdf.setFont('helvetica', 'normal');
                    pdf.setTextColor(51, 65, 85);
                    const publisherText = p.publisher.length > 50 ? p.publisher.substring(0, 50) + '...' : p.publisher;
                    pdf.text(publisherText, margin + 20, yPosition + 5);

                    pdf.setFont('helvetica', 'bold');
                    pdf.setTextColor(30, 64, 175);
                    pdf.text(String(p.count), pageWidth - margin - 25, yPosition + 5);

                    yPosition += 8;
                    rowIndex++;
                });

                yPosition += 12;
            }

            // ==================== TOP AUTHORS ====================
            if (analytics.topAuthors?.length > 0) {
                checkPageBreak(50);

                pdf.setFillColor(240, 249, 255);
                pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, 'F');
                pdf.setFontSize(14);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(30, 64, 175);
                pdf.text('Top Authors (Top 10)', margin + 5, yPosition + 7);
                yPosition += 15;

                // Table header
                pdf.setFillColor(139, 92, 246);
                pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, 'F');
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(255, 255, 255);
                pdf.text('Rank', margin + 5, yPosition + 7);
                pdf.text('Author Name', margin + 20, yPosition + 7);
                pdf.text('Requests', pageWidth - margin - 25, yPosition + 7);
                yPosition += 12;

                pdf.setFontSize(9);
                rowIndex = 0;

                analytics.topAuthors.slice(0, 10).forEach((a, idx) => {
                    checkPageBreak(8);

                    if (rowIndex % 2 === 0) {
                        pdf.setFillColor(248, 250, 252);
                        pdf.roundedRect(margin, yPosition - 1, pageWidth - 2 * margin, 8, 1, 1, 'F');
                    }

                    // Medal icons for top 3
                    pdf.setFont('helvetica', 'bold');
                    if (idx === 0) {
                        pdf.setTextColor(255, 215, 0); // Gold
                    } else if (idx === 1) {
                        pdf.setTextColor(192, 192, 192); // Silver
                    } else if (idx === 2) {
                        pdf.setTextColor(205, 127, 50); // Bronze
                    } else {
                        pdf.setTextColor(51, 65, 85);
                    }
                    pdf.text(`${idx + 1}`, margin + 8, yPosition + 5);

                    pdf.setFont('helvetica', 'normal');
                    pdf.setTextColor(51, 65, 85);
                    const authorText = a.author.length > 50 ? a.author.substring(0, 50) + '...' : a.author;
                    pdf.text(authorText, margin + 20, yPosition + 5);

                    pdf.setFont('helvetica', 'bold');
                    pdf.setTextColor(30, 64, 175);
                    pdf.text(String(a.count), pageWidth - margin - 25, yPosition + 5);

                    yPosition += 8;
                    rowIndex++;
                });

                yPosition += 12;
            }

            // ==================== RECOMMENDATIONS & INSIGHTS ====================
            checkPageBreak(80);

            pdf.addPage();
            yPosition = margin;

            // Modern gradient header for recommendations
            pdf.setFillColor(15, 23, 42);
            pdf.rect(0, 0, pageWidth, 40, 'F');

            // Rainbow accent stripes
            const recColors = [
                [59, 130, 246], [168, 85, 247], [236, 72, 153],
                [251, 191, 36], [16, 185, 129], [14, 165, 233]
            ];
            const stripeWidth = pageWidth / recColors.length;
            recColors.forEach((color, idx) => {
                pdf.setFillColor(...color);
                pdf.rect(idx * stripeWidth, 40, stripeWidth, 2.5, 'F');
            });

            // Decorative corner elements
            pdf.setFillColor(255, 255, 255);
            pdf.setGState(new pdf.GState({ opacity: 0.06 }));
            pdf.circle(pageWidth * 0.12, 20, 25, 'F');
            pdf.circle(pageWidth * 0.88, 20, 28, 'F');
            pdf.setGState(new pdf.GState({ opacity: 1 }));

            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(26);
            pdf.setFont('helvetica', 'bold');
            pdf.text('RECOMMENDATIONS & INSIGHTS', pageWidth / 2, 26, { align: 'center' });

            yPosition = 55;

            // Generate smart recommendations based on data
            const recommendations = [];

            // Success Rate Analysis
            if (analytics.successMetrics?.successRate < 60) {
                recommendations.push({
                    type: 'warning',
                    title: 'Improve Success Rate',
                    description: `Current success rate of ${analytics.successMetrics?.successRate}% is below optimal. Consider reviewing rejection reasons and improving request quality guidelines.`
                });
            } else if (analytics.successMetrics?.successRate >= 80) {
                recommendations.push({
                    type: 'success',
                    title: 'Excellent Success Rate',
                    description: `Success rate of ${analytics.successMetrics?.successRate}% demonstrates effective request processing. Maintain current quality standards.`
                });
            }

            // Response Time Analysis
            if (analytics.timeMetrics?.averageResponseTimeDays > 7) {
                recommendations.push({
                    type: 'warning',
                    title: 'Reduce Response Time',
                    description: `Average response time of ${analytics.timeMetrics?.averageResponseTimeDays} days exceeds target. Consider optimizing processing workflow and increasing staff allocation during peak times.`
                });
            } else if (analytics.timeMetrics?.averageResponseTimeDays <= 3) {
                recommendations.push({
                    type: 'success',
                    title: 'Excellent Response Time',
                    description: `Average response time of ${analytics.timeMetrics?.averageResponseTimeDays} days is excellent. Current workflow efficiency should be documented as best practice.`
                });
            }

            // User Engagement
            const engagementRate = (analytics.activeUsers / analytics.totalUsers * 100).toFixed(1);
            if (engagementRate < 50) {
                recommendations.push({
                    type: 'info',
                    title: 'Increase User Engagement',
                    description: `Only ${engagementRate}% of users are active. Consider awareness campaigns, training sessions, or simplified request processes to boost engagement.`
                });
            }

            // Peak Activity
            if (analytics.peakActivity?.hourlyDistribution) {
                const peakHours = [...analytics.peakActivity.hourlyDistribution].sort((a, b) => b.count - a.count).slice(0, 3);
                const peakHoursList = peakHours.map(h => `${h.hour}:00`).join(', ');
                recommendations.push({
                    type: 'info',
                    title: 'Optimize Staff Allocation',
                    description: `Peak activity hours are ${peakHoursList}. Ensure adequate staff coverage during these periods to maintain quick response times.`
                });
            }

            // General recommendation
            recommendations.push({
                type: 'info',
                title: 'Continue Monitoring',
                description: 'Regular monitoring of these metrics helps identify trends early. Schedule monthly reviews to track improvements and address emerging issues promptly.'
            });

            // Render recommendations with modern card design
            recommendations.forEach((rec, index) => {
                checkPageBreak(40);

                // Determine colors and icons based on type
                let accentColor, bgColor, iconSymbol;
                if (rec.type === 'success') {
                    accentColor = [16, 185, 129]; // Emerald
                    bgColor = [209, 250, 229]; // Light emerald
                    iconSymbol = '✓';
                } else if (rec.type === 'warning') {
                    accentColor = [245, 158, 11]; // Amber
                    bgColor = [254, 243, 199]; // Light amber
                    iconSymbol = '⚠';
                } else {
                    accentColor = [59, 130, 246]; // Blue
                    bgColor = [219, 234, 254]; // Light blue
                    iconSymbol = '💡';
                }

                // Outer card shadow effect
                pdf.setFillColor(226, 232, 240);
                pdf.setGState(new pdf.GState({ opacity: 0.3 }));
                pdf.roundedRect(margin + 1, yPosition + 1, pageWidth - 2 * margin, 35, 4, 4, 'F');
                pdf.setGState(new pdf.GState({ opacity: 1 }));

                // Main card background
                pdf.setFillColor(255, 255, 255);
                pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 35, 4, 4, 'F');

                // Colored border
                pdf.setDrawColor(...accentColor);
                pdf.setLineWidth(1.5);
                pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 35, 4, 4, 'S');

                // Top colored accent strip
                pdf.setFillColor(...accentColor);
                pdf.setGState(new pdf.GState({ opacity: 0.15 }));
                pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 8, 4, 4, 'F');
                pdf.setGState(new pdf.GState({ opacity: 1 }));

                // Colored accent bar on left
                pdf.setFillColor(...accentColor);
                pdf.roundedRect(margin, yPosition, 5, 35, 4, 4, 'F');

                // Number badge with enhanced styling
                pdf.setFillColor(...bgColor);
                pdf.circle(margin + 16, yPosition + 12, 7, 'F');

                pdf.setFillColor(...accentColor);
                pdf.circle(margin + 16, yPosition + 12, 6, 'F');

                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'bold');
                pdf.text(String(index + 1), margin + 16, yPosition + 14.5, { align: 'center' });

                // Priority badge
                pdf.setFillColor(...accentColor);
                pdf.setGState(new pdf.GState({ opacity: 0.2 }));
                pdf.roundedRect(margin + 28, yPosition + 5, 20, 8, 2, 2, 'F');
                pdf.setGState(new pdf.GState({ opacity: 1 }));

                pdf.setTextColor(...accentColor);
                pdf.setFontSize(8);
                pdf.setFont('helvetica', 'bold');
                const priorityText = rec.type === 'warning' ? 'ACTION' : rec.type === 'success' ? 'GOOD' : 'INFO';
                pdf.text(priorityText, margin + 38, yPosition + 11, { align: 'center' });

                // Title with icon
                pdf.setTextColor(30, 41, 59);
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.text(`${iconSymbol} ${rec.title}`, margin + 53, yPosition + 10);

                // Description box
                pdf.setFillColor(248, 250, 252);
                pdf.roundedRect(margin + 10, yPosition + 16, pageWidth - 2 * margin - 20, 16, 2, 2, 'F');

                pdf.setTextColor(51, 65, 85);
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'normal');
                const descLines = pdf.splitTextToSize(rec.description, pageWidth - 2 * margin - 30);
                pdf.text(descLines, margin + 14, yPosition + 21);

                yPosition += 38;
            });

            // Additional Statistics Section
            yPosition += 5;
            checkPageBreak(40);

            pdf.setFillColor(240, 249, 255);
            pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, 'F');
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(30, 64, 175);
            pdf.text('Additional Statistics', margin + 5, yPosition + 7);
            yPosition += 15;

            const additionalStats = [
                { label: 'Total Active Users', value: `${analytics.activeUsers} out of ${analytics.totalUsers}`, percent: `${engagementRate}%` },
                { label: 'Request Processing', value: `${analytics.totalRequests} total`, percent: `${analytics.averageRequestsPerUser} per user` },
                { label: 'Completion Rate', value: `${analytics.timeMetrics?.completedRequestsCount} completed`, percent: `${((analytics.timeMetrics?.completedRequestsCount / analytics.totalRequests) * 100).toFixed(1)}%` }
            ];

            pdf.setFontSize(10);
            additionalStats.forEach((stat) => {
                checkPageBreak(10);

                pdf.setFillColor(245, 247, 250);
                pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 9, 1, 1, 'F');

                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(30, 64, 175);
                pdf.text(stat.label, margin + 5, yPosition + 6);

                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(51, 65, 85);
                pdf.text(stat.value, margin + 60, yPosition + 6);

                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(16, 185, 129);
                pdf.text(stat.percent, pageWidth - margin - 30, yPosition + 6);

                yPosition += 11;
            });

            // Report Summary Footer
            yPosition += 10;
            checkPageBreak(30);

            pdf.setFillColor(240, 249, 255);
            pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 25, 3, 3, 'F');

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(30, 64, 175);
            pdf.text('Report Summary', margin + 5, yPosition + 8);

            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(51, 65, 85);
            const summaryText = `This report provides a comprehensive analysis of the IIT Jodhpur Library Management System for the ${startDate || endDate ? `period from ${startDate ? startDate.toLocaleDateString() : 'beginning'} to ${endDate ? endDate.toLocaleDateString() : 'present'}` : 'entire recorded period'}. Data includes ${analytics.totalUsers} users, ${analytics.totalRequests} requests, and detailed performance metrics across all categories and departments.`;
            const splitSummary = pdf.splitTextToSize(summaryText, pageWidth - 2 * margin - 10);
            pdf.text(splitSummary, margin + 5, yPosition + 15);

            // Add elegant footer to all pages
            const pageCount = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                pdf.setPage(i);

                // Skip footer on cover page (page 1)
                if (i === 1) continue;

                // Footer background with gradient
                pdf.setFillColor(248, 250, 252);
                pdf.setGState(new pdf.GState({ opacity: 0.5 }));
                pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
                pdf.setGState(new pdf.GState({ opacity: 1 }));

                // Decorative top line
                pdf.setDrawColor(59, 130, 246);
                pdf.setLineWidth(0.5);
                pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);

                // Left side - Document title
                pdf.setFontSize(8);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(71, 85, 105);
                pdf.text('IIT Jodhpur Central Library', margin, pageHeight - 12);

                pdf.setFontSize(7);
                pdf.setTextColor(100, 116, 139);
                pdf.text('Analytics Report', margin, pageHeight - 7);

                // Center - Page number with styling
                pdf.setFillColor(59, 130, 246);
                pdf.setGState(new pdf.GState({ opacity: 0.1 }));
                pdf.circle(pageWidth / 2, pageHeight - 10, 8, 'F');
                pdf.setGState(new pdf.GState({ opacity: 1 }));

                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(59, 130, 246);
                pdf.text(`${i}`, pageWidth / 2, pageHeight - 8, { align: 'center' });

                pdf.setFontSize(7);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(100, 116, 139);
                pdf.text(`of ${pageCount}`, pageWidth / 2, pageHeight - 4, { align: 'center' });

                // Right side - Date generated
                pdf.setFontSize(7);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(100, 116, 139);
                const genDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                pdf.text(`Generated: ${genDate}`, pageWidth - margin, pageHeight - 10, { align: 'right' });

                pdf.setFontSize(6);
                pdf.setTextColor(148, 163, 184);
                pdf.text('Confidential', pageWidth - margin, pageHeight - 5, { align: 'right' });
            }

            // Save the PDF
            const fileName = `IIT_Jodhpur_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);

            setStatusMessage('Report generated successfully!');
            setTimeout(() => setStatusMessage(''), 3000);
        } catch (error) {
            console.error('Error generating report:', error);
            setStatusMessage('Failed to generate report. Please try again.');
            setTimeout(() => setStatusMessage(''), 3000);
        } finally {
            setIsGeneratingReport(false);
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100" ref={reportRef}>
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
                    {/* Page Header with Generate Report Button */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2 text-sm text-slate-600">
                                <Building2 className="w-4 h-4" />
                                <span>Admin Dashboard</span>
                                <span>/</span>
                                <span className="text-blue-700 font-medium">Analytics & Insights</span>
                            </div>
                            {isAdmin && (
                                <button
                                    onClick={generateReport}
                                    disabled={isGeneratingReport}
                                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all shadow-md ${isGeneratingReport
                                            ? 'bg-slate-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                                        }`}
                                >
                                    {isGeneratingReport ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Generating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-5 h-5" />
                                            <span>Generate Report</span>
                                        </>
                                    )}
                                </button>
                            )}
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
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" data-chart data-chart-title="Requests by Status">
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
                                        <Bar dataKey="count" fill="#A855F7" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </SafeChart>
                        </div>

                        {/* Status Distribution Pie Chart */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" data-chart data-chart-title="Status Distribution">
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
                                            isAnimationActive={false}
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
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" data-chart data-chart-title="Monthly Trends">
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
                                        <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} isAnimationActive={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </SafeChart>
                        </div>

                        {/* Peak Activity Hours */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" data-chart data-chart-title="Peak Activity Hours">
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
                                        <Bar dataKey="count" fill="#F59E0B" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </SafeChart>
                        </div>

                        {isAdmin && Object.keys(analytics.categoryData || {}).length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" data-chart data-chart-title="Requests by Category">
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
                                            <Bar dataKey="count" fill="#FB923C" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </SafeChart>
                            </div>
                        )}

                        {isAdmin && Object.keys(analytics.departmentData || {}).length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" data-chart data-chart-title="Requests by Department">
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
                                            <Bar dataKey="count" fill="#22C55E" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </SafeChart>
                            </div>
                        )}

                        {/* Publication Year Distribution */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" data-chart data-chart-title="Publication Year Distribution">
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
                                        <Bar dataKey="count" fill="#EC4899" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </SafeChart>
                        </div>

                        {/* Daily Activity Distribution */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2" data-chart data-chart-title="Activity by Day of Week">
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
                                        <Bar dataKey="count" fill="#06B6D4" radius={[8, 8, 0, 0]} isAnimationActive={false} />
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
                                <div data-chart data-chart-title="Rejection Reasons">
                                    <SafeChart data={analytics.rejectionAnalysis.rejectionReasons}>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={analytics.rejectionAnalysis.rejectionReasons || []}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="reason" stroke="#64748b" />
                                                <YAxis stroke="#64748b" />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                                />
                                                <Bar dataKey="count" fill="#EF4444" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </SafeChart>
                                </div>
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
                                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.successRate >= 70
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
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${request.status === 'accepted'
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

export default AnalyticsPage;