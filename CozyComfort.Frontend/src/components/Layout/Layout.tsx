import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import './Layout.css';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    return (
        <div className="layout">
            <header className="header">
                <div>
                    <h1>🏭 CozyComfort</h1>
                    <p>Blanket Manufacturing Management System</p>
                </div>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
            </header>

            <div className="container">
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
