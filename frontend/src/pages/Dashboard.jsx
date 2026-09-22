import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, Layout, ClipboardList } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  // Render role badge helper
  const getRoleBadge = (role) => {
    if (role === 'admin') return <span className="role-badge role-admin">Administrator</span>;
    if (role === 'worker') return <span className="role-badge role-worker">Worker</span>;
    return <span className="role-badge">User</span>;
  };

  const isAdmin = user.groups.includes('admin');
  const isWorker = user.groups.includes('worker');

  return (
    <div>
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2>Annotation Tool</h2>
          {getRoleBadge(user.groups[0])}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="text-muted">Welcome, {user.username}</span>
          <button className="btn btn-danger" onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="container">
        <h3>Dashboard Overview</h3>
        <p className="text-muted" style={{ marginTop: '0.5rem' }}>
          Here are the tools available for your role.
        </p>

        <div className="dashboard-grid">
          {/* Admin Tools */}
          {isAdmin && (
            <div className="glass-panel card">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: 'var(--danger)' }}>
                  <Settings size={24} />
                </div>
                <h4>System Settings</h4>
              </div>
              <p className="text-muted">Manage global CVAT configurations, add new users, and adjust application settings.</p>
            </div>
          )}

          {/* Standard User/Admin Tools (Manage Projects) */}
          {!isWorker && (
            <div className="glass-panel card">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
                  <Layout size={24} />
                </div>
                <h4>Manage Projects</h4>
              </div>
              <p className="text-muted">Create new annotation projects, import datasets, and export results.</p>
            </div>
          )}

          {/* All Roles (My Tasks) */}
          <div className="glass-panel card">
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success)' }}>
                <ClipboardList size={24} />
              </div>
              <h4>My Annotation Tasks</h4>
            </div>
            <p className="text-muted">View and work on annotation tasks that have been assigned directly to you.</p>
            
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
              Open Annotator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
