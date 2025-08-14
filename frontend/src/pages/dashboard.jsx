import React, { useState } from 'react';
import { Search, User, Github, Filter, Eye, Check, X, Clock, AlertCircle, FileText, ExternalLink } from 'lucide-react';

export default function LibraryDashboard() {
  // Mock data for user requests with updated fields
  const [requests, setRequests] = useState([
    {
      id: 1,
      // User Details
      email: "john.doe@university.edu",
      rollEmployeeNo: "CS2021001",
      requesterName: "John Doe",
      patronCategory: "student",
      department: "Computer Science",
      
      // Document Details
      documentTitle: "Machine Learning: A Probabilistic Perspective",
      authors: "Kevin P. Murphy",
      publicationName: "MIT Press",
      publicationYear: 2012,
      volumeNo: "",
      issueNo: "",
      pageRange: "",
      sourceUrl: "https://mitpress.mit.edu/books/machine-learning-1",
      publisher: "MIT Press",
      
      status: "pending",
      requestedAt: "2025-08-12T10:30:00Z"
    },
    {
      id: 2,
      email: "sarah.johnson@university.edu",
      rollEmployeeNo: "ENG2020045",
      requesterName: "Sarah Johnson",
      patronCategory: "student",
      department: "English Literature",
      
      documentTitle: "The Great Gatsby and the American Dream",
      authors: "F. Scott Fitzgerald, Harold Bloom",
      publicationName: "Modern Critical Interpretations",
      publicationYear: 2010,
      volumeNo: "12",
      issueNo: "3",
      pageRange: "45-68",
      sourceUrl: "",
      publisher: "Chelsea House Publications",
      
      status: "approved",
      requestedAt: "2025-08-11T14:15:00Z"
    },
    {
      id: 3,
      email: "m.chen@research.org",
      rollEmployeeNo: "RES2024007",
      requesterName: "Dr. Michael Chen",
      patronCategory: "researcher",
      department: "Climate Science Institute",
      
      documentTitle: "Climate Change Impact on Arctic Ice Sheets",
      authors: "Emma Wilson, Robert Taylor, Lisa Chang",
      publicationName: "Nature Climate Change",
      publicationYear: 2024,
      volumeNo: "14",
      issueNo: "8",
      pageRange: "1023-1035",
      sourceUrl: "https://doi.org/10.1038/s41558-024-01234-5",
      publisher: "Nature Publishing Group",
      
      status: "processing",
      requestedAt: "2025-08-10T09:45:00Z"
    },
    {
      id: 4,
      email: "lisa.brown@company.com",
      rollEmployeeNo: "EXT2024003",
      requesterName: "Lisa Brown",
      patronCategory: "external",
      department: "Marketing Division",
      
      documentTitle: "Digital Marketing Strategies in the Modern Era",
      authors: "Philip Kotler, Gary Armstrong",
      publicationName: "Journal of Marketing Research",
      publicationYear: 2023,
      volumeNo: "60",
      issueNo: "4",
      pageRange: "112-128",
      sourceUrl: "",
      publisher: "American Marketing Association",
      
      status: "rejected",
      requestedAt: "2025-08-09T16:20:00Z"
    },
    {
      id: 5,
      email: "d.wilson@physics.edu",
      rollEmployeeNo: "PHYS2019012",
      requesterName: "David Wilson",
      patronCategory: "faculty",
      department: "Physics Department",
      
      documentTitle: "Quantum Mechanics and Path Integrals",
      authors: "Richard P. Feynman, Albert R. Hibbs",
      publicationName: "McGraw-Hill Education",
      publicationYear: 2010,
      volumeNo: "",
      issueNo: "",
      pageRange: "",
      sourceUrl: "https://www.mheducation.com/highered/product/quantum-mechanics-path-integrals-feynman-hibbs/9780070206502.html",
      publisher: "McGraw-Hill Education",
      
      status: "approved",
      requestedAt: "2025-08-08T11:10:00Z"
    },
    {
      id: 6,
      email: "r.taylor@med.university.edu",
      rollEmployeeNo: "MED2022089",
      requesterName: "Dr. Robert Taylor",
      patronCategory: "faculty",
      department: "Medical Ethics",
      
      documentTitle: "AI Ethics in Healthcare Decision Making",
      authors: "Jennifer Adams, Mark Thompson, Sarah Davis",
      publicationName: "Journal of Medical Ethics",
      publicationYear: 2024,
      volumeNo: "50",
      issueNo: "2",
      pageRange: "89-102",
      sourceUrl: "https://doi.org/10.1136/medethics-2024-109234",
      publisher: "BMJ Publishing Group",
      
      status: "pending",
      requestedAt: "2025-08-07T13:30:00Z"
    }
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPatronCategory, setFilterPatronCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Admin actions
  const handleApprove = (requestId) => {
    setRequests(requests.map(request => 
      request.id === requestId 
        ? { ...request, status: 'approved' }
        : request
    ));
  };

  const handleReject = (requestId) => {
    setRequests(requests.map(request => 
      request.id === requestId 
        ? { ...request, status: 'rejected' }
        : request
    ));
  };

  const handleSetProcessing = (requestId) => {
    setRequests(requests.map(request => 
      request.id === requestId 
        ? { ...request, status: 'processing' }
        : request
    ));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
      case 'rejected': return { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' };
      case 'processing': return { bg: '#fef3c7', text: '#d97706', border: '#fde68a' };
      default: return { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' };
    }
  };

  const getPatronCategoryColor = (category) => {
    switch(category) {
      case 'student': return { bg: '#dbeafe', text: '#2563eb' };
      case 'faculty': return { bg: '#dcfce7', text: '#166534' };
      case 'staff': return { bg: '#fef3c7', text: '#d97706' };
      case 'researcher': return { bg: '#e0e7ff', text: '#4338ca' };
      case 'external': return { bg: '#f3e8ff', text: '#7c3aed' };
      default: return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesPatronCategory = filterPatronCategory === 'all' || request.patronCategory === filterPatronCategory;
    const matchesSearch = searchTerm === '' || 
      request.documentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPatronCategory && matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get counts for status overview
  const statusCounts = requests.reduce((acc, request) => {
    acc[request.status] = (acc[request.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw',
      backgroundColor: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'auto'
    }}>
      {/* Header */}
      <nav style={{ 
        backgroundColor: '#ffffff', 
        padding: '16px 24px', 
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            backgroundColor: '#6366f1', 
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>L</span>
          </div>
          <span style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>LibraryX Admin</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#9ca3af', 
              width: '18px', 
              height: '18px' 
            }} />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                paddingLeft: '40px',
                paddingRight: '16px',
                paddingTop: '8px',
                paddingBottom: '8px',
                borderRadius: '20px',
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
                fontSize: '14px',
                width: '250px',
                outline: 'none'
              }}
            />
          </div>
          
          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#" style={{ textDecoration: 'none', color: '#6366f1', fontSize: '14px', fontWeight: '500' }}>Dashboard</a>
            <a href="#" style={{ textDecoration: 'none', color: '#6b7280', fontSize: '14px' }}>Requests</a>
            <a href="#" style={{ textDecoration: 'none', color: '#6b7280', fontSize: '14px' }}>Analytics</a>
            <a href="#" style={{ textDecoration: 'none', color: '#6b7280', fontSize: '14px' }}>Logout</a>
          </nav>
          
          <div style={{ 
            width: '32px', 
            height: '32px', 
            backgroundColor: '#fbbf24', 
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User style={{ width: '18px', height: '18px', color: 'white' }} />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        backgroundColor: '#f8f9fa',
        padding: '32px 24px'
      }}>
        {/* Header Section */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#1f2937', 
            margin: '0 0 8px 0' 
          }}>
            Admin Dashboard
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#6b7280', 
            margin: '0' 
          }}>
            Review and manage document requests from users
          </p>
        </div>

        {/* Status Overview Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#6b7280', marginBottom: '4px' }}>
              {statusCounts.pending || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#9ca3af' }}>Pending Review</div>
          </div>
          
          <div style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706', marginBottom: '4px' }}>
              {statusCounts.processing || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#9ca3af' }}>Processing</div>
          </div>
          
          <div style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#166534', marginBottom: '4px' }}>
              {statusCounts.approved || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#9ca3af' }}>Approved</div>
          </div>
          
          <div style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626', marginBottom: '4px' }}>
              {statusCounts.rejected || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#9ca3af' }}>Rejected</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ 
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid #e5e7eb',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter style={{ width: '18px', height: '18px', color: '#6b7280' }} />
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>Filters:</span>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              backgroundColor: '#ffffff',
              color: '#1f2937',
              outline: 'none'
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="processing">Processing</option>
          </select>

          <select
            value={filterPatronCategory}
            onChange={(e) => setFilterPatronCategory(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              backgroundColor: '#ffffff',
              color: '#1f2937',
              outline: 'none'
            }}
          >
            <option value="all">All Categories</option>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="staff">Staff</option>
            <option value="researcher">Researcher</option>
            <option value="external">External</option>
          </select>

          <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#6b7280' }}>
            {filteredRequests.length} of {requests.length} requests
          </div>
        </div>

        {/* Requests Table */}
        <div style={{ 
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 100px 180px',
            gap: '16px',
            padding: '16px 20px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e5e7eb',
            fontSize: '12px',
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            <div>Document Details</div>
            <div>Requester Info</div>
            <div>Publication</div>
            <div>Category</div>
            <div>Date</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {/* Table Body */}
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredRequests.map((request, index) => {
              const statusColors = getStatusColor(request.status);
              const patronColors = getPatronCategoryColor(request.patronCategory);
              
              return (
                <div
                  key={request.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 100px 180px',
                    gap: '16px',
                    padding: '16px 20px',
                    borderBottom: index < filteredRequests.length - 1 ? '1px solid #f3f4f6' : 'none',
                    alignItems: 'center'
                  }}
                >
                  {/* Document Details */}
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                      {request.documentTitle}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>
                      by {request.authors}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{request.publisher} • {request.publicationYear}</span>
                      {request.sourceUrl && (
                        <a 
                          href={request.sourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#6366f1', textDecoration: 'none' }}
                        >
                          <ExternalLink style={{ width: '12px', height: '12px' }} />
                        </a>
                      )}
                    </div>
                    {(request.volumeNo || request.issueNo || request.pageRange) && (
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                        {request.volumeNo && `Vol. ${request.volumeNo}`}
                        {request.issueNo && ` Issue ${request.issueNo}`}
                        {request.pageRange && ` pp. ${request.pageRange}`}
                      </div>
                    )}
                  </div>

                  {/* Requester Info */}
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', marginBottom: '2px' }}>
                      {request.requesterName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>
                      {request.rollEmployeeNo}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                      {request.email}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      {request.department}
                    </div>
                  </div>

                  {/* Publication */}
                  <div>
                    <div style={{ fontSize: '13px', color: '#1f2937', fontWeight: '500' }}>
                      {request.publicationName}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: patronColors.text,
                      backgroundColor: patronColors.bg,
                      padding: '4px 8px',
                      borderRadius: '12px',
                      textTransform: 'capitalize'
                    }}>
                      {request.patronCategory}
                    </span>
                  </div>

                  {/* Date */}
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {formatDate(request.requestedAt)}
                  </div>

                  {/* Status */}
                  <div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: statusColors.text,
                      backgroundColor: statusColors.bg,
                      border: `1px solid ${statusColors.border}`,
                      padding: '6px 12px',
                      borderRadius: '16px',
                      textTransform: 'capitalize'
                    }}>
                      {request.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleSetProcessing(request.id)}
                          style={{
                            padding: '6px 8px',
                            backgroundColor: '#fef3c7',
                            color: '#d97706',
                            border: '1px solid #fde68a',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Set to Processing"
                        >
                          <Clock style={{ width: '12px', height: '12px' }} />
                        </button>
                        <button
                          onClick={() => handleApprove(request.id)}
                          style={{
                            padding: '6px 8px',
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            border: '1px solid #bbf7d0',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Approve Request"
                        >
                          <Check style={{ width: '12px', height: '12px' }} />
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          style={{
                            padding: '6px 8px',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Reject Request"
                        >
                          <X style={{ width: '12px', height: '12px' }} />
                        </button>
                      </>
                    )}
                    
                    {request.status === 'processing' && (
                      <>
                        <button
                          onClick={() => handleApprove(request.id)}
                          style={{
                            padding: '6px 8px',
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            border: '1px solid #bbf7d0',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Approve Request"
                        >
                          <Check style={{ width: '12px', height: '12px' }} />
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          style={{
                            padding: '6px 8px',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Reject Request"
                        >
                          <X style={{ width: '12px', height: '12px' }} />
                        </button>
                      </>
                    )}

                    {(request.status === 'approved' || request.status === 'rejected') && (
                      <span style={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        fontStyle: 'italic'
                      }}>
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRequests.length === 0 && (
            <div style={{
              padding: '48px 20px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <AlertCircle style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
              <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>No requests found</div>
              <div style={{ fontSize: '14px' }}>Try adjusting your filters or search terms</div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
        color: '#6b7280',
        width: '100%',
        margin: '0'
      }}>
        <div>© 2025 LibraryX</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Built by</span>
          <a 
            href="#" 
            style={{ 
              color: '#6366f1', 
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Vansh Agrawal
          </a>
          <Github 
            style={{
              width: '16px',
              height: '16px',
              color: '#6b7280'
            }}
          />
        </div>
      </footer>
    </div>
  );
}