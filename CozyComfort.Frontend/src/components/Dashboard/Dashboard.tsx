import { useState, useEffect } from 'react';
import CustomerDashboard from './CustomerDashboard';
import SellerDashboard from './SellerDashboard';
import DistributorDashboard from './DistributorDashboard';
import ManufacturerDashboard from './ManufacturerDashboard';
import './Dashboard.css';

export default function Dashboard() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        } else {
            // navigate('/login'); // Layout might handle this, or we redirect
        }
    }, []);

    if (!user) {
        return <div className="loading">Loading dashboard...</div>;
    }

    // Role-based rendering
    switch (user.role) {
        case 'Seller':
            return <SellerDashboard user={user.seller} currentUser={user} />;
        case 'Distributor':
            return <DistributorDashboard user={user.distributor} currentUser={user} />;
        case 'Manufacturer':
            return <ManufacturerDashboard user={user.manufacturer} currentUser={user} />;
        case 'User':
        case 'Customer':
        default:
            return <CustomerDashboard currentUser={user} />;
    }
}
