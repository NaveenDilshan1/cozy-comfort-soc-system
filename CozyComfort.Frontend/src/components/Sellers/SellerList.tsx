import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Seller } from '../../types/models';
import { sellerService } from '../../services/sellerService';
import '../Distributors/DistributorList.css';

export default function SellerList() {
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadSellers();
    }, []);

    const loadSellers = async () => {
        try {
            setLoading(true);
            const data = await sellerService.getAll();
            setSellers(data);
            setError(null);
        } catch (err) {
            setError('Failed to load sellers. Make sure the backend is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this seller?')) {
            return;
        }

        try {
            await sellerService.delete(id);
            loadSellers();
        } catch (err) {
            alert('Failed to delete seller');
            console.error(err);
        }
    };

    if (loading) return <div className="loading">Loading sellers...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="list-container">
            <div className="list-header">
                <h2>Sellers</h2>
                <button className="btn-primary" onClick={() => navigate('/sellers/new')}>
                    + Add New Seller
                </button>
            </div>

            {sellers.length === 0 ? (
                <div className="empty-state">
                    <p>No sellers found. Add your first seller!</p>
                </div>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Contact Person</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Location</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sellers.map((seller) => (
                            <tr key={seller.sellerId}>
                                <td>{seller.sellerId}</td>
                                <td>{seller.name}</td>
                                <td>{seller.contactPerson}</td>
                                <td>{seller.email}</td>
                                <td>{seller.phone}</td>
                                <td>{seller.location}</td>
                                <td>
                                    <button
                                        className="btn-edit"
                                        onClick={() => navigate(`/sellers/${seller.sellerId}/edit`)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(seller.sellerId)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
