import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Blanket } from '../../types/models';
import { blanketService } from '../../services/blanketService';
import '../Distributors/DistributorList.css';

export default function BlanketList() {
    const [blankets, setBlankets] = useState<Blanket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadBlankets();
    }, []);

    const loadBlankets = async () => {
        try {
            setLoading(true);
            const data = await blanketService.getAll();
            setBlankets(data);
            setError(null);
        } catch (err) {
            setError('Failed to load blankets. Make sure the backend is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this blanket?')) {
            return;
        }

        try {
            await blanketService.delete(id);
            loadBlankets();
        } catch (err) {
            alert('Failed to delete blanket');
            console.error(err);
        }
    };

    if (loading) return <div className="loading">Loading blankets...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="list-container">
            <div className="list-header">
                <h2>Blankets</h2>
                <button className="btn-primary" onClick={() => navigate('/blankets/new')}>
                    + Add New Blanket
                </button>
            </div>

            {blankets.length === 0 ? (
                <div className="empty-state">
                    <p>No blankets found. Add your first blanket model!</p>
                </div>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Model Name</th>
                            <th>Material</th>
                            <th>Stock Level</th>
                            <th>Production Capacity</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blankets.map((blanket) => (
                            <tr key={blanket.blanketId}>
                                <td>{blanket.blanketId}</td>
                                <td>{blanket.modelName}</td>
                                <td>{blanket.material}</td>
                                <td>{blanket.stockLevel}</td>
                                <td>{blanket.productionCapacity}</td>
                                <td>
                                    <button
                                        className="btn-edit"
                                        onClick={() => navigate(`/blankets/${blanket.blanketId}/edit`)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(blanket.blanketId)}
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
