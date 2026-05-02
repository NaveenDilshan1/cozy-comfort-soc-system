import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Home.css';

export default function Home() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="home-container">
            {/* Navigation */}
            <nav className={`home-navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="nav-content">
                    <div className="brand-logo" onClick={() => navigate('/')}>
                        <span className="logo-icon">🧶</span>
                        <span className="brand-text">CozyComfort</span>
                    </div>
                    <div className="nav-links">
                        <a href="#features" className="nav-link">Features</a>
                        <a href="#roles" className="nav-link">Network</a>
                        <button className="btn-login" onClick={() => navigate('/login')}>
                            Login
                        </button>
                        <button className="btn-signup" onClick={() => navigate('/register')}>
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content fade-in-up">
                    <span className="hero-badge">The Future of Comfort Supply Chain</span>
                    <h1 className="hero-title">
                        Weaving Connections <br />
                        <span className="text-gradient">From Factory to Sofa</span>
                    </h1>
                    <p className="hero-subtitle">
                        A seamless ecosystem connecting Manufacturers, Distributors, Sellers, and Customers. Experience transparency and quality at every step.
                    </p>
                    <div className="hero-buttons">
                        <button className="btn-primary-lg" onClick={() => navigate('/register')}>
                            Join the Network
                        </button>
                        <button className="btn-secondary-lg" onClick={() => navigate('/login')}>
                            Customer Login
                        </button>
                    </div>
                </div>

                {/* Abstract Background Shapes */}
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
            </header>

            {/* Stats / Trust Section */}
            <section className="stats-section">
                <div className="stat-item">
                    <span className="stat-number">10k+</span>
                    <span className="stat-label">Blankets Sold</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">50+</span>
                    <span className="stat-label">Active Partners</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">99%</span>
                    <span className="stat-label">On-Time Delivery</span>
                </div>
            </section>

            {/* Features / Roles Section */}
            <section id="roles" className="features-section">
                <div className="section-header">
                    <h2 className="section-title">One Platform, Endless Possibilities</h2>
                    <p className="section-subtitle">Tailored tools for every stakeholder in the supply chain.</p>
                </div>

                <div className="features-grid">
                    {/* Customer */}
                    <div className="feature-card" onClick={() => navigate('/register')}>
                        <div className="card-icon-wrapper customer-bg">
                            🛋️
                        </div>
                        <h3>For Customers</h3>
                        <p>Discover premium blankets from verified sellers near you. Real-time stock checks and instant purchasing.</p>
                        <span className="card-link">Start Shopping &rarr;</span>
                    </div>

                    {/* Seller */}
                    <div className="feature-card" onClick={() => navigate('/register')}>
                        <div className="card-icon-wrapper seller-bg">
                            🏪
                        </div>
                        <h3>For Sellers</h3>
                        <p>Source directly from distributors. Manage your inventory and restock with a single click.</p>
                        <span className="card-link">Become a Seller &rarr;</span>
                    </div>

                    {/* Distributor */}
                    <div className="feature-card" onClick={() => navigate('/register')}>
                        <div className="card-icon-wrapper distributor-bg">
                            🚚
                        </div>
                        <h3>For Distributors</h3>
                        <p>Orchestrate the flow of goods. Bulk order from manufacturers and supply sellers efficiently.</p>
                        <span className="card-link">Join Distribution &rarr;</span>
                    </div>

                    {/* Manufacturer */}
                    <div className="feature-card" onClick={() => navigate('/register')}>
                        <div className="card-icon-wrapper cleanup-bg">
                            🏭
                        </div>
                        <h3>For Manufacturers</h3>
                        <p>Production planning made easy. Receive orders, manage stock, and track your products downstream.</p>
                        <span className="card-link">Partner with Us &rarr;</span>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Ready to get cozy?</h2>
                    <p>Join thousands of happy customers and partners in the CozyComfort network today.</p>
                    <button className="btn-white-lg" onClick={() => navigate('/register')}>Create Free Account</button>
                </div>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <h4>CozyComfort</h4>
                        <p>Revolutionizing the textile supply chain, one blanket at a time.</p>
                    </div>
                    <div className="footer-links-group">
                        <div className="link-column">
                            <h5>Platform</h5>
                            <a href="#">About Us</a>
                            <a href="#">Careers</a>
                            <a href="#">Press</a>
                        </div>
                        <div className="link-column">
                            <h5>Support</h5>
                            <a href="#">Help Center</a>
                            <a href="#">Terms of Service</a>
                            <a href="#">Privacy Policy</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} CozyComfort Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
