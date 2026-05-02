import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Distributor } from '../../types/models';
import { distributorService } from '../../services/distributorService';
import './DistributorForm.css';

export default function DistributorForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState<Omit<Distributor, 'distributorId'>>({
        userId: 0,
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit && id) {
            loadDistributor(parseInt(id));
        }
    }, [id, isEdit]);

    const loadDistributor = async (distributorId: number) => {
        try {
            const data = await distributorService.getById(distributorId);
            setFormData({
                userId: data.userId,
                name: data.name,
                contactPerson: data.contactPerson,
                email: data.email,
                phone: data.phone,
                address: data.address,
            });
        } catch (err) {
            setError('Failed to load distributor');
            console.error(err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                await distributorService.update(parseInt(id), {
                    ...formData,
                    distributorId: parseInt(id),
                });
            } else {
                await distributorService.create(formData);
            }
            navigate('/distributors');
        } catch (err) {
            setError('Failed to save distributor. Make sure the backend is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>{isEdit ? 'Edit Distributor' : 'Add New Distributor'}</h2>

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
                    <label htmlFor="address">Address *</label>
                    <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
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
                        onClick={() => navigate('/distributors')}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
