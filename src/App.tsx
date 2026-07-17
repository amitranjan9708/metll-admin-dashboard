import React, { useEffect, useState, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Heart, 
  CreditCard,
  Ticket,
  LogOut,
  Activity,
  Mail,
  UserPlus,
  Briefcase,
  MessageCircle,
  Bell,
  Send,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Zap
} from 'lucide-react';
import { api, AdminService } from './services/api';
import './App.css';

const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

// Login Component
const Login = ({ onLogin }: { onLogin: (token: string) => void }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      setError('');
      await api.post('/auth/send-otp', { email });
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/verify-otp', { email, otp });
      const token = res.data?.data?.token;
      if (token) {
        const payload = parseJwt(token);
        if (payload && (payload.isAdmin || payload.isAmbassador)) {
          onLogin(token);
        } else {
          setError('Access Denied: You must be an Admin or Campus Ambassador.');
        }
      } else {
        setError('No token received in response');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-sidebar)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Admin Login</h2>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
        
        {step === 1 ? (
          <>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '14px' }}>
              Enter your admin email to receive an OTP.
            </p>
            <input 
              type="email" 
              placeholder="Admin Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}
            />
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleSendOtp}
              disabled={loading || !email}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '14px' }}>
              Enter the OTP sent to {email}
            </p>
            <input 
              type="text" 
              placeholder="Enter OTP" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}
            />
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleVerifyOtp}
              disabled={loading || !otp}
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button 
              style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              onClick={() => setStep(1)}
            >
              Back to Email
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Layout Component
const Sidebar = ({ onLogout, isAmbassadorOnly }: { onLogout: () => void, isAmbassadorOnly: boolean }) => {
  const allMenuItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { path: '/users', icon: <Users size={20} />, label: 'Users' },
    { path: '/matching', icon: <Heart size={20} />, label: 'Matching & Likes' },
    { path: '/chats', icon: <MessageSquare size={20} />, label: 'Chats' },
    { path: '/subscriptions', icon: <CreditCard size={20} />, label: 'Subscriptions' },
    { path: '/bulk-email', icon: <Mail size={20} />, label: 'Bulk Email' },
    { path: '/tickets', icon: <Ticket size={20} />, label: 'Support Tickets' },
    { path: '/create-profile', icon: <UserPlus size={20} />, label: 'Create Profile' },
    { path: '/feedback', icon: <MessageCircle size={20} />, label: 'User Feedback' },
    { path: '/jobs', icon: <Briefcase size={20} />, label: 'Careers (Jobs)' },
    { path: '/push-notifications', icon: <Bell size={20} />, label: 'Push Notifications' },
    { path: '/ambassadors', icon: <Users size={20} />, label: 'Ambassadors' },
  ];

  const menuItems = isAmbassadorOnly
    ? [{ path: '/', icon: <Users size={20} />, label: 'My Referrals' }]
    : allMenuItems;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="avatar" style={{ backgroundColor: '#fff', color: '#1F1F1F' }}>M</div>
        <span className="brand-text">Metll Admin</span>
      </div>
      <nav className="nav-links">
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', padding: '0 1rem' }}>
        <button className="nav-item" onClick={onLogout} style={{ width: '100%', border: 'none', background: 'transparent' }}>
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

const Topnav = ({ isAmbassadorOnly }: { isAmbassadorOnly: boolean }) => {
  const location = useLocation();
  const getPageTitle = () => {
    if (isAmbassadorOnly) return 'Campus Ambassador Dashboard';
    switch(location.pathname) {
      case '/': return 'Dashboard Overview';
      case '/users': return 'User Management';
      case '/matching': return 'Matching & Likes';
      case '/chats': return 'Chat Monitoring';
      case '/subscriptions': return 'Subscriptions & Payments';
      case '/bulk-email': return 'Bulk Email';
      case '/tickets': return 'Support Tickets';
      case '/create-profile': return 'Create AI Profile';
      case '/feedback': return 'User Feedback';
      case '/jobs': return 'Careers (Jobs)';
      case '/push-notifications': return 'Push Notifications';
      case '/ambassadors': return 'Campus Ambassadors';
      default: return 'Admin Dashboard';
    }
  };

  return (
    <header className="topnav">
      <h1 className="page-title">{getPageTitle()}</h1>
      <div className="user-profile">
        <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Admin User</span>
        <div className="avatar">A</div>
      </div>
    </header>
  );
};

// Placeholder Pages
const Overview = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminService.getDashboardStats()
      .then(setStats)
      .catch(err => {
        console.error(err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          alert("Authentication Failed: " + (err.response?.data?.message || "Invalid or non-admin token"));
          localStorage.removeItem('admin_token');
          window.location.reload();
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="dashboard-grid">
        <div className="card stat-card">
          <span className="stat-title">Total Users</span>
          <span className="stat-value">{loading ? '...' : stats?.totalUsers || 0}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-title">Active Today</span>
          <span className="stat-value">{loading ? '...' : stats?.activeToday || 0}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-title">Total Matches</span>
          <span className="stat-value">{loading ? '...' : stats?.totalMatches || 0}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-title">Open Tickets</span>
          <span className="stat-value">{loading ? '...' : stats?.openTickets || 0}</span>
        </div>
      </div>
      
      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} color="var(--accent)" />
          System Status
        </h3>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>All systems operational.</p>
      </div>
    </div>
  );
};

