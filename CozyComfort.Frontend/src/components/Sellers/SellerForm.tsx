import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Seller } from '../../types/models';
import { sellerService } from '../../services/sellerService';
import '../Distributors/DistributorForm.css';

export default function SellerForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState<Omit<Seller, 'sellerId'>>({
        userId: 0,
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        location: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit && id) {
            loadSeller(parseInt(id));
        }
    }, [id, isEdit]);

    const loadSeller = async (sellerId: number) => {
        try {
            const data = await sellerService.getById(sellerId);
            setFormData({
                userId: data.userId,
                name: data.name,
                contactPerson: data.contactPerson,
                email: data.email,
                phone: data.phone,
                location: data.location,
            });
        } catch (err) {
            setError('Failed to load seller');
            console.error(err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEdit && id) {
                await sellerService.update(parseInt(id), {
                    ...formData,
                    sellerId: parseInt(id),
                });
            } else {
                await sellerService.create(formData);
            }
            navigate('/sellers');
        } catch (err) {
            setError('Failed to save seller. Make sure the backend is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>{isEdit ? 'Edit Seller' : 'Add New Seller'}</h2>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Name *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="contactPerson">Contact Person *</label>
                    <input
                        type="text"
                        id="contactPerson"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Phone *</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="location">Location *</label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                    </button>
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => navigate('/sellers')}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
