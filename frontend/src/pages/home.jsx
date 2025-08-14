import React, { useState } from 'react';
import { Search, User, Github } from 'lucide-react';

export default function LibraryRequestPage() {
  const [formData, setFormData] = useState({
    // Requester Details
    email: '',
    rollEmployeeNo: '',
    requesterName: '',
    patronCategory: '',
    department: '',

    // Document Details
    documentTitle: '',
    authors: '',
    publicationName: '',
    publicationYear: '',
    volumeNo: '',
    issueNo: '',
    pageRange: '',
    sourceUrl: '',
    publisher: ''
  });
  const [status, setStatus] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // Check required fields
    const requiredFields = ['email', 'rollEmployeeNo', 'requesterName', 'patronCategory', 'sourceUrl', 'documentTitle', 'publicationName', 'publicationYear', 'volumeNo', 'issueNo', 'publisher', 'authors', 'department'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      setStatus('Please fill all compulsory fields (marked with *)');
      setTimeout(() => setStatus(''), 3000);
      return;
    }

    console.log('Request submitted:', formData);
    setStatus('Request submitted successfully!');
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column'

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
            backgroundColor: '#1B53A0',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>L</span>
          </div>
          <span style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>LibraryX</span>
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
              placeholder="Search"
              style={{
                paddingLeft: '40px',
                paddingRight: '16px',
                paddingTop: '8px',
                paddingBottom: '8px',
                borderRadius: '20px',
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
                fontSize: '14px',
                width: '200px',
                outline: 'none'
              }}
            />
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#" style={{ textDecoration: 'none', color: '#6b7280', fontSize: '14px' }}>Home</a>
            <a href="#" style={{ textDecoration: 'none', color: '#6b7280', fontSize: '14px' }}>Bookmarks</a>
            <a href="#" style={{ textDecoration: 'none', color: '#6b7280', fontSize: '14px' }}>New Request</a>
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

      {/* Main Content - Full Width Background */}
      <main style={{
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: '48px 0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '0 24px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            padding: '32px',
            width: '100%',
            maxWidth: '700px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 16px 0'
              }}>
                Document Request Submission
              </h1>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Requester Details Section */}
              <div>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '16px',
                  borderBottom: '2px solid #1B53A0',
                  paddingBottom: '8px'
                }}>
                  Requester Details
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Email ID */}
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email ID *"
                      value={formData.email}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        backgroundColor: '#ffffff',
                        color: '#1f2937',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>

                  {/* Roll No./Employee No. and Name */}
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <input
                      type="text"
                      name="rollEmployeeNo"
                      placeholder="Roll No. / Employee No. *"
                      value={formData.rollEmployeeNo}
                      onChange={handleInputChange}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        backgroundColor: '#ffffff',
                        color: '#1f2937',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                    <input
                      type="text"
                      name="requesterName"
                      placeholder="Name of Requester *"
                      value={formData.requesterName}
                      onChange={handleInputChange}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        backgroundColor: '#ffffff',
                        color: '#1f2937',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>

                  {/* Patron Category and Department */}
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <select
                      name="patronCategory"
                      value={formData.patronCategory}
                      onChange={handleInputChange}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        backgroundColor: '#ffffff',
                        color: formData.patronCategory ? '#1f2937' : '#9ca3af',
                        outline: 'none',
                        appearance: 'none',
                        boxSizing: 'border-box'
                      }}
                      required
                    >
                      <option value="">Patron Category *</option>
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="staff">Staff</option>
                      <option value="researcher">Researcher</option>
                      <option value="visiting_scholar">Visiting Scholar</option>
                    </select>
                    <input
                      type="text"
                      name="department"
                      placeholder="Department/School/Center/IDRP *"
                      value={formData.department}
                      onChange={handleInputChange}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        backgroundColor: '#ffffff',
                        color: '#1f2937',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Document Details Section */}
              <div>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '16px',
                  borderBottom: '2px solid #1B53A0',
                  paddingBottom: '8px'
                }}>
                  Details of the Required Document
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Title of Document */}
                  <div>
                    <input
                      type="text"
                      name="documentTitle"
                      placeholder="Title of the Document *"
                      value={formData.documentTitle}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        backgroundColor: '#ffffff',
                        color: '#1f2937',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Authors */}
                  <div>
                    <input
                      type="text"
                      name="authors"
                      placeholder="Author(s) *"
                      value={formData.authors}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        backgroundColor: '#ffffff',
                        color: '#1f2937',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Name of Publication and Year */}
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <input
                      type="text"
                      name="publicationName"
                      placeholder="Name of Publication *"
                      value={formData.publicationName}
                      onChange={handleInputChange}
                      style={{
                        flex: 2,
                        padding: '12px 16px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        backgroundColor: '#ffffff',
                        color: '#1f2937',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <input
                      type="number"
                      name="publicationYear"
                      placeholder="Year *"
                      value={formData.publicationYear}
                      onChange={handleInputChange}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        backgroundColor: '#ffffff',
                        color: '#1f2937',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Volume, Issue, Page Range */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '16px',
                      flexWrap: 'wrap', // allows wrapping when space is small
                    }}
                  >
                    <input
                      type="text"
                      name="volumeNo"
                      placeholder="Volume No. *"
                      value={formData.volumeNo}
                      onChange={handleInputChange}
                      style={{
                        flex: '1 1 0', // allows shrink & grow
                        minWidth: '0', // prevents overflow
                        padding: '12px 16px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        backgroundColor: '#ffffff',
                        color: '#1f2937',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    <input
                      type="text"
                      name="issueNo"
                      placeholder="Issue No. *"
                      value={formData.issueNo}
                      onChange={handleInputChange}
                      style={{
                        flex: '1 1 0',
                        minWidth: '0',
                        padding: '12px 16px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        backgroundColor: '#ffffff',
                        color: '#1f2937',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    <input
                      type="text"
                      name="pageRange"
                      placeholder="Page Range"
                      value={formData.pageRange}
                      onChange={handleInputChange}
                      style={{
                        flex: '1 1 0',
                        minWidth: '0',
                        padding: '12px 16px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        backgroundColor: '#ffffff',
                        color: '#1f2937',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Source URL/DOI */}
                  <div>
                    <input
                      type="url"
                      name="sourceUrl"
                      placeholder="Source URL/DOI *"
                      value={formData.sourceUrl}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        backgroundColor: '#ffffff',
                        color: '#1f2937',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>

                  {/* Publisher */}
                  <div>
                    <input
                      type="text"
                      name="publisher"
                      placeholder="Publisher *"
                      value={formData.publisher}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        backgroundColor: '#ffffff',
                        color: '#1f2937',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={handleSubmit}
                  style={{
                    backgroundColor: '#1B53A0',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#4f46e5'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#1B53A0'}
                >
                  Submit Request
                </button>
                <span style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  Fields marked with * are compulsory
                </span>
              </div>

              {/* Status Message */}
              {status && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: status.includes('successfully') ? '#dcfce7' : '#fef2f2',
                  border: status.includes('successfully') ? '1px solid #bbf7d0' : '1px solid #fecaca',
                  borderRadius: '6px',
                  color: status.includes('successfully') ? '#166534' : '#dc2626',
                  fontSize: '14px'
                }}>
                  {status}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Full Width */}
      <footer style={{
        backgroundColor: '#ffffff',
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
              color: '#1B53A0',
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