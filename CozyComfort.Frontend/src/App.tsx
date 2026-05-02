import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import BlanketList from './components/Blankets/BlanketList';
import BlanketForm from './components/Blankets/BlanketForm';
import DistributorList from './components/Distributors/DistributorList';
import DistributorForm from './components/Distributors/DistributorForm';
import SellerList from './components/Sellers/SellerList';
import SellerForm from './components/Sellers/SellerForm';
import OrderList from './components/Orders/OrderList';
import OrderForm from './components/Orders/OrderForm';
import Home from './components/Home/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ManufacturerDashboard from './components/Dashboard/ManufacturerDashboard';
import DistributorDashboard from './components/Dashboard/DistributorDashboard';
import SellerDashboard from './components/Dashboard/SellerDashboard';
import CustomerDashboard from './components/Dashboard/CustomerDashboard';
import DashboardLayout from './components/Layout/DashboardLayout';
import './App.css';

function App() {
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes wrapped in Layout */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/dashboard/manufacturer" element={<DashboardLayout user={currentUser?.manufacturer} role="Manufacturer"><ManufacturerDashboard user={currentUser?.manufacturer} currentUser={currentUser} /></DashboardLayout>} />
        <Route path="/dashboard/distributor" element={<DashboardLayout user={currentUser?.distributor} role="Distributor"><DistributorDashboard user={currentUser?.distributor} currentUser={currentUser} /></DashboardLayout>} />
        <Route path="/dashboard/seller" element={<DashboardLayout user={currentUser?.seller} role="Seller"><SellerDashboard user={currentUser?.seller} currentUser={currentUser} /></DashboardLayout>} />
        <Route path="/dashboard/customer" element={<DashboardLayout user={currentUser} role="Customer"><CustomerDashboard currentUser={currentUser} /></DashboardLayout>} />

        <Route path="/blankets" element={<Layout><BlanketList /></Layout>} />
        <Route path="/blankets/new" element={<Layout><BlanketForm /></Layout>} />
        <Route path="/blankets/:id/edit" element={<Layout><BlanketForm /></Layout>} />

        <Route path="/distributors" element={<Layout><DistributorList /></Layout>} />
        <Route path="/distributors/new" element={<Layout><DistributorForm /></Layout>} />
        <Route path="/distributors/:id/edit" element={<Layout><DistributorForm /></Layout>} />

        <Route path="/sellers" element={<Layout><SellerList /></Layout>} />
        <Route path="/sellers/new" element={<Layout><SellerForm /></Layout>} />
        <Route path="/sellers/:id/edit" element={<Layout><SellerForm /></Layout>} />

        <Route path="/orders" element={<Layout><OrderList /></Layout>} />
        <Route path="/orders/new" element={<Layout><OrderForm /></Layout>} />
        <Route path="/orders/:id/edit" element={<Layout><OrderForm /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
