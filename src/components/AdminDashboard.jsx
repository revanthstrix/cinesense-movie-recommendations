import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import { AuthContext } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../config';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('username');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [mailSending, setMailSending] = useState(false);

  // ✅ new states
  const [showDownloads, setShowDownloads] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState([]);

  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      alert('Access denied');
      navigate('/home');
      return;
    }
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersWithRole = res.data.filter((u) => u.role);
        setUsers(usersWithRole);
      } catch (err) {
        alert('Failed to fetch users');
      }
    };
    fetchUsers();
  }, [user, token, navigate]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const filteredUsers = users
    .filter((u) => {
      const name = u?.username?.toLowerCase() || '';
      const email = u?.email?.toLowerCase() || '';
      const role = u?.role || '';
      return (
        (name.includes(searchTerm.toLowerCase()) ||
          email.includes(searchTerm.toLowerCase())) &&
        (roleFilter ? role === roleFilter : true)
      );
    })
    .sort((a, b) => {
      const valA = a?.[sortField]?.toLowerCase?.() || '';
      const valB = b?.[sortField]?.toLowerCase?.() || '';
      return valA.localeCompare(valB);
    });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const allChecked =
    paginatedUsers.length > 0 &&
    paginatedUsers.every((u) => selectedUserIds.includes(u._id));
  const someChecked =
    paginatedUsers.some((u) => selectedUserIds.includes(u._id)) && !allChecked;

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUserIds((prev) => [
        ...prev,
        ...paginatedUsers
          .filter((u) => !prev.includes(u._id))
          .map((u) => u._id)
      ]);
    } else {
      setSelectedUserIds((prev) =>
        prev.filter((id) => !paginatedUsers.map((u) => u._id).includes(id))
      );
    }
  };

  // New: Send mail with prompts & backend call
  const handleSendMail = async (userIds) => {
    if (mailSending || userIds.length === 0) return;
    if (!window.confirm(`Send predefined email to ${userIds.length} users?`)) return;
  
    setMailSending(true);
  
    try {
      const res = await axios.post(
        `${BACKEND_URL}/admin/send-mail`,
        { userIds }, // ONLY userIds, no subject/message
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Success! ${res.data.count} emails sent.`);
      setSelectedUserIds([]);
    } catch (err) {
      alert(
        err.response?.data?.message
          ? `Failed: ${err.response.data.message}`
          : "Mail sending failed!"
      );
    }
    setMailSending(false);
  };

  const exportToCSV = () => {
    const csv = [
      ['Name', 'Email', 'Role'],
      ...filteredUsers.map((u) => [u.username, u.email, u.role])
    ].map((row) => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
  };

  // ✅ toggle download files
  const handleToggleDownloads = async () => {
    if (!showDownloads) {
      try {
        const res = await axios.get(`${BACKEND_URL}/admin/download-links`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDownloadLinks(res.data);
      } catch {
        alert("Failed to fetch download links");
      }
    }
    setShowDownloads(!showDownloads);
  };

  return (
    <div className="admin-dashboard">
      {/* Top controls row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div className="controls">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select value={sortField} onChange={(e) => setSortField(e.target.value)}>
            <option value="username">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="role">Sort by Role</option>
          </select>
          <button onClick={exportToCSV} className="export-btn">
            Export CSV
          </button>
          <button onClick={handleToggleDownloads} className="download-btn">
            {showDownloads ? "Hide Download Files" : "Download Files"}
          </button>
        </div>
        <div>
          <button
            className="send-mail-btn"
            style={{ float: 'right' }}
            disabled={selectedUserIds.length === 0 || mailSending}
            onClick={() => handleSendMail(selectedUserIds)}
            title={selectedUserIds.length === 0 ? 'Select users first' : ''}
          >
            {mailSending ? "Sending..." : "Send Mail"}
          </button>
        </div>
      </div>

      {/* Table and paging */}
      <div className="users-section">
        <h3>Registered Users with Roles ({filteredUsers.length})</h3>
        {filteredUsers.length === 0 ? (
          <p>No matching users found.</p>
        ) : (
          <>
            <table className="user-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={el => {
                        if (el) el.indeterminate = someChecked;
                      }}
                      onChange={e => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(u._id)}
                        onChange={() => {
                          setSelectedUserIds((prev) =>
                            prev.includes(u._id)
                              ? prev.filter((id) => id !== u._id)
                              : [...prev, u._id]
                          );
                        }}
                      />
                    </td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                ⬅ Prev
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next ➡
              </button>
            </div>
            <button onClick={() => navigate('/home')}>
              Go to HomePage
            </button>
          </>
        )}
      </div>

      {/* ✅ Conditionally render downloads */}
      {showDownloads && (
        <div className="downloads-section">
          <h3>Download Files ({downloadLinks.length})</h3>
          {downloadLinks.length === 0 ? (
            <p>No download links available.</p>
          ) : (
            <table className="downloads-table">
              <thead>
                <tr>
                  <th>Movie ID</th>
                  <th>Title</th>
                  <th>Links</th>
                </tr>
              </thead>
              <tbody>
                {downloadLinks.map((dl) => (
                  <tr key={dl._id}>
                    <td>{dl.movieId}</td>
                    <td>{dl.title}</td>
                    <td>
                      {Object.entries(dl.downloadLinks).map(([quality, url]) => (
                        <div key={quality}>
                          <strong>{quality}:</strong>{" "}
                          <a href={url} target="_blank" rel="noreferrer">{url}</a>
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
