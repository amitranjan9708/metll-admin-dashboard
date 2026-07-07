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
  Mail,
  UserPlus,
  Briefcase,
  MessageCircle
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
    { path: '/create-profile', icon: <UserPlus size={20} />, label: 'Create Profile' },
    { path: '/feedback', icon: <MessageCircle size={20} />, label: 'User Feedback' },
    { path: '/jobs', icon: <Briefcase size={20} />, label: 'Careers (Jobs)' },
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
      case '/bulk-email': return 'Bulk Email';
      case '/tickets': return 'Support Tickets';
      case '/create-profile': return 'Create New Profile';
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
              <Route path="/create-profile" element={<CreateProfilePage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/jobs" element={<JobsPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