const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    AdminService.getUsers().then(res => setUsers(res.users)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdate = async (userId: number, field: string, value: any) => {
    try {
      const data = { [field]: value };
      const res = await AdminService.updateUser(userId, data);
      if (res.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, ...data } : u));
      }
    } catch (error) {
      console.error('Failed to update user', error);
      alert('Failed to update user');
    }
  };

  return (
    <div className="card">
      <h2>Users Management</h2>
      <div className="table-container" style={{ marginTop: '1.5rem', overflow: 'visible' }}>
        {loading ? <p>Loading users...</p> : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email / Phone</th>
                <th>Onboarded</th>
                <th>Status</th>
                <th>Ver. Status</th>
                <th>Admin</th>
                <th>Ambassador</th>
                <th>Referrals</th>
                <th>Joined</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td><span style={{color: 'var(--text-secondary)', fontSize: '12px'}}>#{user.id}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt="" style={{width: 24, height: 24, borderRadius: '50%', objectFit: 'cover'}} />
                      ) : (
                        <div style={{width: 24, height: 24, borderRadius: '50%', background: 'var(--border-color)'}} />
                      )}
                      {user.name || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '14px' }}>{user.email}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user.phoneNumber}</div>
                  </td>
                  <td>
                    <select 
                      value={user.isOnboarded ? 'true' : 'false'}
                      onChange={(e) => handleUpdate(user.id, 'isOnboarded', e.target.value === 'true')}
                      style={{ padding: '0.25rem', borderRadius: '4px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                    >
                      <option value="true">✅ Yes</option>
                      <option value="false">❌ No</option>
                    </select>
                  </td>
                  <td>
                    <select 
                      value={user.isVerified ? 'true' : 'false'}
                      onChange={(e) => handleUpdate(user.id, 'isVerified', e.target.value === 'true')}
                      style={{ padding: '0.25rem', borderRadius: '4px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                    >
                      <option value="true">Verified</option>
                      <option value="false">Pending</option>
                    </select>
                  </td>
                  <td>
                    <select 
                      value={user.verificationStatus || 'pending'}
                      onChange={(e) => handleUpdate(user.id, 'verificationStatus', e.target.value)}
                      style={{ padding: '0.25rem', borderRadius: '4px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                    >
                      <option value="pending">pending</option>
                      <option value="photo_uploaded">photo_uploaded</option>
                      <option value="verified">verified</option>
                      <option value="failed">failed</option>
                    </select>
                  </td>
                  <td>
                    <select 
                      value={user.isAdmin ? 'true' : 'false'}
                      onChange={(e) => handleUpdate(user.id, 'isAdmin', e.target.value === 'true')}
                      style={{ padding: '0.25rem', borderRadius: '4px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </td>
                  <td>
                    <select 
                      value={user.isAmbassador ? 'true' : 'false'}
                      onChange={(e) => AdminService.toggleAmbassador(user.id, e.target.value === 'true').then(() => fetchUsers())}
                      style={{ padding: '0.25rem', borderRadius: '4px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </td>
                  <td>
                    <span className="badge badge-success" style={{background: 'var(--bg-sidebar)'}}>{user.totalReferrals || 0}</span>
                  </td>
                  <td style={{fontSize: '13px'}}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td style={{fontSize: '13px'}}>{new Date(user.lastActiveAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const AmbassadorsPage = ({ isAmbassadorOnly }: { isAmbassadorOnly?: boolean }) => {
  const [ambassadors, setAmbassadors] = useState<any[]>([]);
  const [myReferralData, setMyReferralData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAmbassadors = () => {
    if (isAmbassadorOnly) {
      AdminService.getMyReferrals().then(res => setMyReferralData(res.data)).finally(() => setLoading(false));
    } else {
      AdminService.getAmbassadors().then(res => setAmbassadors(res.data)).finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchAmbassadors();
  }, []);

  const handleRevoke = async (userId: number) => {
    if (confirm('Are you sure you want to revoke ambassador status for this user?')) {
      await AdminService.toggleAmbassador(userId, false);
      fetchAmbassadors();
    }
  };

  if (isAmbassadorOnly) {
    return (
      <div className="card">
        <h2>My Referrals</h2>
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', marginTop: '1rem' }}>
          <div style={{ background: 'var(--bg-sidebar)', padding: '1rem', borderRadius: '8px', minWidth: '150px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Referrals</div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--accent)' }}>{myReferralData?.totalReferrals || 0}</div>
          </div>
          <div style={{ background: 'var(--bg-sidebar)', padding: '1rem', borderRadius: '8px', minWidth: '150px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>My Referral Code</div>
            <div style={{ fontSize: '18px', fontWeight: 600, marginTop: '4px' }}>{myReferralData?.referralCode || 'N/A'}</div>
          </div>
        </div>
        <div className="table-container">
          {loading ? <p>Loading your referrals...</p> : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Date Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myReferralData?.referrals?.map((ref: any) => (
                  <tr key={ref.id}>
                    <td>{ref.name}</td>
                    <td>{ref.email}</td>
                    <td>{new Date(ref.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${ref.status === 'Verified' ? 'badge-success' : 'badge-warning'}`}>
                        {ref.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!myReferralData?.referrals || myReferralData.referrals.length === 0) && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>You haven't referred anyone yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Campus Ambassadors</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Manage users who have the Campus Ambassador role. These users have standard referral codes but do not earn coffee dates.
      </p>
      <div className="table-container" style={{ marginTop: '1.5rem' }}>
        {loading ? <p>Loading ambassadors...</p> : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email / Phone</th>
                <th>Referral Code</th>
                <th>Total Referrals</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ambassadors.map(user => (
                <tr key={user.id}>
                  <td><span style={{color: 'var(--text-secondary)', fontSize: '12px'}}>#{user.id}</span></td>
                  <td>{user.name || 'N/A'}</td>
                  <td>
                    <div style={{ fontSize: '14px' }}>{user.email}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user.phoneNumber}</div>
                  </td>
                  <td>
                    <span className="badge" style={{background: 'var(--accent)', color: 'white'}}>{user.referralCode}</span>
                  </td>
                  <td>
                    <span className="badge badge-success" style={{background: 'var(--bg-sidebar)'}}>{user.totalReferrals || 0}</span>
                  </td>
                  <td style={{fontSize: '13px'}}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      onClick={() => handleRevoke(user.id)}
                      style={{ padding: '0.25rem 0.5rem', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
              {ambassadors.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>No ambassadors found. Promote a user from the Users tab.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const MatchingPage = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminService.getMatches().then(res => setMatches(res.matches)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="card">
      <h2>Recent Matches</h2>
      <div className="table-container" style={{ marginTop: '1.5rem' }}>
        {loading ? <p>Loading matches...</p> : (
          <table>
            <thead>
              <tr>
                <th>Match ID</th>
                <th>User 1</th>
                <th>User 2</th>
                <th>Matched At</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {matches.map(match => (
                <tr key={match.id}>
                  <td>#{match.id}</td>
                  <td>{match.user1?.name || `User ${match.user1Id}`}</td>
                  <td>{match.user2?.name || `User ${match.user2Id}`}</td>
                  <td>{new Date(match.matchedAt).toLocaleString()}</td>
                  <td>{match.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const ChatsPage = () => <div className="card"><h2>Chat Monitoring</h2><p>Chat logs and reports will appear here...</p></div>;
const SubscriptionsPage = () => <div className="card"><h2>Subscriptions & Payments</h2><p>Revenue and payment tracking will appear here...</p></div>;

const TicketsPage = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminService.getTickets().then(res => setTickets(res.tickets)).finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (ticketId: number, status: string) => {
    try {
      const res = await AdminService.updateTicket(ticketId, { status });
      if (res.success) {
        setTickets(tickets.map(t => t.id === ticketId ? { ...t, status } : t));
      }
    } catch (error) {
      console.error('Failed to update ticket', error);
      alert('Failed to update ticket status');
    }
  };

  return (
    <div className="card">
      <h2>Support Tickets</h2>
      <div className="table-container" style={{ marginTop: '1.5rem', overflow: 'visible' }}>
        {loading ? <p>Loading tickets...</p> : (
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>User</th>
                <th>Category</th>
                <th>Subject</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.id}>
                  <td>{ticket.ticketNumber}</td>
                  <td>{ticket.user?.name || `User ${ticket.userId}`}</td>
                  <td>{ticket.category}</td>
                  <td>{ticket.subject}</td>
                  <td>
                    <select 
                      value={ticket.status}
                      onChange={(e) => handleUpdate(ticket.id, e.target.value)}
                      style={{ padding: '0.25rem', borderRadius: '4px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                    >
                      <option value="open">open</option>
                      <option value="in_progress">in_progress</option>
                      <option value="resolved">resolved</option>
                      <option value="closed">closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const BulkEmailPage = () => {
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !subject || !html) {
      alert('Please fill out all fields and select a file.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('html', html);
      formData.append('file', file);

      const res = await AdminService.bulkSendEmail(formData);
      setResult(res);
      if (res.success) {
        alert(res.message);
        // Clear form on success
        setSubject('');
        setHtml('');
        setFile(null);
      }
    } catch (error: any) {
      console.error('Error sending bulk emails:', error);
      alert(error.response?.data?.message || 'Failed to send bulk emails.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Bulk Email Sender</h1>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="subject" style={{ fontWeight: '600' }}>Email Subject</label>
            <input 
              id="subject"
              type="text" 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              placeholder="e.g. Special Offer from Metll!"
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #333', background: '#111', color: '#fff' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="html" style={{ fontWeight: '600' }}>HTML Body</label>
            <textarea 
              id="html"
              value={html} 
              onChange={e => setHtml(e.target.value)} 
              placeholder="<h1>Hello!</h1><p>Welcome to Metll.</p>"
              rows={8}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #333', background: '#111', color: '#fff', fontFamily: 'monospace' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="file" style={{ fontWeight: '600' }}>Upload CSV/TXT File (emails list)</label>
            <input 
              id="file"
              type="file" 
              accept=".csv,.txt"
              onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
              style={{ color: '#fff' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: '12px',
              background: loading ? '#333' : '#FF6B6B',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              marginTop: '10px'
            }}
          >
            {loading ? 'Sending Batch...' : 'Send Bulk Emails'}
          </button>
          
          {result && result.success && (
            <div style={{ marginTop: '16px', padding: '16px', background: '#1a4025', color: '#8de8a4', borderRadius: '6px' }}>
              <p><strong>Success!</strong> {result.message}</p>
              <p>Total Emails Found: {result.totalFound}</p>
              <p>Emails successfully sent to Resend: {result.sentCount}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const SITUATIONS = [
    { id: 1, category: 'Dating', emoji: '💕', question: "Your date is 30 minutes late without texting. What do you do?" },
    { id: 2, category: 'Dating', emoji: '🌹', question: "You realize your date is your best friend's ex. What's your move?" },
    { id: 3, category: 'Dating', emoji: '💭', question: "Your crush posts about being single, but they've been ignoring your messages. What do you do?" },
    { id: 4, category: 'Dating', emoji: '🎭', question: "On the first date, they spend 20 minutes on their phone. How do you handle it?" },
    { id: 5, category: 'Dating', emoji: '🎪', question: "You accidentally like your crush's photo from 2 years ago. What's your next move?" },
    { id: 6, category: 'Social', emoji: '🎉', question: "You're at a party where you don't know anyone except the host who's busy. What do you do?" },
    { id: 7, category: 'Social', emoji: '🤝', question: "Your friend's partner hits on you when they're not around. How do you handle it?" },
    { id: 8, category: 'Social', emoji: '😬', question: "You witness someone being rude to a waiter. What's your reaction?" },
    { id: 9, category: 'Social', emoji: '🎤', question: "At karaoke, everyone's pressuring you to sing but you're shy. What do you do?" },
    { id: 10, category: 'Social', emoji: '🍕', question: "Your friends order pineapple pizza and you hate it. Do you speak up or eat it?" },
    { id: 11, category: 'Adventure', emoji: '✈️', question: "You have $500 and 3 days off. Beach getaway or mountain trek?" }
];

const CreateProfilePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    bio: '',
    height: '',
    currentCity: '',
    drinking: 'prefer_not_say',
    smoking: 'prefer_not_say',
    children: 'open',
    relationshipType: 'open_to_all',
    datingIntention: 'open_to_all',
    genderPreference: 'all',
    ageMin: '18',
    ageMax: '35',
    distanceMax: '50'
  });
  const [files, setFiles] = useState<File[]>([]);
  const [personalityResponses, setPersonalityResponses] = useState<{questionId: number, answer: string}[]>([{ questionId: 1, answer: '' }]);
  const [loading, setLoading] = useState(false);
  
  const handleAddQuestion = () => {
    setPersonalityResponses([...personalityResponses, { questionId: 1, answer: '' }]);
  };

  const handleQuestionChange = (index: number, field: string, value: string | number) => {
    const newResponses = [...personalityResponses];
    if (field === 'questionId') {
      newResponses[index].questionId = Number(value);
    } else {
      newResponses[index].answer = String(value);
    }
    setPersonalityResponses(newResponses);
  };

  const handleRemoveQuestion = (index: number) => {
    const newResponses = [...personalityResponses];
    newResponses.splice(index, 1);
    setPersonalityResponses(newResponses);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files).slice(0, 6)); // Max 6 files
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.gender || files.length === 0) {
      alert("Name, age, gender, and at least one image are required.");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('age', formData.age);
      data.append('gender', formData.gender);
      data.append('bio', formData.bio);
      if (formData.height) data.append('height', formData.height);
      if (formData.currentCity) data.append('currentCity', formData.currentCity);
      if (formData.drinking) data.append('drinking', formData.drinking);
      if (formData.smoking) data.append('smoking', formData.smoking);
      if (formData.children) data.append('children', formData.children);
      if (formData.relationshipType) data.append('relationshipType', formData.relationshipType);
      if (formData.datingIntention) data.append('datingIntention', formData.datingIntention);
      if (formData.genderPreference) data.append('genderPreference', formData.genderPreference);
      if (formData.ageMin) data.append('ageMin', formData.ageMin);
      if (formData.ageMax) data.append('ageMax', formData.ageMax);
      if (formData.distanceMax) data.append('distanceMax', formData.distanceMax);
      data.append('personalityResponses', JSON.stringify(personalityResponses.filter(p => p.answer.trim() !== '')));
      
      files.forEach(file => {
        data.append('images', file);
      });

      const res = await AdminService.createProfile(data);
      if (res.success) {
        alert("Profile created successfully!");
        setFormData({ 
          name: '', age: '', gender: 'male', bio: '', 
          height: '', currentCity: '', drinking: 'prefer_not_say', smoking: 'prefer_not_say',
          children: 'open', relationshipType: 'open_to_all', datingIntention: 'open_to_all',
          genderPreference: 'all', ageMin: '18', ageMax: '35', distanceMax: '50'
        });
        setFiles([]);
        setPersonalityResponses([{ questionId: 1, answer: '' }]);
      }
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Create New Profile</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>This profile will be verified and added to the discover section automatically.</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 500 }}>Name *</label>
          <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-sidebar)', color: '#fff' }} required />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <label style={{ fontWeight: 500 }}>Age *</label>
            <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-sidebar)', color: '#fff' }} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <label style={{ fontWeight: 500 }}>Gender *</label>
            <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-sidebar)', color: '#fff' }}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <label style={{ fontWeight: 500 }}>Height (cm)</label>
            <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-sidebar)', color: '#fff' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <label style={{ fontWeight: 500 }}>Current City</label>
            <input type="text" value={formData.currentCity} onChange={e => setFormData({...formData, currentCity: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-sidebar)', color: '#fff' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <label style={{ fontWeight: 500 }}>Drinking</label>
            <select value={formData.drinking} onChange={e => setFormData({...formData, drinking: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-sidebar)', color: '#fff' }}>
              <option value="prefer_not_say">Prefer not to say</option>
              <option value="never">Never</option>
              <option value="socially">Socially</option>
              <option value="regularly">Regularly</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <label style={{ fontWeight: 500 }}>Smoking</label>
            <select value={formData.smoking} onChange={e => setFormData({...formData, smoking: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-sidebar)', color: '#fff' }}>
              <option value="prefer_not_say">Prefer not to say</option>
              <option value="never">Never</option>
              <option value="sometimes">Sometimes</option>
              <option value="regularly">Regularly</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <label style={{ fontWeight: 500 }}>Children</label>
            <select value={formData.children} onChange={e => setFormData({...formData, children: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-sidebar)', color: '#fff' }}>
              <option value="open">Open to it</option>
              <option value="have">Have kids</option>
              <option value="want">Want kids</option>
              <option value="dont_want">Don't want</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <label style={{ fontWeight: 500 }}>Relationship Type</label>
            <select value={formData.relationshipType} onChange={e => setFormData({...formData, relationshipType: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-sidebar)', color: '#fff' }}>
              <option value="open_to_all">Open to all</option>
              <option value="monogamy">Monogamy</option>
              <option value="non_monogamy">Non-monogamy</option>
              <option value="friends_first">Friends first</option>
              <option value="figuring_out">Figuring out</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <label style={{ fontWeight: 500 }}>Dating Intention</label>
            <select value={formData.datingIntention} onChange={e => setFormData({...formData, datingIntention: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-sidebar)', color: '#fff' }}>
              <option value="open_to_all">Open to all</option>
              <option value="casual">Casual</option>
              <option value="serious">Serious</option>
              <option value="marriage">Marriage</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <label style={{ fontWeight: 500 }}>Gender Pref.</label>
            <select value={formData.genderPreference} onChange={e => setFormData({...formData, genderPreference: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-sidebar)', color: '#fff' }}>
              <option value="all">Everyone</option>
              <option value="male">Men</option>
              <option value="female">Women</option>
              <option value="non-binary">Non-binary</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <label style={{ fontWeight: 500 }}>Age Min</label>
            <input type="number" value={formData.ageMin} onChange={e => setFormData({...formData, ageMin: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-sidebar)', color: '#fff' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <label style={{ fontWeight: 500 }}>Age Max</label>
            <input type="number" value={formData.ageMax} onChange={e => setFormData({...formData, ageMax: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-sidebar)', color: '#fff' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <label style={{ fontWeight: 500 }}>Distance (km)</label>
            <input type="number" value={formData.distanceMax} onChange={e => setFormData({...formData, distanceMax: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-sidebar)', color: '#fff' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 500 }}>Bio</label>
          <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} rows={3} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-sidebar)', color: '#fff' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 500 }}>Images (Max 6) *</label>
          <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ color: '#fff' }} />
          {files.length > 0 && <small style={{ color: 'var(--text-secondary)' }}>Selected {files.length} file(s)</small>}
        </div>

        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem' }}>Personality Questions</h3>
            <button type="button" onClick={handleAddQuestion} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>+ Add Question</button>
          </div>
          
          {personalityResponses.map((item, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', background: 'var(--bg-sidebar)', borderRadius: '8px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <select value={item.questionId} onChange={(e) => handleQuestionChange(index, 'questionId', e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', background: 'var(--bg-card)', color: '#fff', border: '1px solid var(--border-color)', flex: 1, marginRight: '1rem' }}>
                  {SITUATIONS.map(q => (
                    <option key={q.id} value={q.id}>{q.emoji} {q.question}</option>
                  ))}
                </select>
                <button type="button" onClick={() => handleRemoveQuestion(index)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>Remove</button>
              </div>
              <textarea placeholder="Answer..." value={item.answer} onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)} rows={2} style={{ padding: '0.5rem', borderRadius: '4px', background: 'var(--bg-card)', color: '#fff', border: '1px solid var(--border-color)' }} />
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem', padding: '1rem', justifyContent: 'center' }}>
          {loading ? 'Creating Profile...' : 'Create Profile'}
        </button>
      </form>
    </div>
  );
};

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await AdminService.getFeedbacks();
      if (res.success) {
        setFeedbacks(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch feedbacks', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Feedback Messages</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table" style={{ marginTop: '1rem' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Message</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((f: any) => (
              <tr key={f.id}>
                <td>#{f.id}</td>
                <td>{f.name}</td>
                <td>{f.email}</td>
                <td>{f.suggestion}</td>
                <td>{new Date(f.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {feedbacks.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center' }}>No feedback found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

const JobsPage = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', department: '', location: '', type: '', description: '' });

  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await AdminService.getJobs();
      if (res.success) {
        setJobs(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async () => {
    try {
      await AdminService.createJob(formData);
      setShowModal(false);
      fetchJobs();
      setFormData({ title: '', department: '', location: '', type: '', description: '' });
    } catch (err) {
      console.error('Failed to create job', err);
    }
  };

  const handleDeleteJob = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await AdminService.deleteJob(id);
      fetchJobs();
    } catch (err) {
      console.error('Failed to delete job', err);
    }
  };

  const handleViewApplications = async (job: any) => {
    setSelectedJob(job);
    setLoadingApps(true);
    try {
      const res = await AdminService.getJobApplications(job.id);
      if (res.success) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoadingApps(false);
    }
  };

  const closeApplicationsModal = () => {
    setSelectedJob(null);
    setApplications([]);
  };

  const exportToCSV = () => {
    if (applications.length === 0 || !selectedJob) return;

    const headers = ['Name', 'Email', 'Phone', 'Location', 'Qualification', 'Applied On', 'Resume Link'];
    const rows = applications.map(app => [
      `"${app.name.replace(/"/g, '""')}"`,
      `"${app.email}"`,
      `"${app.phone}"`,
      `"${app.location.replace(/"/g, '""')}"`,
      `"${app.qualification.replace(/"/g, '""')}"`,
      `"${new Date(app.createdAt).toLocaleDateString()}"`,
      `"${app.resumeUrl}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `applications-${selectedJob.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Careers (Jobs)</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Post Job</button>
      </div>

      {showModal && (
        <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1rem' }}>
          <h3>Create New Job Post</h3>
          <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="input-field" style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }} />
          <input type="text" placeholder="Department" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="input-field" style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }} />
          <input type="text" placeholder="Location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="input-field" style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }} />
          <input type="text" placeholder="Type (e.g., Full-time)" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="input-field" style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }} />
          <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="input-field" style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem', minHeight: '80px' }}></textarea>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={handleCreateJob}>Submit</button>
            <button className="btn btn-danger" onClick={() => setShowModal(false)} style={{ background: '#666' }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Department</th>
              <th>Location</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job: any) => (
              <tr key={job.id}>
                <td>{job.title}</td>
                <td>{job.department}</td>
                <td>{job.location}</td>
                <td>{job.type}</td>
                <td>{job.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" onClick={() => handleViewApplications(job)} style={{ padding: '4px 8px', fontSize: '12px' }}>Applications</button>
                    <button className="btn btn-danger" onClick={() => handleDeleteJob(job.id)} style={{ padding: '4px 8px', fontSize: '12px' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>No jobs found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {selectedJob && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Applications for {selectedJob.title}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {applications.length > 0 && (
                  <button onClick={exportToCSV} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                    Export CSV
                  </button>
                )}
                <button onClick={closeApplicationsModal} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}>&times;</button>
              </div>
            </div>
            
            {loadingApps ? (
              <p>Loading applications...</p>
            ) : applications.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No applications received yet for this position.</p>
            ) : (
              <table className="table" style={{ fontSize: '14px' }}>
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Contact</th>
                    <th>Location</th>
                    <th>Qualification</th>
                    <th>Applied On</th>
                    <th>Resume</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <React.Fragment key={app.id}>
                      <tr>
                        <td>
                          <strong>{app.name}</strong>
                        </td>
                        <td>
                          <div>{app.email}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{app.phone}</div>
                        </td>
                        <td>{app.location}</td>
                        <td>{app.qualification}</td>
                        <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                        <td>
                          <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '12px', textDecoration: 'none' }}>
                            View Resume
                          </a>
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                        <td colSpan={6} style={{ padding: '12px', borderBottom: '2px solid var(--border-color)' }}>
                          <div style={{ marginBottom: '8px' }}>
                            <strong style={{ color: 'var(--text-secondary)' }}>Why Interested:</strong> 
                            <p style={{ marginTop: '4px', fontSize: '13px', whiteSpace: 'pre-wrap' }}>{app.interest}</p>
                          </div>
                          {app.experience && (
                            <div>
                              <strong style={{ color: 'var(--text-secondary)' }}>Previous Experience:</strong> 
                              <p style={{ marginTop: '4px', fontSize: '13px', whiteSpace: 'pre-wrap' }}>{app.experience}</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// Push Notifications Page
// ─────────────────────────────────────────────────────────
const PushNotificationsPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Form state
  const [form, setForm] = useState({
    title: '',
    body: '',
    imageUrl: '',
    deepLink: '',
    priority: 'high',
    targetType: 'all' as 'all' | 'specific' | 'filtered',
    specificIds: '',
  });
  const [filters, setFilters] = useState({
    gender: [] as string[],
    ageMin: '',
    ageMax: '',
    city: '',
    verifiedOnly: false,
    platforms: [] as string[],
    activeWithinDays: '',
    onboardedOnly: false,
  });

  // Custom data key-value pairs
  const [customData, setCustomData] = useState<{ key: string; value: string }[]>([]);

  // Live user count preview
  const [userCount, setUserCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sending state
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Detail view
  const [selectedBroadcast, setSelectedBroadcast] = useState<any>(null);

  // Load stats + history
  useEffect(() => {
    AdminService.getBroadcastStats()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoadingStats(false));

    AdminService.getBroadcasts()
      .then(res => setBroadcasts(res.data?.broadcasts || []))
      .catch(console.error)
      .finally(() => setLoadingHistory(false));
  }, []);

  // Debounced user count fetch
  const fetchUserCount = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setCountLoading(true);
      try {
        const parsedFilters: Record<string, any> = {};
        if (form.targetType === 'filtered') {
          if (filters.gender.length > 0) parsedFilters.gender = filters.gender;
          if (filters.ageMin) parsedFilters.ageMin = parseInt(filters.ageMin);
          if (filters.ageMax) parsedFilters.ageMax = parseInt(filters.ageMax);
          if (filters.city) parsedFilters.city = filters.city;
          if (filters.verifiedOnly) parsedFilters.verifiedOnly = true;
          if (filters.platforms.length > 0) parsedFilters.platforms = filters.platforms;
          if (filters.activeWithinDays) parsedFilters.activeWithinDays = parseInt(filters.activeWithinDays);
          if (filters.onboardedOnly) parsedFilters.onboardedOnly = true;
        }
        const specificIds =
          form.targetType === 'specific'
            ? form.specificIds.split(',').map(s => parseInt(s.trim())).filter(Boolean)
            : [];
        const res = await AdminService.getUserCount(
          form.targetType,
          specificIds.length > 0 ? specificIds : undefined,
          Object.keys(parsedFilters).length > 0 ? parsedFilters : undefined
        );
        setUserCount(res.data?.count ?? null);
      } catch {
        setUserCount(null);
      } finally {
        setCountLoading(false);
      }
    }, 600);
  }, [form, filters]);

  useEffect(() => { fetchUserCount(); }, [fetchUserCount]);

  const handleSend = async () => {
    setSending(true);
    setSendResult(null);
    setShowConfirm(false);
    try {
      const dataMap: Record<string, string> = {};
      customData.forEach(({ key, value }) => { if (key) dataMap[key] = value; });

      const parsedFilters: Record<string, any> = {};
      if (form.targetType === 'filtered') {
        if (filters.gender.length > 0) parsedFilters.gender = filters.gender;
        if (filters.ageMin) parsedFilters.ageMin = parseInt(filters.ageMin);
        if (filters.ageMax) parsedFilters.ageMax = parseInt(filters.ageMax);
        if (filters.city) parsedFilters.city = filters.city;
        if (filters.verifiedOnly) parsedFilters.verifiedOnly = true;
        if (filters.platforms.length > 0) parsedFilters.platforms = filters.platforms;
        if (filters.activeWithinDays) parsedFilters.activeWithinDays = parseInt(filters.activeWithinDays);
        if (filters.onboardedOnly) parsedFilters.onboardedOnly = true;
      }

      const specificIds =
        form.targetType === 'specific'
          ? form.specificIds.split(',').map(s => parseInt(s.trim())).filter(Boolean)
          : undefined;

      await AdminService.sendBroadcast({
        title: form.title,
        body: form.body,
        imageUrl: form.imageUrl || undefined,
        deepLink: form.deepLink || undefined,
        data: Object.keys(dataMap).length > 0 ? dataMap : undefined,
        priority: form.priority,
        targetType: form.targetType,
        targetUserIds: specificIds,
        filters: Object.keys(parsedFilters).length > 0 ? parsedFilters : undefined,
      });

      setSendResult({ success: true, message: `Broadcast queued! Sending to ~${userCount ?? '?'} users.` });

      // Reset form
      setForm({ title: '', body: '', imageUrl: '', deepLink: '', priority: 'high', targetType: 'all', specificIds: '' });
      setFilters({ gender: [], ageMin: '', ageMax: '', city: '', verifiedOnly: false, platforms: [], activeWithinDays: '', onboardedOnly: false });
      setCustomData([]);

      // Refresh history
      const hRes = await AdminService.getBroadcasts();
      setBroadcasts(hRes.data?.broadcasts || []);

      // Refresh stats
      const sRes = await AdminService.getBroadcastStats();
      setStats(sRes.data);
    } catch (err: any) {
      setSendResult({ success: false, message: err.response?.data?.message || 'Failed to send broadcast' });
    } finally {
      setSending(false);
    }
  };

  const toggleGender = (g: string) =>
    setFilters(f => ({ ...f, gender: f.gender.includes(g) ? f.gender.filter(x => x !== g) : [...f.gender, g] }));

  const togglePlatform = (p: string) =>
    setFilters(f => ({ ...f, platforms: f.platforms.includes(p) ? f.platforms.filter(x => x !== p) : [...f.platforms, p] }));

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px',
    border: '1px solid var(--border-color)', fontSize: '14px',
    background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: 600,
    color: 'var(--text-secondary)', marginBottom: '6px',
  };
  const chipStyle = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
    cursor: 'pointer', border: '1px solid',
    background: active ? 'var(--accent)' : 'transparent',
    color: active ? '#fff' : 'var(--text-secondary)',
    borderColor: active ? 'var(--accent)' : 'var(--border-color)',
    transition: 'all 0.15s',
  });

  const statusBadge = (status: string) => {
    const map: Record<string, { color: string; icon: React.ReactNode }> = {
      done: { color: 'var(--success)', icon: <CheckCircle size={12} /> },
      sending: { color: 'var(--warning)', icon: <Clock size={12} /> },
      pending: { color: 'var(--text-secondary)', icon: <Clock size={12} /> },
      failed: { color: 'var(--danger)', icon: <XCircle size={12} /> },
    };
    const s = map[status] || map.pending;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: s.color, fontWeight: 600, fontSize: '12px' }}>
        {s.icon} {status}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Broadcasts', value: loadingStats ? '...' : stats?.totalBroadcasts ?? 0, icon: <Bell size={18} color="var(--accent)" /> },
          { label: 'Notifications Sent Today', value: loadingStats ? '...' : stats?.notificationsSentToday ?? 0, icon: <Send size={18} color="var(--success)" /> },
          { label: 'Total Sent (All Time)', value: loadingStats ? '...' : stats?.totalNotificationsSent ?? 0, icon: <Zap size={18} color="var(--warning)" /> },
          { label: 'Active FCM Tokens', value: loadingStats ? '...' : stats?.activeFcmTokens ?? 0, icon: <Activity size={18} color="#9b59b6" /> },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--bg-color)' }}>{stat.icon}</div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 700 }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main 2-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* ── Compose Form ── */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
            <Bell size={18} color="var(--accent)" /> Compose Broadcast
          </h3>

          {sendResult && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px',
              background: sendResult.success ? 'rgba(46,186,117,0.1)' : 'rgba(255,75,75,0.1)',
              color: sendResult.success ? 'var(--success)' : 'var(--danger)',
              border: `1px solid ${sendResult.success ? 'var(--success)' : 'var(--danger)'}`,
            }}>
              {sendResult.message}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Title *</label>
              <input id="pn-title" style={inputStyle} placeholder="e.g. New Feature Announcement 🎉"
                value={form.title} maxLength={100}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '3px', textAlign: 'right' }}>{form.title.length}/100</div>
            </div>

            <div>
              <label style={labelStyle}>Body *</label>
              <textarea id="pn-body" style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }}
                placeholder="Write your message here..."
                value={form.body} maxLength={500}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '3px', textAlign: 'right' }}>{form.body.length}/500</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Image URL (optional)</label>
                <input id="pn-image" style={inputStyle} placeholder="https://..." value={form.imageUrl}
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Deep Link (optional)</label>
                <input id="pn-deeplink" style={inputStyle} placeholder="e.g. matches, home" value={form.deepLink}
                  onChange={e => setForm(f => ({ ...f, deepLink: e.target.value }))} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Priority</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['critical', 'high', 'medium', 'low'].map(p => (
                  <button key={p} style={chipStyle(form.priority === p)} onClick={() => setForm(f => ({ ...f, priority: p }))}>{p}</button>
                ))}
              </div>
            </div>

            {/* Target Selector */}
            <div>
              <label style={labelStyle}>Target Audience</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['all', 'specific', 'filtered'] as const).map(t => (
                  <button key={t} style={chipStyle(form.targetType === t)}
                    onClick={() => setForm(f => ({ ...f, targetType: t }))}>
                    {t === 'all' && '🌐'} {t === 'specific' && '👤'} {t === 'filtered' && <Filter size={12} />}
                    {' '}{t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Specific IDs */}
            {form.targetType === 'specific' && (
              <div>
                <label style={labelStyle}>User IDs (comma separated)</label>
                <input id="pn-ids" style={inputStyle} placeholder="e.g. 12, 45, 103"
                  value={form.specificIds}
                  onChange={e => setForm(f => ({ ...f, specificIds: e.target.value }))} />
              </div>
            )}

            {/* Filtered options */}
            {form.targetType === 'filtered' && (
              <div style={{ background: 'var(--bg-color)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Filter size={14} /> Segment Filters
                </div>

                <div>
                  <label style={labelStyle}>Gender</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {['male', 'female', 'non-binary', 'other'].map(g => (
                      <button key={g} style={chipStyle(filters.gender.includes(g))} onClick={() => toggleGender(g)}>{g}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={labelStyle}>Min Age</label>
                    <input style={inputStyle} type="number" min={18} max={100} placeholder="18"
                      value={filters.ageMin} onChange={e => setFilters(f => ({ ...f, ageMin: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Max Age</label>
                    <input style={inputStyle} type="number" min={18} max={100} placeholder="60"
                      value={filters.ageMax} onChange={e => setFilters(f => ({ ...f, ageMax: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>City (contains)</label>
                  <input style={inputStyle} placeholder="e.g. Mumbai" value={filters.city}
                    onChange={e => setFilters(f => ({ ...f, city: e.target.value }))} />
                </div>

                <div>
                  <label style={labelStyle}>Platform</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['android', 'ios', 'web'].map(p => (
                      <button key={p} style={chipStyle(filters.platforms.includes(p))} onClick={() => togglePlatform(p)}>{p}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Active within (days)</label>
                  <input style={inputStyle} type="number" placeholder="e.g. 30" value={filters.activeWithinDays}
                    onChange={e => setFilters(f => ({ ...f, activeWithinDays: e.target.value }))} />
                </div>

                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={filters.verifiedOnly}
                      onChange={e => setFilters(f => ({ ...f, verifiedOnly: e.target.checked }))} />
                    Verified users only
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={filters.onboardedOnly}
                      onChange={e => setFilters(f => ({ ...f, onboardedOnly: e.target.checked }))} />
                    Onboarded only
                  </label>
                </div>
              </div>
            )}

            {/* Custom data pairs */}
            <div>
              <label style={labelStyle}>Custom Data (optional)</label>
              {customData.map((pair, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <input style={{ ...inputStyle, flex: 1 }} placeholder="key" value={pair.key}
                    onChange={e => setCustomData(d => d.map((x, j) => j === i ? { ...x, key: e.target.value } : x))} />
                  <input style={{ ...inputStyle, flex: 2 }} placeholder="value" value={pair.value}
                    onChange={e => setCustomData(d => d.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} />
                  <button onClick={() => setCustomData(d => d.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0 4px' }}>✕</button>
                </div>
              ))}
              <button onClick={() => setCustomData(d => [...d, { key: '', value: '' }])}
                style={{ fontSize: '12px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '4px' }}>+ Add field</button>
            </div>

            {/* Live user count */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.75rem 1rem', borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(168,180,231,0.15), rgba(168,180,231,0.05))',
              border: '1px solid var(--accent)',
            }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Estimated recipients</span>
              <span style={{ fontWeight: 700, fontSize: '20px', color: 'var(--accent)' }}>
                {countLoading ? '...' : userCount !== null ? userCount.toLocaleString() : '—'}
              </span>
            </div>

            {/* Send button */}
            <button
              id="pn-send-btn"
              className="btn btn-primary"
              style={{ justifyContent: 'center', gap: '8px', padding: '0.85rem', fontSize: '15px' }}
              disabled={sending || !form.title || !form.body}
              onClick={() => setShowConfirm(true)}
            >
              <Send size={16} /> {sending ? 'Sending...' : 'Send Broadcast'}
            </button>
          </div>
        </div>

        {/* ── History Table ── */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
            <Clock size={18} color="var(--accent)" /> Broadcast History
          </h3>

          {loadingHistory ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading history...</p>
          ) : broadcasts.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No broadcasts sent yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr>
                    {['Title', 'Target', 'Sent', 'Failed', 'Status', 'Date'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {broadcasts.map((b: any) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                      onClick={() => setSelectedBroadcast(b)}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-color)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '10px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <strong>{b.title}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{b.body.substring(0, 40)}...</div>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={chipStyle(false)}>{b.targetType}</span>
                      </td>
                      <td style={{ padding: '10px', color: 'var(--success)', fontWeight: 700 }}>{b.sentCount}</td>
                      <td style={{ padding: '10px', color: b.failCount > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>{b.failCount}</td>
                      <td style={{ padding: '10px' }}>{statusBadge(b.status)}</td>
                      <td style={{ padding: '10px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                        {new Date(b.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm Dialog ── */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '90%' }}>
            <h3 style={{ marginBottom: '1rem' }}>⚠️ Confirm Broadcast</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '1rem' }}>
              You're about to send <strong>"{form.title}"</strong> to approximately <strong>{userCount?.toLocaleString() ?? '?'} users</strong>.
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer' }}
                onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}
                onClick={handleSend}>
                <Send size={14} /> Yes, Send Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Broadcast Detail Modal ── */}
      {selectedBroadcast && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div className="card" style={{ maxWidth: '520px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Broadcast Details</h3>
              <button onClick={() => setSelectedBroadcast(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}>×</button>
            </div>
            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
              {[
                ['ID', `#${selectedBroadcast.id}`],
                ['Title', selectedBroadcast.title],
                ['Body', selectedBroadcast.body],
                ['Priority', selectedBroadcast.priority],
                ['Target Type', selectedBroadcast.targetType],
                ['Sent', selectedBroadcast.sentCount],
                ['Failed', selectedBroadcast.failCount],
                ['Status', selectedBroadcast.status],
                ['Sent At', selectedBroadcast.sentAt ? new Date(selectedBroadcast.sentAt).toLocaleString() : 'N/A'],
                ['Image URL', selectedBroadcast.imageUrl || 'None'],
                ['Deep Link', selectedBroadcast.deepLink || 'None'],
              ].map(([k, v]) => (
                <tr key={String(k)} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{k}</td>
                  <td style={{ padding: '8px 10px' }}>{String(v)}</td>
                </tr>
              ))}
            </table>
            {selectedBroadcast.filters && (
              <div style={{ marginTop: '1rem' }}>
                <div style={labelStyle}>Filters Applied</div>
                <pre style={{ fontSize: '12px', background: 'var(--bg-color)', padding: '0.75rem', borderRadius: '8px', overflow: 'auto' }}>
                  {JSON.stringify(selectedBroadcast.filters, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('admin_token'));
  const [isAmbassadorOnly, setIsAmbassadorOnly] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      const payload = parseJwt(token);
      if (payload && payload.isAmbassador && !payload.isAdmin) {
        setIsAmbassadorOnly(true);
      } else {
        setIsAmbassadorOnly(false);
      }
    }
  }, [isAuthenticated]);

  const handleLogin = (token: string) => {
    localStorage.setItem('admin_token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="dashboard-layout">
        <Sidebar onLogout={handleLogout} isAmbassadorOnly={isAmbassadorOnly} />
        <main className="main-content">
          <Topnav isAmbassadorOnly={isAmbassadorOnly} />
          <div className="content-scrollable">
            <Routes>
              {isAmbassadorOnly ? (
                <>
                  <Route path="/" element={<AmbassadorsPage isAmbassadorOnly={true} />} />
                  <Route path="*" element={<AmbassadorsPage isAmbassadorOnly={true} />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<Overview />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/matching" element={<MatchingPage />} />
                  <Route path="/chats" element={<ChatsPage />} />
                  <Route path="/subscriptions" element={<SubscriptionsPage />} />
                  <Route path="/bulk-email" element={<BulkEmailPage />} />
                  <Route path="/tickets" element={<TicketsPage />} />
                  <Route path="/create-profile" element={<CreateProfilePage />} />
                  <Route path="/feedback" element={<FeedbackPage />} />
                  <Route path="/jobs" element={<JobsPage />} />
                  <Route path="/push-notifications" element={<PushNotificationsPage />} />
                  <Route path="/ambassadors" element={<AmbassadorsPage />} />
                </>
              )}
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
