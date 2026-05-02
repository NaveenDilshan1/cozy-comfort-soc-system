import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Distributor } from '../../types/models';
import { distributorService } from '../../services/distributorService';
import './DistributorList.css';

export default function DistributorList() {
    const [distributors, setDistributors] = useState<Distributor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadDistributors();
    }, []);

    const loadDistributors = async () => {
        try {
            setLoading(true);
            const data = await distributorService.getAll();
            setDistributors(data);
            setError(null);
        } catch (err) {
            setError('Failed to load distributors. Make sure the backend is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this distributor?')) {
            return;
        }

        try {
            await distributorService.delete(id);
            loadDistributors();
        } catch (err) {
            alert('Failed to delete distributor');
            console.error(err);
        }
    };

    if (loading) return <div className="loading">Loading distributors...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="list-container">
            <div className="list-header">
                <h2>Distributors</h2>
                <button
                    className="btn-primary"
                    onClick={() => navigate('/distributors/new')}
                >
                    + Add New Distributor
                </button>
            </div>

            {distributors.length === 0 ? (
                <div className="empty-state">
                    <p>No distributors found. Add your first distributor!</p>
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
                            <th>Address</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {distributors.map((distributor) => (
                            <tr key={distributor.distributorId}>
                                <td>{distributor.distributorId}</td>
                                <td>{distributor.name}</td>
                                <td>{distributor.contactPerson}</td>
                                <td>{distributor.email}</td>
                                <td>{distributor.phone}</td>
                                <td>{distributor.address}</td>
                                <td>
                                    <button
                                        className="btn-edit"
                                        onClick={() => navigate(`/distributors/${distributor.distributorId}/edit`)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(distributor.distributorId)}
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
