import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './Auth.css';

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response: any = await authService.login(formData);
            // API returns { message: "...", user: { ... } }
            const user = response.user || response; // Fallback if API changes, but currrently it is response.user

            // Store user details (token/role) in localStorage
            localStorage.setItem('user', JSON.stringify(user));

            console.log("Logged in user:", user);

            // Redirect based on role
            switch (user.role) {
                case 'Manufacturer':
                    navigate('/dashboard/manufacturer');
                    break;
                case 'Distributor':
                    navigate('/dashboard/distributor');
                    break;
                case 'Seller':
                    navigate('/dashboard/seller');
                    break;
                case 'Customer':
                case 'User':
                    navigate('/dashboard/customer');
                    break;
                default:
                    // Fallback check
                    if (user.role === 'User' || user.role === 'Customer') navigate('/dashboard/customer');
                    else navigate('/dashboard');
                    break;
            }
        } catch (err: any) {
            console.error(err);
            setError("Invalid username or password");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Welcome Back</h2>
                <p className="auth-subtitle">Login to access your dashboard</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="JohnDoe"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn-auth">Login</button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <span onClick={() => navigate('/register')}>Register</span>
                </p>
            </div>
        </div>
    );
}
