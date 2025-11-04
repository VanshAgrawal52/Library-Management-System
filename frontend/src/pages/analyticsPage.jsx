"use client"

import { useState, useEffect, useRef } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  Search,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  Calendar,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Building2,
  Download,
} from "lucide-react"
import DatePicker from "react-datepicker"
import { Link, useNavigate } from "react-router-dom"
import "react-datepicker/dist/react-datepicker.css"
import { fetchWithAuth } from "../utils/fetchWithAuth"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

const AnalyticsPage = () => {
  const navigate = useNavigate()
  const reportRef = useRef(null)
  const [analytics, setAnalytics] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  const COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#06B6D4", "#EF4444", "#6366F1"]

  useEffect(() => {
    verifyAndFetch()
  }, [startDate, endDate])

  // Secure admin check + data fetching combined
  const verifyAndFetch = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      // Check if user is admin (securely)
      const checkRes = await fetchWithAuth("http://localhost:5000/api/admin/check-admin", {
        method: "GET",
      })

      if (checkRes.status === 403) {
        navigate("/user")
        return
      } else if (!checkRes.ok) {
        throw new Error(`Error verifying admin: ${checkRes.status}`)
      }

      const checkData = await checkRes.json()
      if (!checkData.isAdmin) {
        navigate("/user")
        return
      }

      // Admin verified → fetch analytics and users
      await Promise.all([fetchAnalytics(), fetchAllUsers()])
    } catch (err) {
      console.error("Error verifying admin or fetching data:", err)
      navigate("/login")
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const baseUrl = "http://localhost:5000/api/analytics"
      const params = new URLSearchParams()

      if (startDate) params.append("startDate", startDate.toISOString())
      if (endDate) params.append("endDate", endDate.toISOString())

      const url = params.toString() ? `${baseUrl}?${params}` : baseUrl

      const response = await fetchWithAuth(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch analytics")

      const data = await response.json()
      setAnalytics(data)
      setError(null)
    } catch (err) {
      console.error("Fetch analytics error:", err)
      setError("Failed to fetch analytics. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetchWithAuth("http://localhost:5000/api/admin/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAllUsers(data)
      }
    } catch (err) {
      console.error("Fetch users error:", err)
    }
  }

  const generateReport = async () => {
    setIsGeneratingReport(true)
    setStatusMessage("Generating report... Please wait.")

    try {
      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 15
      let yPosition = margin

      const PRIMARY_COLOR = [30, 58, 138] // Deep professional blue
      const SECONDARY_COLOR = [100, 116, 139] // Neutral gray
      const ACCENT_COLOR = [15, 23, 42] // Dark navy
      const LIGHT_BG = [248, 250, 252] // Light neutral

      // Helper function to add new page if needed
      const checkPageBreak = (requiredSpace) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage()
          yPosition = margin
          return true
        }
        return false
      }

      // ==================== CLEAN COVER PAGE ====================
      // Top section - Dark navy
      pdf.setFillColor(...ACCENT_COLOR)
      pdf.rect(0, 0, pageWidth, pageHeight * 0.4, "F")

      // Subtle accent line
      pdf.setFillColor(...PRIMARY_COLOR)
      pdf.rect(0, pageHeight * 0.4, pageWidth, 2, "F")

      // Bottom section - Light professional
      pdf.setFillColor(255, 255, 255)
      pdf.rect(0, pageHeight * 0.4 + 2, pageWidth, pageHeight * 0.6 - 2, "F")

      // Main Institution Name - Clean and Bold
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(42)
      pdf.setFont("helvetica", "bold")
      pdf.text("IIT JODHPUR", pageWidth / 2, 50, { align: "center" })

      pdf.setFontSize(16)
      pdf.setFont("helvetica", "normal")
      pdf.text("Central Library Management System", pageWidth / 2, 60, { align: "center" })

      // Report Title - Prominent
      pdf.setTextColor(...PRIMARY_COLOR)
      pdf.setFontSize(36)
      pdf.setFont("helvetica", "bold")
      pdf.text("ANALYTICS REPORT", pageWidth / 2, pageHeight * 0.45 + 20, { align: "center" })

      // Horizontal line separator
      pdf.setDrawColor(...PRIMARY_COLOR)
      pdf.setLineWidth(0.5)
      pdf.line(margin + 20, pageHeight * 0.45 + 30, pageWidth - margin - 20, pageHeight * 0.45 + 30)

      // Key Info Cards - Simple and Clean
      const infoY = pageHeight * 0.45 + 45
      const cardWidth = (pageWidth - 2 * margin - 10) / 2

      // Report Generated Card
      pdf.setFillColor(...LIGHT_BG)
      pdf.roundedRect(margin, infoY, cardWidth, 30, 2, 2, "F")

      pdf.setTextColor(...PRIMARY_COLOR)
      pdf.setFontSize(11)
      pdf.setFont("helvetica", "bold")
      pdf.text("REPORT GENERATED", margin + 8, infoY + 10)

      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "normal")
      const generatedDate = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
      pdf.text(generatedDate, margin + 8, infoY + 22)

      // Period Card
      pdf.setFillColor(...LIGHT_BG)
      pdf.roundedRect(margin + cardWidth + 10, infoY, cardWidth, 30, 2, 2, "F")

      pdf.setTextColor(...PRIMARY_COLOR)
      pdf.setFontSize(11)
      pdf.setFont("helvetica", "bold")
      pdf.text("REPORTING PERIOD", margin + cardWidth + 18, infoY + 10)

      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(11)
      pdf.setFont("helvetica", "normal")
      const periodText = `${startDate ? startDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "All Time"} - ${endDate ? endDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "Present"}`
      pdf.text(periodText, margin + cardWidth + 18, infoY + 22)

      // Summary Stats Bar - Clean horizontal layout
      const statsY = infoY + 45
      pdf.setFillColor(...PRIMARY_COLOR)
      pdf.roundedRect(margin, statsY, pageWidth - 2 * margin, 25, 2, 2, "F")

      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "bold")

      const statW = (pageWidth - 2 * margin) / 4
      pdf.text(`${analytics.totalUsers}`, margin + statW / 2, statsY + 8, { align: "center" })
      pdf.text(`${analytics.totalRequests}`, margin + statW + statW / 2, statsY + 8, { align: "center" })
      pdf.text(`${analytics.successMetrics?.successRate}%`, margin + 2 * statW + statW / 2, statsY + 8, {
        align: "center",
      })
      pdf.text(`${analytics.timeMetrics?.averageResponseTimeDays}d`, margin + 3 * statW + statW / 2, statsY + 8, {
        align: "center",
      })

      pdf.setFontSize(8)
      pdf.setFont("helvetica", "normal")
      pdf.text("Total Users", margin + statW / 2, statsY + 18, { align: "center" })
      pdf.text("Requests", margin + statW + statW / 2, statsY + 18, { align: "center" })
      pdf.text("Success Rate", margin + 2 * statW + statW / 2, statsY + 18, { align: "center" })
      pdf.text("Avg Response", margin + 3 * statW + statW / 2, statsY + 18, { align: "center" })

      // Footer
      pdf.setFontSize(7)
      pdf.setTextColor(...SECONDARY_COLOR)
      pdf.setFont("helvetica", "normal")
      pdf.text(
        "NH 62, Surpura Bypass Road, Karwar, Jodhpur - 342030 | library@iit.ac.in",
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" },
      )

      // ==================== TABLE OF CONTENTS ====================
      pdf.addPage()
      yPosition = margin

      pdf.setFillColor(...ACCENT_COLOR)
      pdf.rect(0, 0, pageWidth, 30, "F")

      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(24)
      pdf.setFont("helvetica", "bold")
      pdf.text("TABLE OF CONTENTS", pageWidth / 2, 20, { align: "center" })

      yPosition = 50

      const tocItems = [
        { title: "Executive Summary", page: "3" },
        { title: "Key Performance Indicators", page: "3" },
        { title: "Visual Analytics & Charts", page: "4" },
        { title: "Status Distribution Analysis", page: "5" },
        { title: "Category & Department Breakdown", page: "6" },
        { title: "Top Publishers & Authors", page: "7" },
        { title: "Peak Activity Analysis", page: "8" },
        { title: "User Performance Metrics", page: "9" },
        { title: "Recommendations & Insights", page: "10" },
        { title: "Appendix & Additional Data", page: "11" },
      ]

      tocItems.forEach((item, index) => {
        checkPageBreak(12)

        // Simple alternating background
        if (index % 2 === 0) {
          pdf.setFillColor(...LIGHT_BG)
          pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 1, 1, "F")
        }

        // Item number
        pdf.setTextColor(...PRIMARY_COLOR)
        pdf.setFontSize(11)
        pdf.setFont("helvetica", "bold")
        pdf.text(`${index + 1}.`, margin + 5, yPosition + 7)

        // Item title
        pdf.setTextColor(0, 0, 0)
        pdf.setFont("helvetica", "normal")
        pdf.text(item.title, margin + 15, yPosition + 7)

        // Page number
        pdf.setTextColor(...SECONDARY_COLOR)
        pdf.setFont("helvetica", "normal")
        pdf.text(item.page, pageWidth - margin - 10, yPosition + 7)

        yPosition += 12
      })

      // ==================== EXECUTIVE SUMMARY ====================
      pdf.addPage()
      yPosition = margin

      pdf.setFillColor(...ACCENT_COLOR)
      pdf.rect(0, 0, pageWidth, 25, "F")

      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(22)
      pdf.setFont("helvetica", "bold")
      pdf.text("EXECUTIVE SUMMARY", pageWidth / 2, 17, { align: "center" })

      yPosition = 40

      // Summary paragraph
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")
      const summaryText = `This report provides a comprehensive analysis of the IIT Jodhpur Central Library Management System. The analysis covers ${analytics.totalUsers} registered users, ${analytics.totalRequests} document requests, with a ${analytics.successMetrics?.successRate}% success rate. The average response time across the system is ${analytics.timeMetrics?.averageResponseTimeDays} days, demonstrating efficient request processing.`
      const summaryLines = pdf.splitTextToSize(summaryText, pageWidth - 2 * margin)
      pdf.text(summaryLines, margin, yPosition)
      yPosition += summaryLines.length * 6 + 10

      // Key Metrics Section
      pdf.setFillColor(...LIGHT_BG)
      pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 12, 2, 2, "F")

      pdf.setTextColor(...PRIMARY_COLOR)
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.text("KEY METRICS OVERVIEW", margin + 8, yPosition + 8)
      yPosition += 18

      const metrics = [
        {
          label: "Active Users",
          value: `${analytics.activeUsers} / ${analytics.totalUsers}`,
          desc: `${((analytics.activeUsers / analytics.totalUsers) * 100).toFixed(1)}% engagement`,
        },
        {
          label: "Total Requests",
          value: `${analytics.totalRequests}`,
          desc: `${analytics.averageRequestsPerUser} per user (avg)`,
        },
        {
          label: "Success Rate",
          value: `${analytics.successMetrics?.successRate}%`,
          desc: `${analytics.successMetrics?.acceptedCount} accepted`,
        },
        {
          label: "Response Time",
          value: `${analytics.timeMetrics?.averageResponseTimeDays} days`,
          desc: `${analytics.timeMetrics?.completedRequestsCount} completed`,
        },
      ]

      metrics.forEach((metric, idx) => {
        checkPageBreak(18)

        pdf.setFillColor(255, 255, 255)
        pdf.setDrawColor(...PRIMARY_COLOR)
        pdf.setLineWidth(0.5)
        pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 15, 2, 2, "S")

        pdf.setTextColor(...PRIMARY_COLOR)
        pdf.setFontSize(10)
        pdf.setFont("helvetica", "bold")
        pdf.text(metric.label, margin + 8, yPosition + 6)

        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(13)
        pdf.setFont("helvetica", "bold")
        pdf.text(metric.value, margin + 8, yPosition + 12)

        pdf.setTextColor(...SECONDARY_COLOR)
        pdf.setFontSize(8)
        pdf.setFont("helvetica", "normal")
        pdf.text(metric.desc, pageWidth - margin - 40, yPosition + 10)

        yPosition += 18
      })

      // ==================== VISUAL ANALYTICS ====================
      checkPageBreak(80)

      pdf.addPage()
      yPosition = margin

      pdf.setFillColor(...ACCENT_COLOR)
      pdf.rect(0, 0, pageWidth, 25, "F")

      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(22)
      pdf.setFont("helvetica", "bold")
      pdf.text("VISUAL ANALYTICS & CHARTS", pageWidth / 2, 17, { align: "center" })

      yPosition = 40

      setStatusMessage("Rendering charts... Please wait.")
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Capture and add charts
      const chartElements = document.querySelectorAll("[data-chart]")
      setStatusMessage(`Capturing ${chartElements.length} charts...`)

      for (let i = 0; i < chartElements.length; i++) {
        const element = chartElements[i]
        const chartTitle = element.getAttribute("data-chart-title")

        setStatusMessage(`Capturing chart ${i + 1} of ${chartElements.length}...`)

        const hasContent = element.querySelector("svg") || element.querySelector("canvas")
        if (!hasContent) {
          console.log(`Skipping chart "${chartTitle}" - no content`)
          continue
        }

        checkPageBreak(90)

        pdf.setFillColor(255, 255, 255)
        pdf.setDrawColor(...PRIMARY_COLOR)
        pdf.setLineWidth(1)
        pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 12, 2, 2, "S")

        pdf.setTextColor(...PRIMARY_COLOR)
        pdf.setFontSize(11)
        pdf.setFont("helvetica", "bold")
        pdf.text(`${i + 1}. ${chartTitle}`, margin + 8, yPosition + 8)

        yPosition += 15

        try {
          await new Promise((resolve) => setTimeout(resolve, 100))

          const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: "#ffffff",
            logging: false,
            useCORS: true,
            allowTaint: true,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
          })

          const imgData = canvas.toDataURL("image/png")
          const imgWidth = pageWidth - 2 * margin - 6
          const imgHeight = (canvas.height * imgWidth) / canvas.width

          if (yPosition + imgHeight > pageHeight - margin) {
            pdf.addPage()
            yPosition = margin
          }

          pdf.setDrawColor(...PRIMARY_COLOR)
          pdf.setLineWidth(0.5)
          pdf.roundedRect(margin + 3, yPosition, imgWidth, imgHeight, 2, 2, "S")

          pdf.addImage(imgData, "PNG", margin + 3, yPosition, imgWidth, imgHeight)
          yPosition += imgHeight + 12
        } catch (error) {
          console.error(`Error capturing chart:`, error)
          pdf.setFontSize(9)
          pdf.setTextColor(220, 38, 38)
          pdf.text(`[Chart could not be captured]`, margin + 5, yPosition)
          yPosition += 15
        }
      }

      // ==================== STATUS DISTRIBUTION TABLE ====================
      pdf.addPage()
      yPosition = margin

      pdf.setFillColor(...ACCENT_COLOR)
      pdf.rect(0, 0, pageWidth, 25, "F")

      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(22)
      pdf.setFont("helvetica", "bold")
      pdf.text("STATUS DISTRIBUTION ANALYSIS", pageWidth / 2, 17, { align: "center" })

      yPosition = 40

      // Clean table header
      pdf.setFillColor(...PRIMARY_COLOR)
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "bold")
      pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, "F")

      pdf.text("STATUS", margin + 8, yPosition + 7)
      pdf.text("COUNT", pageWidth / 2, yPosition + 7)
      pdf.text("PERCENTAGE", pageWidth - margin - 30, yPosition + 7)
      yPosition += 12

      // Table rows - clean alternating design
      pdf.setFontSize(9)
      const statusEntries = Object.entries(analytics.statusCounts || {})
      const totalStatusCount = statusEntries.reduce((sum, [, count]) => sum + count, 0)

      statusEntries.forEach(([status, count], idx) => {
        checkPageBreak(10)

        if (idx % 2 === 0) {
          pdf.setFillColor(...LIGHT_BG)
          pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 8, 1, 1, "F")
        }

        pdf.setTextColor(0, 0, 0)
        pdf.setFont("helvetica", "normal")
        pdf.text(status.charAt(0).toUpperCase() + status.slice(1), margin + 8, yPosition + 6)

        pdf.setTextColor(...PRIMARY_COLOR)
        pdf.setFont("helvetica", "bold")
        pdf.text(String(count), pageWidth / 2, yPosition + 6)

        const percentage = ((count / totalStatusCount) * 100).toFixed(1)
        pdf.setTextColor(...SECONDARY_COLOR)
        pdf.setFont("helvetica", "normal")
        pdf.text(`${percentage}%`, pageWidth - margin - 30, yPosition + 6)

        yPosition += 9
      })

      yPosition += 10

      // ==================== CATEGORY & DEPARTMENT DATA ====================
      if (Object.keys(analytics.categoryData || {}).length > 0) {
        pdf.addPage()
        yPosition = margin

        pdf.setFillColor(...ACCENT_COLOR)
        pdf.rect(0, 0, pageWidth, 25, "F")

        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(22)
        pdf.setFont("helvetica", "bold")
        pdf.text("CATEGORY & DEPARTMENT ANALYTICS", pageWidth / 2, 17, { align: "center" })

        yPosition = 40

        // Category section header
        pdf.setFillColor(...PRIMARY_COLOR)
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(12)
        pdf.setFont("helvetica", "bold")
        pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 12, 2, 2, "F")
        pdf.text("CATEGORY BREAKDOWN", margin + 8, yPosition + 8)
        yPosition += 17

        // Category table header
        pdf.setFillColor(...LIGHT_BG)
        pdf.setTextColor(...PRIMARY_COLOR)
        pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 1, 1, "F")
        pdf.setFontSize(9)
        pdf.setFont("helvetica", "bold")
        pdf.text("Category", margin + 8, yPosition + 7)
        pdf.text("Users", margin + 60, yPosition + 7)
        pdf.text("Total Requests", margin + 100, yPosition + 7)
        pdf.text("Avg/User", margin + 150, yPosition + 7)
        yPosition += 12

        // Category rows
        pdf.setFontSize(9)
        pdf.setTextColor(0, 0, 0)
        let catIdx = 0
        Object.entries(analytics.categoryData).forEach(([cat, data]) => {
          checkPageBreak(10)

          if (catIdx % 2 === 0) {
            pdf.setFillColor(...LIGHT_BG)
            pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 1, 1, "F")
          }

          pdf.setFont("helvetica", "normal")
          pdf.text(cat, margin + 8, yPosition + 7)
          pdf.setTextColor(...PRIMARY_COLOR)
          pdf.setFont("helvetica", "bold")
          pdf.text(String(data.users), margin + 60, yPosition + 7)
          pdf.text(String(data.totalRequests), margin + 100, yPosition + 7)
          pdf.text(String(data.averageRequestsPerUser), margin + 150, yPosition + 7)
          pdf.setTextColor(0, 0, 0)
          pdf.setFont("helvetica", "normal")
          yPosition += 10
          catIdx++
        })

        yPosition += 15

        // Department section (if exists)
        if (Object.keys(analytics.departmentData || {}).length > 0) {
          checkPageBreak(50)

          // Department section header
          pdf.setFillColor(...PRIMARY_COLOR)
          pdf.setTextColor(255, 255, 255)
          pdf.setFontSize(12)
          pdf.setFont("helvetica", "bold")
          pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 12, 2, 2, "F")
          pdf.text("DEPARTMENT BREAKDOWN", margin + 8, yPosition + 8)
          yPosition += 17

          // Department table header
          pdf.setFillColor(...LIGHT_BG)
          pdf.setTextColor(...PRIMARY_COLOR)
          pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 1, 1, "F")
          pdf.setFontSize(9)
          pdf.setFont("helvetica", "bold")
          pdf.text("Department", margin + 8, yPosition + 7)
          pdf.text("Users", margin + 80, yPosition + 7)
          pdf.text("Total Requests", margin + 120, yPosition + 7)
          pdf.text("Avg/User", margin + 160, yPosition + 7)
          yPosition += 12

          // Department rows
          pdf.setFontSize(9)
          pdf.setTextColor(0, 0, 0)
          let deptIdx = 0
          Object.entries(analytics.departmentData).forEach(([dept, data]) => {
            checkPageBreak(10)

            if (deptIdx % 2 === 0) {
              pdf.setFillColor(...LIGHT_BG)
              pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 1, 1, "F")
            }

            pdf.setFont("helvetica", "normal")
            const deptText = dept.length > 25 ? dept.substring(0, 25) + "..." : dept
            pdf.text(deptText, margin + 8, yPosition + 7)
            pdf.setTextColor(...PRIMARY_COLOR)
            pdf.setFont("helvetica", "bold")
            pdf.text(String(data.users), margin + 80, yPosition + 7)
            pdf.text(String(data.totalRequests), margin + 120, yPosition + 7)
            pdf.text(String(data.averageRequestsPerUser), margin + 160, yPosition + 7)
            pdf.setTextColor(0, 0, 0)
            pdf.setFont("helvetica", "normal")
            yPosition += 10
            deptIdx++
          })
        }
      }

      // ==================== TOP PUBLISHERS & AUTHORS ====================
      if (analytics.topPublishers?.length > 0 || analytics.topAuthors?.length > 0) {
        pdf.addPage()
        yPosition = margin

        pdf.setFillColor(...ACCENT_COLOR)
        pdf.rect(0, 0, pageWidth, 25, "F")

        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(22)
        pdf.setFont("helvetica", "bold")
        pdf.text("TOP PUBLISHERS & AUTHORS", pageWidth / 2, 17, { align: "center" })

        yPosition = 40

        // Publishers
        if (analytics.topPublishers?.length > 0) {
          pdf.setFillColor(...PRIMARY_COLOR)
          pdf.setTextColor(255, 255, 255)
          pdf.setFontSize(12)
          pdf.setFont("helvetica", "bold")
          pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 12, 2, 2, "F")
          pdf.text("TOP 10 PUBLISHERS BY REQUEST VOLUME", margin + 8, yPosition + 8)
          yPosition += 17

          // Publishers table header
          pdf.setFillColor(...LIGHT_BG)
          pdf.setTextColor(...PRIMARY_COLOR)
          pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 1, 1, "F")
          pdf.setFontSize(9)
          pdf.setFont("helvetica", "bold")
          pdf.text("Rank", margin + 8, yPosition + 7)
          pdf.text("Publisher Name", margin + 30, yPosition + 7)
          pdf.text("Requests", pageWidth - margin - 25, yPosition + 7, { align: "right" })
          yPosition += 12

          pdf.setFontSize(9)
          pdf.setTextColor(0, 0, 0)
          analytics.topPublishers.slice(0, 10).forEach((p, idx) => {
            checkPageBreak(10)

            if (idx % 2 === 0) {
              pdf.setFillColor(...LIGHT_BG)
              pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 1, 1, "F")
            }

            // Rank badge
            pdf.setFillColor(...PRIMARY_COLOR)
            pdf.circle(margin + 12, yPosition + 5, 4, "F")
            pdf.setTextColor(255, 255, 255)
            pdf.setFont("helvetica", "bold")
            pdf.setFontSize(8)
            pdf.text(String(idx + 1), margin + 12, yPosition + 6.5, { align: "center" })

            pdf.setFont("helvetica", "normal")
            pdf.setTextColor(0, 0, 0)
            pdf.setFontSize(9)
            const pubText = p.publisher.length > 50 ? p.publisher.substring(0, 50) + "..." : p.publisher
            pdf.text(pubText, margin + 25, yPosition + 7)

            pdf.setTextColor(...PRIMARY_COLOR)
            pdf.setFont("helvetica", "bold")
            pdf.text(String(p.count), pageWidth - margin - 25, yPosition + 7, { align: "right" })

            yPosition += 10
          })

          yPosition += 15
        }

        // Authors
        if (analytics.topAuthors?.length > 0) {
          checkPageBreak(50)

          pdf.setFillColor(...PRIMARY_COLOR)
          pdf.setTextColor(255, 255, 255)
          pdf.setFontSize(12)
          pdf.setFont("helvetica", "bold")
          pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 12, 2, 2, "F")
          pdf.text("TOP 10 AUTHORS BY REQUEST VOLUME", margin + 8, yPosition + 8)
          yPosition += 17

          // Authors table header
          pdf.setFillColor(...LIGHT_BG)
          pdf.setTextColor(...PRIMARY_COLOR)
          pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 1, 1, "F")
          pdf.setFontSize(9)
          pdf.setFont("helvetica", "bold")
          pdf.text("Rank", margin + 8, yPosition + 7)
          pdf.text("Author Name", margin + 30, yPosition + 7)
          pdf.text("Requests", pageWidth - margin - 25, yPosition + 7, { align: "right" })
          yPosition += 12

          pdf.setFontSize(9)
          pdf.setTextColor(0, 0, 0)
          analytics.topAuthors.slice(0, 10).forEach((a, idx) => {
            checkPageBreak(10)

            if (idx % 2 === 0) {
              pdf.setFillColor(...LIGHT_BG)
              pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 1, 1, "F")
            }

            // Rank badge
            pdf.setFillColor(...PRIMARY_COLOR)
            pdf.circle(margin + 12, yPosition + 5, 4, "F")
            pdf.setTextColor(255, 255, 255)
            pdf.setFont("helvetica", "bold")
            pdf.setFontSize(8)
            pdf.text(String(idx + 1), margin + 12, yPosition + 6.5, { align: "center" })

            pdf.setFont("helvetica", "normal")
            pdf.setTextColor(0, 0, 0)
            pdf.setFontSize(9)
            const authText = a.author.length > 50 ? a.author.substring(0, 50) + "..." : a.author
            pdf.text(authText, margin + 25, yPosition + 7)

            pdf.setTextColor(...PRIMARY_COLOR)
            pdf.setFont("helvetica", "bold")
            pdf.text(String(a.count), pageWidth - margin - 25, yPosition + 7, { align: "right" })

            yPosition += 10
          })
        }
      }

      // ==================== PEAK ACTIVITY ANALYSIS ====================
      if (analytics.peakActivity) {
        pdf.addPage()
        yPosition = margin

        pdf.setFillColor(...ACCENT_COLOR)
        pdf.rect(0, 0, pageWidth, 25, "F")

        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(22)
        pdf.setFont("helvetica", "bold")
        pdf.text("PEAK ACTIVITY ANALYSIS", pageWidth / 2, 17, { align: "center" })

        yPosition = 40

        // Peak hour and day summary
        pdf.setFillColor(...LIGHT_BG)
        pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 30, 2, 2, "F")

        pdf.setTextColor(...PRIMARY_COLOR)
        pdf.setFontSize(11)
        pdf.setFont("helvetica", "bold")
        pdf.text("ACTIVITY SUMMARY", margin + 8, yPosition + 10)

        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(10)
        pdf.setFont("helvetica", "normal")
        pdf.text(
          `Peak Activity Hour: ${analytics.peakActivity.peakHour}:00 (${analytics.peakActivity.peakHour > 12 ? analytics.peakActivity.peakHour - 12 : analytics.peakActivity.peakHour}:00 ${analytics.peakActivity.peakHour >= 12 ? "PM" : "AM"})`,
          margin + 8,
          yPosition + 20
        )
        pdf.text(`Most Active Day: ${analytics.peakActivity.peakDay}`, margin + 8, yPosition + 27)

        yPosition += 40

        // Additional insights
        pdf.setTextColor(...SECONDARY_COLOR)
        pdf.setFontSize(9)
        pdf.setFont("helvetica", "italic")
        const insightText = `This data helps optimize staffing schedules and system maintenance windows to maximize efficiency and minimize user disruption.`
        const insightLines = pdf.splitTextToSize(insightText, pageWidth - 2 * margin)
        pdf.text(insightLines, margin, yPosition)
        yPosition += insightLines.length * 5 + 10
      }

      // ==================== USER PERFORMANCE METRICS ====================
      if (analytics.usersAnalytics && analytics.usersAnalytics.length > 0) {
        checkPageBreak(60)

        pdf.addPage()
        yPosition = margin

        pdf.setFillColor(...ACCENT_COLOR)
        pdf.rect(0, 0, pageWidth, 25, "F")

        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(22)
        pdf.setFont("helvetica", "bold")
        pdf.text("USER PERFORMANCE METRICS", pageWidth / 2, 17, { align: "center" })

        yPosition = 40

        // Summary statistics
        const topPerformers = analytics.usersAnalytics.filter((u) => u.successRate >= 80).length
        const avgSuccessRate = Math.round(
          analytics.usersAnalytics.reduce((sum, u) => sum + u.successRate, 0) / analytics.usersAnalytics.length
        )

        pdf.setFillColor(...LIGHT_BG)
        pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 25, 2, 2, "F")

        pdf.setTextColor(...PRIMARY_COLOR)
        pdf.setFontSize(11)
        pdf.setFont("helvetica", "bold")
        pdf.text("PERFORMANCE OVERVIEW", margin + 8, yPosition + 10)

        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(9)
        pdf.setFont("helvetica", "normal")
        pdf.text(`Total Active Users: ${analytics.usersAnalytics.length}`, margin + 8, yPosition + 17)
        pdf.text(`High Performers (80%+ Success): ${topPerformers}`, margin + 8, yPosition + 22)
        pdf.text(`Average Success Rate: ${avgSuccessRate}%`, pageWidth / 2 + 10, yPosition + 17)
        pdf.text(
          `Total Requests Processed: ${analytics.usersAnalytics.reduce((sum, u) => sum + u.totalRequests, 0)}`,
          pageWidth / 2 + 10,
          yPosition + 22
        )

        yPosition += 35

        // Top 10 users by request volume
        pdf.setFillColor(...PRIMARY_COLOR)
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(11)
        pdf.setFont("helvetica", "bold")
        pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, "F")
        pdf.text("TOP 10 USERS BY REQUEST VOLUME", margin + 8, yPosition + 7)
        yPosition += 13

        // Table header
        pdf.setFillColor(...LIGHT_BG)
        pdf.setTextColor(...PRIMARY_COLOR)
        pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 1, 1, "F")
        pdf.setFontSize(8)
        pdf.setFont("helvetica", "bold")
        pdf.text("Rank", margin + 5, yPosition + 7)
        pdf.text("User Email", margin + 20, yPosition + 7)
        pdf.text("Requests", margin + 120, yPosition + 7)
        pdf.text("Success Rate", margin + 150, yPosition + 7)
        yPosition += 12

        // Top 10 users
        pdf.setFontSize(8)
        analytics.usersAnalytics.slice(0, 10).forEach((user, idx) => {
          checkPageBreak(9)

          if (idx % 2 === 0) {
            pdf.setFillColor(...LIGHT_BG)
            pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 9, 1, 1, "F")
          }

          pdf.setTextColor(...PRIMARY_COLOR)
          pdf.setFont("helvetica", "bold")
          pdf.text(String(idx + 1), margin + 5, yPosition + 6)

          pdf.setTextColor(0, 0, 0)
          pdf.setFont("helvetica", "normal")
          const emailText = user.userEmail.length > 35 ? user.userEmail.substring(0, 35) + "..." : user.userEmail
          pdf.text(emailText, margin + 20, yPosition + 6)

          pdf.setTextColor(...PRIMARY_COLOR)
          pdf.setFont("helvetica", "bold")
          pdf.text(String(user.totalRequests), margin + 120, yPosition + 6)

          // Success rate with color coding
          if (user.successRate >= 80) {
            pdf.setTextColor(16, 185, 129) // Green
          } else if (user.successRate >= 60) {
            pdf.setTextColor(245, 158, 11) // Amber
          } else {
            pdf.setTextColor(239, 68, 68) // Red
          }
          pdf.text(`${user.successRate}%`, margin + 150, yPosition + 6)

          yPosition += 9
        })
      }

      // ==================== RECOMMENDATIONS ====================
      pdf.addPage()
      yPosition = margin

      pdf.setFillColor(...ACCENT_COLOR)
      pdf.rect(0, 0, pageWidth, 25, "F")

      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(22)
      pdf.setFont("helvetica", "bold")
      pdf.text("RECOMMENDATIONS & INSIGHTS", pageWidth / 2, 17, { align: "center" })

      yPosition = 40

      const recommendations = []

      // Performance-based recommendations
      if (analytics.successMetrics?.successRate < 60) {
        recommendations.push({
          title: "Critical: Improve Request Success Rate",
          description: `Current success rate of ${analytics.successMetrics?.successRate}% is below acceptable threshold. Implement request quality guidelines, provide user training, and review rejection reasons to identify common issues.`,
          priority: "high",
        })
      } else if (analytics.successMetrics?.successRate >= 80) {
        recommendations.push({
          title: "Maintain Excellent Performance",
          description: `Success rate of ${analytics.successMetrics?.successRate}% demonstrates outstanding performance. Continue current quality processes and document best practices.`,
          priority: "low",
        })
      } else {
        recommendations.push({
          title: "Enhance Request Quality",
          description: `Success rate of ${analytics.successMetrics?.successRate}% shows room for improvement. Consider implementing request templates and user guidelines.`,
          priority: "medium",
        })
      }

      // Response time recommendations
      if (analytics.timeMetrics?.averageResponseTimeDays > 7) {
        recommendations.push({
          title: "Optimize Response Time",
          description: `Average response time of ${analytics.timeMetrics?.averageResponseTimeDays} days exceeds target SLA. Review workflow bottlenecks, consider increasing staff during peak hours, and implement automated processing where possible.`,
          priority: "high",
        })
      } else if (analytics.timeMetrics?.averageResponseTimeDays <= 3) {
        recommendations.push({
          title: "Excellent Response Time",
          description: `Average response time of ${analytics.timeMetrics?.averageResponseTimeDays} days demonstrates efficient processing. Monitor to ensure consistency.`,
          priority: "low",
        })
      }

      // Activity-based recommendations
      if (analytics.peakActivity) {
        recommendations.push({
          title: "Optimize Resource Allocation",
          description: `Peak activity occurs at ${analytics.peakActivity.peakHour}:00 on ${analytics.peakActivity.peakDay}s. Schedule staff and system resources accordingly to handle increased demand.`,
          priority: "medium",
        })
      }

      // User engagement recommendations
      if (analytics.activeUsers && analytics.totalUsers) {
        const engagementRate = (analytics.activeUsers / analytics.totalUsers) * 100
        if (engagementRate < 50) {
          recommendations.push({
            title: "Increase User Engagement",
            description: `Only ${engagementRate.toFixed(1)}% of registered users are active. Launch awareness campaigns, send reminder notifications, and highlight available resources to boost engagement.`,
            priority: "medium",
          })
        }
      }

      // General recommendations
      recommendations.push({
        title: "Leverage Data Analytics",
        description:
          "Continue monitoring these metrics monthly. Use trend data to forecast demand, identify seasonal patterns, and make evidence-based decisions for resource planning.",
        priority: "medium",
      })

      recommendations.push({
        title: "User Feedback Collection",
        description:
          "Implement a feedback system to gather qualitative insights from users about their experience with the library system. Combine quantitative analytics with qualitative feedback for comprehensive improvements.",
        priority: "low",
      })

      recommendations.forEach((rec, idx) => {
        checkPageBreak(25)

        // Different styling based on priority
        let borderColor = PRIMARY_COLOR
        if (rec.priority === "high") borderColor = [239, 68, 68] // Red
        else if (rec.priority === "medium") borderColor = [245, 158, 11] // Amber
        else borderColor = [16, 185, 129] // Green

        pdf.setFillColor(255, 255, 255)
        pdf.setDrawColor(...borderColor)
        pdf.setLineWidth(1)
        pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 20, 2, 2, "S")

        // Number badge with priority color
        pdf.setFillColor(...borderColor)
        pdf.circle(margin + 8, yPosition + 6, 4, "F")
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(9)
        pdf.setFont("helvetica", "bold")
        pdf.text(String(idx + 1), margin + 8, yPosition + 7.5, { align: "center" })

        // Title with priority badge
        pdf.setTextColor(...borderColor)
        pdf.setFontSize(10)
        pdf.setFont("helvetica", "bold")
        pdf.text(rec.title, margin + 18, yPosition + 7)

        // Priority badge
        pdf.setFontSize(7)
        pdf.setTextColor(...borderColor)
        pdf.text(`[${rec.priority.toUpperCase()}]`, pageWidth - margin - 25, yPosition + 7)

        // Description
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(8)
        pdf.setFont("helvetica", "normal")
        const descLines = pdf.splitTextToSize(rec.description, pageWidth - 2 * margin - 20)
        pdf.text(descLines, margin + 18, yPosition + 13)

        yPosition += 23
      })

      // ==================== SUMMARY & CONCLUSION ====================
      pdf.addPage()
      yPosition = margin

      pdf.setFillColor(...ACCENT_COLOR)
      pdf.rect(0, 0, pageWidth, 25, "F")

      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(22)
      pdf.setFont("helvetica", "bold")
      pdf.text("SUMMARY & CONCLUSION", pageWidth / 2, 17, { align: "center" })

      yPosition = 40

      // Key findings summary
      pdf.setFillColor(...LIGHT_BG)
      pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 12, 2, 2, "F")

      pdf.setTextColor(...PRIMARY_COLOR)
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.text("KEY FINDINGS", margin + 8, yPosition + 8)
      yPosition += 17

      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(9)
      pdf.setFont("helvetica", "normal")

      const findings = [
        `The library system currently serves ${analytics.totalUsers} registered users with ${analytics.activeUsers} actively making requests, representing a ${((analytics.activeUsers / analytics.totalUsers) * 100).toFixed(1)}% engagement rate.`,
        `A total of ${analytics.totalRequests} document requests have been processed with a success rate of ${analytics.successMetrics?.successRate}%, indicating ${analytics.successMetrics?.successRate >= 80 ? "excellent" : analytics.successMetrics?.successRate >= 60 ? "satisfactory" : "needs improvement"} request quality.`,
        `Average response time is ${analytics.timeMetrics?.averageResponseTimeDays} days, ${analytics.timeMetrics?.averageResponseTimeDays <= 3 ? "meeting" : "exceeding"} the target service level agreement.`,
        `Peak activity occurs at ${analytics.peakActivity?.peakHour}:00 on ${analytics.peakActivity?.peakDay}s, providing valuable insights for resource planning.`,
        `The top ${analytics.topPublishers?.length || 0} publishers and ${analytics.topAuthors?.length || 0} authors account for a significant portion of requests, suggesting focused collection development opportunities.`,
      ]

      findings.forEach((finding) => {
        checkPageBreak(15)

        pdf.setFillColor(255, 255, 255)
        pdf.setDrawColor(...PRIMARY_COLOR)
        pdf.setLineWidth(0.3)
        pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 12, 1, 1, "S")

        // Bullet point
        pdf.setFillColor(...PRIMARY_COLOR)
        pdf.circle(margin + 6, yPosition + 6, 1.5, "F")

        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(8)
        pdf.setFont("helvetica", "normal")
        const findingLines = pdf.splitTextToSize(finding, pageWidth - 2 * margin - 15)
        pdf.text(findingLines, margin + 10, yPosition + 5)

        yPosition += 14
      })

      yPosition += 10

      // Conclusion
      pdf.setFillColor(...PRIMARY_COLOR)
      pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 12, 2, 2, "F")

      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.text("CONCLUSION", margin + 8, yPosition + 8)
      yPosition += 17

      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(9)
      pdf.setFont("helvetica", "normal")

      const conclusion = `This comprehensive analytics report demonstrates the IIT Jodhpur Central Library Management System's operational status and performance. The data-driven insights provided herein serve as a foundation for strategic planning, process optimization, and resource allocation. Regular monitoring of these metrics will enable proactive management and continuous improvement of library services. The recommendations outlined should be reviewed and implemented based on priority to enhance overall system efficiency and user satisfaction.`
      const conclusionLines = pdf.splitTextToSize(conclusion, pageWidth - 2 * margin - 16)

      const conclusionBoxHeight = conclusionLines.length * 5.5 + 12

      pdf.setFillColor(...LIGHT_BG)
      pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, conclusionBoxHeight, 2, 2, "F")

      pdf.text(conclusionLines, margin + 8, yPosition + 7)
      yPosition += conclusionBoxHeight + 10

      // Report metadata
      checkPageBreak(40)

      pdf.setDrawColor(...PRIMARY_COLOR)
      pdf.setLineWidth(0.5)
      pdf.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10

      pdf.setTextColor(...SECONDARY_COLOR)
      pdf.setFontSize(8)
      pdf.setFont("helvetica", "normal")

      pdf.text(`Report Generated: ${new Date().toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}`, margin, yPosition)
      yPosition += 5
      pdf.text(
        `Reporting Period: ${startDate ? startDate.toLocaleDateString("en-IN") : "All Time"} to ${endDate ? endDate.toLocaleDateString("en-IN") : "Present"}`,
        margin,
        yPosition
      )
      yPosition += 5
      pdf.text(`Document Version: 2.0`, margin, yPosition)
      yPosition += 5
      pdf.text(`System: IIT Jodhpur Central Library Management System`, margin, yPosition)
      yPosition += 10

      pdf.setTextColor(...PRIMARY_COLOR)
      pdf.setFont("helvetica", "italic")
      pdf.setFontSize(7)
      const disclaimerText = `This report is confidential and intended solely for authorized personnel of IIT Jodhpur. The data and analysis contained herein are based on system records as of the report generation date.`
      const disclaimerLines = pdf.splitTextToSize(disclaimerText, pageWidth - 2 * margin)
      pdf.text(disclaimerLines, margin, yPosition)

      // ==================== FOOTER ON ALL PAGES ====================
      const pageCount = pdf.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i)

        if (i === 1) continue

        // Footer line
        pdf.setDrawColor(...PRIMARY_COLOR)
        pdf.setLineWidth(0.5)
        pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)

        // Footer text
        pdf.setFontSize(7)
        pdf.setTextColor(...SECONDARY_COLOR)
        pdf.setFont("helvetica", "normal")
        pdf.text("IIT Jodhpur Central Library Analytics Report", margin, pageHeight - 9)

        // Page number
        pdf.setTextColor(...PRIMARY_COLOR)
        pdf.setFont("helvetica", "bold")
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, pageHeight - 9)
      }

      // Save the PDF
      const fileName = `IIT_Analytics_Report_${new Date().toISOString().split("T")[0]}.pdf`
      pdf.save(fileName)

      setStatusMessage("Report generated successfully!")
      setTimeout(() => setStatusMessage(""), 3000)
    } catch (error) {
      console.error("Error generating report:", error)
      setStatusMessage("Failed to generate report. Please try again.")
      setTimeout(() => setStatusMessage(""), 3000)
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
      } else {
        console.error("Logout failed:", response.statusText)
        alert("Failed to log out. Please try again.")
      }
    } catch (err) {
      console.error("Logout error:", err)
      alert("An error occurred during logout. Please try again.")
    }
  }

  const isAdmin = analytics?.totalUsers !== undefined

  const filteredRequests =
    analytics?.requests?.filter(
      (request) =>
        request.documentTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.publisher?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  const filteredUsers = allUsers.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatMostRequested = (most) => {
    if (!most || most.length === 0) return "None"
    return most.map((item) => `${item.documentTitle} (${item.count})`).join(", ")
  }

  const SafeChart = ({ data, children }) => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No data available</p>
          </div>
        </div>
      )
    }
    return children
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    )
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
    )
  }

  if (!analytics) return null

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
                <Link to="/" className="text-slate-700 hover:text-blue-700 font-medium transition-colors">
                  New Request
                </Link>
                <Link to="/dashboard" className="text-slate-700 hover:text-blue-700 font-medium transition-colors">
                  Dashboard
                </Link>
                <Link to="/library" className="text-slate-700 hover:text-blue-700 font-medium transition-colors">
                  Library
                </Link>
                <Link to="/adminPanel" className="text-slate-700 hover:text-blue-700 font-medium transition-colors">
                  Admin Panel
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-all"
                >
                  Logout
                </button>
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
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all shadow-md ${
                    isGeneratingReport
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
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
              {isAdmin ? "System Analytics & Insights" : "My Request Analytics"}
            </h2>
            <p className="text-slate-600">
              {isAdmin
                ? "Comprehensive analytics and statistics for the IIT Jodhpur library system"
                : "Track your document request performance and history"}
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
                  onClick={() => {
                    setStartDate(null)
                    setEndDate(null)
                  }}
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
                  <p className="text-3xl font-bold text-slate-900">
                    {analytics.timeMetrics?.averageResponseTimeDays} days
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    {analytics.timeMetrics?.completedRequestsCount} completed
                  </p>
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
                  <p className="text-sm font-bold text-slate-900 line-clamp-2">
                    {formatMostRequested(analytics.mostRequested)}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Status Distribution Bar Chart */}
            <div
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              data-chart
              data-chart-title="Requests by Status"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span>Requests by Status</span>
              </h3>
              <SafeChart data={Object.entries(analytics?.statusCounts || {})}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={Object.entries(analytics?.statusCounts || {}).map(([status, count]) => ({ status, count }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="status" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                    />
                    <Bar dataKey="count" fill="#A855F7" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </SafeChart>
            </div>

            {/* Status Distribution Pie Chart */}
            <div
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              data-chart
              data-chart-title="Status Distribution"
            >
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
            <div
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              data-chart
              data-chart-title="Monthly Trends"
            >
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
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ fill: "#10B981", r: 4 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </SafeChart>
            </div>

            {/* Peak Activity Hours */}
            <div
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              data-chart
              data-chart-title="Peak Activity Hours"
            >
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
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                    />
                    <Bar dataKey="count" fill="#F59E0B" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </SafeChart>
            </div>

            {isAdmin && Object.keys(analytics.categoryData || {}).length > 0 && (
              <div
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
                data-chart
                data-chart-title="Requests by Category"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  <span>Requests by Category</span>
                </h3>
                <SafeChart data={Object.entries(analytics.categoryData || {})}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Object.entries(analytics.categoryData || {}).map(([category, v]) => ({
                        category,
                        count: v.totalRequests,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="category" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                      />
                      <Bar dataKey="count" fill="#FB923C" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </SafeChart>
              </div>
            )}

            {isAdmin && Object.keys(analytics.departmentData || {}).length > 0 && (
              <div
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
                data-chart
                data-chart-title="Requests by Department"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <span>Requests by Department</span>
                </h3>
                <SafeChart data={Object.entries(analytics.departmentData || {})}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Object.entries(analytics.departmentData || {}).map(([department, v]) => ({
                        department,
                        count: v.totalRequests,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="department" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                      />
                      <Bar dataKey="count" fill="#22C55E" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </SafeChart>
              </div>
            )}

            {/* Publication Year Distribution */}
            <div
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              data-chart
              data-chart-title="Publication Year Distribution"
            >
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
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                    />
                    <Bar dataKey="count" fill="#EC4899" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </SafeChart>
            </div>

            {/* Daily Activity Distribution */}
            <div
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2"
              data-chart
              data-chart-title="Activity by Day of Week"
            >
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
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
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
                    Total Rejections:{" "}
                    <span className="text-2xl font-bold text-red-600">{analytics.rejectionAnalysis.totalRejected}</span>
                  </p>
                  <div className="space-y-3">
                    {analytics.rejectionAnalysis.rejectionReasons.map((reason, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                      >
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
                          contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
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
                          <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">
                            Total Requests
                          </th>
                          <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Avg/User</th>
                          <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">
                            Most Requested
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {Object.entries(analytics.categoryData || {}).map(([cat, data]) => (
                          <tr key={cat} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 text-slate-900 font-medium">{cat}</td>
                            <td className="py-4 px-4 text-slate-600">{data.users}</td>
                            <td className="py-4 px-4 text-slate-600">{data.totalRequests}</td>
                            <td className="py-4 px-4 text-slate-600">{data.averageRequestsPerUser}</td>
                            <td className="py-4 px-4 text-slate-600 text-sm">
                              {formatMostRequested(data.mostRequested)}
                            </td>
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
                          <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">
                            Total Requests
                          </th>
                          <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Avg/User</th>
                          <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">
                            Most Requested
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {Object.entries(analytics.departmentData || {}).map(([dep, data]) => (
                          <tr key={dep} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 text-slate-900 font-medium">{dep}</td>
                            <td className="py-4 px-4 text-slate-600">{data.users}</td>
                            <td className="py-4 px-4 text-slate-600">{data.totalRequests}</td>
                            <td className="py-4 px-4 text-slate-600">{data.averageRequestsPerUser}</td>
                            <td className="py-4 px-4 text-slate-600 text-sm">
                              {formatMostRequested(data.mostRequested)}
                            </td>
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
                          <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">
                            Total Requests
                          </th>
                          <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">
                            Success Rate
                          </th>
                          <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Accepted</th>
                          <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Rejected</th>
                          <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">
                            Most Requested
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {analytics.usersAnalytics
                          .filter((user) => user.userEmail.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((user, index) => (
                            <tr key={index} className="hover:bg-slate-50 transition-colors">
                              <td className="py-4 px-4 text-slate-900 font-medium">{user.userEmail}</td>
                              <td className="py-4 px-4 text-slate-600">{user.totalRequests}</td>
                              <td className="py-4 px-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    user.successRate >= 70
                                      ? "bg-emerald-100 text-emerald-800"
                                      : user.successRate >= 40
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {user.successRate}%
                                </span>
                              </td>
                              <td className="py-4 px-4 text-emerald-600 font-medium">{user.acceptedCount}</td>
                              <td className="py-4 px-4 text-red-600 font-medium">{user.rejectedCount}</td>
                              <td className="py-4 px-4 text-slate-600 text-xs">
                                {formatMostRequested(user.mostRequested)}
                              </td>
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
              <span>{isAdmin ? "Recent Requests (All Users)" : "My Recent Requests"}</span>
            </h3>
            {filteredRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {isAdmin && (
                        <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">User</th>
                      )}
                      <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Document Title</th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Publisher</th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Status</th>
                      {isAdmin && (
                        <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Category</th>
                      )}
                      {isAdmin && (
                        <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase">Department</th>
                      )}
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
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              request.status === "accepted"
                                ? "bg-emerald-100 text-emerald-800"
                                : request.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : request.status === "pending"
                                    ? "bg-amber-100 text-amber-800"
                                    : request.status === "processing"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {request.status}
                          </span>
                        </td>
                        {isAdmin && <td className="py-4 px-4 text-slate-600">{request.category}</td>}
                        {isAdmin && <td className="py-4 px-4 text-slate-600">{request.department}</td>}
                        <td className="py-4 px-4 text-slate-600">{new Date(request.createdAt).toLocaleDateString()}</td>
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
  )
}

export default AnalyticsPage