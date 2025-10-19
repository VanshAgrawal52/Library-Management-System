const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');

// GET user analytics
const analytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const currentUser = await User.findById(userId).select('role department email requests').lean();
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const getCategory = (email) => {
      const firstLetter = email.charAt(0).toLowerCase();
      if (firstLetter === 'b') return 'B-Tech';
      if (firstLetter === 'm') return 'M-Tech';
      if (firstLetter === 'p') return 'PhD';
      return 'Others';
    };

    // Helper function to filter requests by date range
    const filterByDateRange = (requests) => {
      let filtered = requests;
      if (startDate) {
        const start = new Date(startDate);
        filtered = filtered.filter(r => new Date(r.createdAt) >= start);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filtered = filtered.filter(r => new Date(r.createdAt) <= end);
      }
      return filtered;
    };

    // Calculate time-based metrics
    const calculateTimeMetrics = (requests) => {
      if (requests.length === 0) return null;

      const timestamps = requests.map(r => new Date(r.createdAt).getTime());
      const sorted = timestamps.sort((a, b) => a - b);
      
      // Response time analysis (for completed requests)
      const completedRequests = requests.filter(r => 
        ['arrived', 'accepted', 'rejected'].includes(r.status)
      );
      
      const responseTimes = completedRequests.map(r => {
        const created = new Date(r.createdAt).getTime();
        const now = Date.now();
        return (now - created) / (1000 * 60 * 60 * 24); // days
      });

      const avgResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0;

      return {
        firstRequestDate: new Date(sorted[0]),
        lastRequestDate: new Date(sorted[sorted.length - 1]),
        averageResponseTimeDays: Math.round(avgResponseTime * 10) / 10,
        completedRequestsCount: completedRequests.length,
        pendingRequestsCount: requests.filter(r => r.status === 'pending').length,
        processingRequestsCount: requests.filter(r => r.status === 'processing').length
      };
    };

    // Calculate trends (requests over time)
    const calculateTrends = (requests) => {
      const monthlyData = {};
      const weeklyData = {};
      
      requests.forEach(r => {
        const date = new Date(r.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const weekKey = getWeekKey(date);
        
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
        weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
      });

      return {
        monthly: Object.entries(monthlyData).map(([month, count]) => ({ month, count })),
        weekly: Object.entries(weeklyData).map(([week, count]) => ({ week, count }))
      };
    };

    const getWeekKey = (date) => {
      const year = date.getFullYear();
      const firstDay = new Date(year, 0, 1);
      const days = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
      const week = Math.ceil((days + firstDay.getDay() + 1) / 7);
      return `${year}-W${String(week).padStart(2, '0')}`;
    };

    // Calculate success rate
    const calculateSuccessRate = (requests) => {
      const total = requests.length;
      if (total === 0) return { successRate: 0, acceptedCount: 0, rejectedCount: 0 };
      
      const accepted = requests.filter(r => r.status === 'accepted').length;
      const rejected = requests.filter(r => r.status === 'rejected').length;
      const completed = accepted + rejected;
      
      return {
        successRate: completed > 0 ? Math.round((accepted / completed) * 100) : 0,
        acceptedCount: accepted,
        rejectedCount: rejected,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    };

    // Top authors analysis
    const analyzeAuthors = (requests) => {
      const authorCounts = {};
      requests.forEach(r => {
        const authors = r.authors.split(',').map(a => a.trim());
        authors.forEach(author => {
          authorCounts[author] = (authorCounts[author] || 0) + 1;
        });
      });
      return Object.entries(authorCounts)
        .map(([author, count]) => ({ author, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    };

    // Publication year distribution
    const analyzePublicationYears = (requests) => {
      const yearCounts = {};
      requests.forEach(r => {
        yearCounts[r.publicationYear] = (yearCounts[r.publicationYear] || 0) + 1;
      });
      return Object.entries(yearCounts)
        .map(([year, count]) => ({ year: parseInt(year), count }))
        .sort((a, b) => b.year - a.year);
    };

    // Rejection analysis
    const analyzeRejections = (requests) => {
      const rejected = requests.filter(r => r.status === 'rejected' && r.rejectReason);
      const reasonCounts = {};
      rejected.forEach(r => {
        reasonCounts[r.rejectReason] = (reasonCounts[r.rejectReason] || 0) + 1;
      });
      return {
        totalRejected: rejected.length,
        rejectionReasons: Object.entries(reasonCounts)
          .map(([reason, count]) => ({ reason, count }))
          .sort((a, b) => b.count - a.count)
      };
    };

    // Peak activity analysis
    const analyzePeakActivity = (requests) => {
      const hourCounts = new Array(24).fill(0);
      const dayOfWeekCounts = new Array(7).fill(0);
      
      requests.forEach(r => {
        const date = new Date(r.createdAt);
        hourCounts[date.getHours()]++;
        dayOfWeekCounts[date.getDay()]++;
      });

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      return {
        peakHour: hourCounts.indexOf(Math.max(...hourCounts)),
        peakDay: dayNames[dayOfWeekCounts.indexOf(Math.max(...dayOfWeekCounts))],
        hourlyDistribution: hourCounts.map((count, hour) => ({ hour, count })),
        dailyDistribution: dayOfWeekCounts.map((count, day) => ({ day: dayNames[day], count }))
      };
    };

    if (currentUser.role === 'admin') {
      const allUsers = await User.find().select('email department requests createdAt').lean();

      let allRequests = [];
      const categoryData = {};
      const departmentData = {};
      const publisherCounts = {};
      const statusCounts = {};
      const usersAnalytics = [];
      const categoryDocCounts = {};
      const departmentDocCounts = {};

      allUsers.forEach((u) => {
        const cat = getCategory(u.email);
        categoryData[cat] = categoryData[cat] || { users: 0, totalRequests: 0 };
        categoryData[cat].users += 1;

        const dep = u.department || 'Unknown';
        departmentData[dep] = departmentData[dep] || { users: 0, totalRequests: 0 };
        departmentData[dep].users += 1;

        let reqs = filterByDateRange(u.requests || []);

        const totalRequests = reqs.length;
        categoryData[cat].totalRequests += totalRequests;
        departmentData[dep].totalRequests += totalRequests;

        const docCounts = {};
        reqs.forEach((r) => {
          const title = r.documentTitle;
          docCounts[title] = (docCounts[title] || 0) + 1;
        });
        
        let maxCount = 0;
        const mostRequested = [];
        for (const [title, count] of Object.entries(docCounts)) {
          if (count > maxCount) {
            mostRequested.length = 0;
            mostRequested.push({ documentTitle: title, count });
            maxCount = count;
          } else if (count === maxCount) {
            mostRequested.push({ documentTitle: title, count });
          }
        }

        const userSuccessRate = calculateSuccessRate(reqs);
        usersAnalytics.push({
          userEmail: u.email,
          totalRequests,
          mostRequested,
          ...userSuccessRate
        });

        if (!categoryDocCounts[cat]) categoryDocCounts[cat] = {};
        if (!departmentDocCounts[dep]) departmentDocCounts[dep] = {};
        
        reqs.forEach((r) => {
          const title = r.documentTitle;
          categoryDocCounts[cat][title] = (categoryDocCounts[cat][title] || 0) + 1;
          departmentDocCounts[dep][title] = (departmentDocCounts[dep][title] || 0) + 1;

          publisherCounts[r.publisher] = (publisherCounts[r.publisher] || 0) + 1;
          statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
          allRequests.push({ ...r, userEmail: u.email, category: cat, department: dep });
        });
      });

      // Compute most requested for categories
      for (const cat in categoryData) {
        const docCounts = categoryDocCounts[cat] || {};
        let maxCount = 0;
        const mostRequested = [];
        for (const [title, count] of Object.entries(docCounts)) {
          if (count > maxCount) {
            mostRequested.length = 0;
            mostRequested.push({ documentTitle: title, count });
            maxCount = count;
          } else if (count === maxCount) {
            mostRequested.push({ documentTitle: title, count });
          }
        }
        categoryData[cat].mostRequested = mostRequested;
        categoryData[cat].averageRequestsPerUser = categoryData[cat].users > 0 
          ? Math.round((categoryData[cat].totalRequests / categoryData[cat].users) * 10) / 10 
          : 0;
      }

      // Compute most requested for departments
      for (const dep in departmentData) {
        const docCounts = departmentDocCounts[dep] || {};
        let maxCount = 0;
        const mostRequested = [];
        for (const [title, count] of Object.entries(docCounts)) {
          if (count > maxCount) {
            mostRequested.length = 0;
            mostRequested.push({ documentTitle: title, count });
            maxCount = count;
          } else if (count === maxCount) {
            mostRequested.push({ documentTitle: title, count });
          }
        }
        departmentData[dep].mostRequested = mostRequested;
        departmentData[dep].averageRequestsPerUser = departmentData[dep].users > 0 
          ? Math.round((departmentData[dep].totalRequests / departmentData[dep].users) * 10) / 10 
          : 0;
      }

      allRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const recentRequests = allRequests.slice(0, 50);

      const totalRequests = allRequests.length;
      const totalUsers = allUsers.length;
      const activeUsers = allUsers.filter(u => (u.requests || []).length > 0).length;

      // Top publishers
      const topPublishers = Object.entries(publisherCounts)
        .map(([publisher, count]) => ({ publisher, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const adminAnalytics = {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        totalRequests,
        averageRequestsPerUser: totalUsers > 0 ? Math.round((totalRequests / totalUsers) * 10) / 10 : 0,
        categoryData,
        departmentData,
        publisherCounts,
        topPublishers,
        statusCounts,
        successMetrics: calculateSuccessRate(allRequests),
        timeMetrics: calculateTimeMetrics(allRequests),
        trends: calculateTrends(allRequests),
        topAuthors: analyzeAuthors(allRequests),
        publicationYearDistribution: analyzePublicationYears(allRequests),
        rejectionAnalysis: analyzeRejections(allRequests),
        peakActivity: analyzePeakActivity(allRequests),
        requests: recentRequests,
        usersAnalytics: usersAnalytics.sort((a, b) => b.totalRequests - a.totalRequests)
      };

      return res.json(adminAnalytics);
    } else {
      // Regular user analytics
      let requests = filterByDateRange(currentUser.requests || []);

      const totalRequests = requests.length;
      const department = currentUser.department;
      const category = getCategory(currentUser.email);

      const docCounts = {};
      requests.forEach((r) => {
        const title = r.documentTitle;
        docCounts[title] = (docCounts[title] || 0) + 1;
      });
      
      let maxCount = 0;
      const mostRequested = [];
      for (const [title, count] of Object.entries(docCounts)) {
        if (count > maxCount) {
          mostRequested.length = 0;
          mostRequested.push({ documentTitle: title, count });
          maxCount = count;
        } else if (count === maxCount) {
          mostRequested.push({ documentTitle: title, count });
        }
      }

      const publisherCounts = requests.reduce((acc, request) => {
        acc[request.publisher] = (acc[request.publisher] || 0) + 1;
        return acc;
      }, {});

      const statusCounts = requests.reduce((acc, request) => {
        acc[request.status] = (acc[request.status] || 0) + 1;
        return acc;
      }, {});

      const topPublishers = Object.entries(publisherCounts)
        .map(([publisher, count]) => ({ publisher, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const userAnalytics = {
        totalRequests,
        department,
        category,
        publisherCounts,
        topPublishers,
        statusCounts,
        successMetrics: calculateSuccessRate(requests),
        timeMetrics: calculateTimeMetrics(requests),
        trends: calculateTrends(requests),
        topAuthors: analyzeAuthors(requests),
        publicationYearDistribution: analyzePublicationYears(requests),
        rejectionAnalysis: analyzeRejections(requests),
        peakActivity: analyzePeakActivity(requests),
        requests,
        mostRequested
      };

      return res.json(userAnalytics);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { analytics };