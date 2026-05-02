import React from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './DashboardLayout.css';

interface DashboardLayoutProps {
    children: ReactNode;
    user: any;
    role: 'Manufacturer' | 'Distributor' | 'Seller' | 'Customer';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, user, role }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    const navItems = {
        Manufacturer: [
            { label: 'Overview', path: '/dashboard/manufacturer', icon: '📊' },
            { label: 'Products', path: '/blankets', icon: '📦' },
            { label: 'Orders', path: '/orders', icon: '🚚' },
            { label: 'Distributors', path: '/distributors', icon: '🏢' },
        ],
        Distributor: [
            { label: 'Overview', path: '/dashboard/distributor', icon: '📊' },
            { label: 'Manufacturer Stock', path: '/blankets', icon: '🏭' },
            { label: 'My Inventory', path: '/dashboard/distributor?tab=inventory', icon: '📋' },
            { label: 'Orders', path: '/orders', icon: '🚚' },
            { label: 'Sellers', path: '/sellers', icon: '🏪' },
        ],
        Seller: [
            { label: 'Overview', path: '/dashboard/seller', icon: '📊' },
            { label: 'Distributor Stock', path: '/blankets', icon: '🏢' },
            { label: 'My Store', path: '/dashboard/seller?tab=inventory', icon: '🛍️' },
            { label: 'Orders', path: '/orders', icon: '🚚' },
        ],
        Customer: [
            { label: 'Overview', path: '/dashboard/customer', icon: '👤' },
            { label: 'Shop Now', path: '/', icon: '🛒' },
            { label: 'My Orders', path: '/orders', icon: '📜' },
        ]
    };

    const currentNavItems = navItems[role] || [];

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <span className="brand-icon">🏭</span>
                    <span className="brand-name">CozyComfort</span>
                </div>

                <div className="user-profile">
                    <div className="avatar">{user?.name?.[0] || role[0]}</div>
                    <div className="user-info">
                        <p className="user-name">{user?.name || 'User'}</p>
                        <p className="user-role">{role}</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {currentNavItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-button" onClick={handleLogout}>
                        <span className="nav-icon">🚪</span>
                        <span className="nav-label">Logout</span>
                    </button>
                </div>
            </aside>

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div className="breadcrumb">
                        <span>Dashboard</span> / <span className="current">{role}</span>
                    </div>
                    <div className="header-actions">
                        <button className="icon-button">🔔</button>
                        <button className="icon-button">⚙️</button>
                    </div>
                </header>
                <div className="dashboard-content">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
