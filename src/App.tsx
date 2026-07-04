import React, { useEffect, useState } from 'react';
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
  Mail
} from 'lucide-react';
import { api, AdminService } from './services/api';
import './App.css';

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
        onLogin(token);
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
const Sidebar = ({ onLogout }: { onLogout: () => void }) => {
  const menuItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { path: '/users', icon: <Users size={20} />, label: 'Users' },
    { path: '/matching', icon: <Heart size={20} />, label: 'Matching & Likes' },
    { path: '/chats', icon: <MessageSquare size={20} />, label: 'Chats' },
    { path: '/subscriptions', icon: <CreditCard size={20} />, label: 'Subscriptions' },
    { path: '/bulk-email', icon: <Mail size={20} />, label: 'Bulk Email' },
    { path: '/tickets', icon: <Ticket size={20} />, label: 'Support Tickets' },
  ];

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

const Topnav = () => {
  const location = useLocation();
  const getPageTitle = () => {
    switch(location.pathname) {
      case '/': return 'Dashboard Overview';
      case '/users': return 'User Management';
      case '/matching': return 'Matching & Likes';
      case '/chats': return 'Chat Monitoring';
      case '/subscriptions': return 'Subscriptions & Payments';
      case '/tickets': return 'Support Tickets';
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

  useEffect(() => {
    AdminService.getUsers().then(res => setUsers(res.users)).finally(() => setLoading(false));
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
                <th>Verified</th>
                <th>Verif. Status</th>
                <th>Admin</th>
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('admin_token'));

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
        <Sidebar onLogout={handleLogout} />
        <main className="main-content">
          <Topnav />
          <div className="content-scrollable">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/matching" element={<MatchingPage />} />
              <Route path="/chats" element={<ChatsPage />} />
              <Route path="/subscriptions" element={<SubscriptionsPage />} />
              <Route path="/bulk-email" element={<BulkEmailPage />} />
              <Route path="/tickets" element={<TicketsPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
