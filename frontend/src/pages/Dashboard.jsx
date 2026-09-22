import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, Layout, ClipboardList, Briefcase } from 'lucide-react';

export default function Dashboard() {
  const { user, organizations, activeOrganization, setActiveOrganization, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  // --- CORE CVAT RBAC LOGIC ---
  // 1. Is the user a global superuser? (Global Override)
  const isSuperuser = user.is_superuser;

  // 2. Determine the active role context
  let currentRole = 'user'; 
  
  if (activeOrganization) {
    // If in an Organization, use the organization role
    currentRole = activeOrganization.membership_role; 
  } else {
    // If in Personal Workspace, use global role
    currentRole = user.groups[0]; 
  }

  // 3. Permissions based on CVAT rules
  // Superuser has ALL permissions everywhere
  const canManageSystem = isSuperuser; 
  
  // Quyền tạo/sửa/xoá Project và Task
  const canManageProjects = isSuperuser || 
    (activeOrganization 
      ? ['owner', 'maintainer', 'supervisor'].includes(currentRole) // Tổ chức: Owner, Maintainer, Supervisor được tạo project
      : ['admin', 'user'].includes(currentRole)); // Cá nhân: Admin và User được tạo project, Worker bị cấm

  // Quyền quản lý thành viên (Mời/Xoá User trong tổ chức)
  const canManageMembers = isSuperuser || (activeOrganization && ['owner', 'maintainer'].includes(currentRole));
  
  // Render role badge helper
  const getRoleBadge = (role, isOrgContext) => {
    if (isSuperuser) return <span className="role-badge role-admin">Superuser (Global Override)</span>;
    
    if (isOrgContext) {
      if (role === 'owner') return <span className="role-badge role-admin">Org Owner</span>;
      if (role === 'maintainer') return <span className="role-badge" style={{color: '#8b5cf6', borderColor: '#8b5cf6'}}>Org Maintainer</span>;
      if (role === 'supervisor') return <span className="role-badge" style={{color: '#f59e0b', borderColor: '#f59e0b'}}>Org Supervisor</span>;
      if (role === 'worker') return <span className="role-badge role-worker">Org Worker</span>;
    } else {
      if (role === 'admin') return <span className="role-badge role-admin">Global Admin</span>;
      if (role === 'user') return <span className="role-badge" style={{color: '#3b82f6', borderColor: '#3b82f6'}}>Global User</span>;
      if (role === 'worker') return <span className="role-badge role-worker">Global Worker</span>;
    }
    return <span className="role-badge">{role}</span>;
  };

  return (
    <div>
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <h2>CVAT Tool</h2>
          
          {/* Organization Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
            <Briefcase size={18} className="text-muted" />
            <select 
              value={activeOrganization ? activeOrganization.slug : ''}
              onChange={(e) => {
                const slug = e.target.value;
                if (slug === '') setActiveOrganization(null);
                else setActiveOrganization(organizations.find(o => o.slug === slug));
              }}
              style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="" style={{ color: 'black' }}>Personal Workspace</option>
              {organizations.map(org => (
                <option key={org.slug} value={org.slug} style={{ color: 'black' }}>
                  {org.name} ({org.membership_role})
                </option>
              ))}
            </select>
          </div>
          
          {getRoleBadge(currentRole, !!activeOrganization)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="text-muted">Welcome, {user.username}</span>
          <button className="btn btn-danger" onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="container">
        <h3>
          {activeOrganization ? `Organization: ${activeOrganization.name}` : 'Personal Workspace'}
        </h3>
        <p className="text-muted" style={{ marginTop: '0.5rem' }}>
          {activeOrganization ? activeOrganization.description : 'Your private working space.'}
        </p>

        <div className="dashboard-grid">
          {/* Admin Tools - Only visible to Global Superuser */}
          {canManageSystem && (
            <div className="glass-panel card">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: 'var(--danger)' }}>
                  <Settings size={24} />
                </div>
                <h4>System Settings (Django Admin)</h4>
              </div>
              <p className="text-muted">Global Override active. You can manage the entire CVAT server, all users, and configurations.</p>
            </div>
          )}

          {/* Project Management - Visible to Global (Admin, User) or Org (Owner, Maintainer, Supervisor) */}
          {canManageProjects && (
            <div className="glass-panel card">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
                  <Layout size={24} />
                </div>
                <h4>Manage Projects & Tasks</h4>
              </div>
              <p className="text-muted">Create new annotation projects, create tasks, and manage data.</p>
            </div>
          )}

          {/* Member Management - Visible only to Org Owner and Maintainer */}
          {canManageMembers && (
            <div className="glass-panel card">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: '#8b5cf6' }}>
                  <Settings size={24} />
                </div>
                <h4>Manage Organization Members</h4>
              </div>
              <p className="text-muted">Invite new users, remove members, and change their roles in this organization.</p>
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
            <p className="text-muted">View and work on annotation tasks assigned to you in {activeOrganization ? activeOrganization.name : 'your personal workspace'}.</p>
            
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
              Open Annotator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

