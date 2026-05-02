import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Order } from '../../types/models';
import { orderService } from '../../services/orderService';
import '../Distributors/DistributorList.css';

export default function OrderList() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await orderService.getAll();
            setOrders(data);
            setError(null);
        } catch (err) {
            setError('Failed to load orders. Make sure the backend is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this order?')) {
            return;
        }

        try {
            await orderService.delete(id);
            loadOrders();
        } catch (err) {
            alert('Failed to delete order');
            console.error(err);
        }
    };

    if (loading) return <div className="loading">Loading orders...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="list-container">
            <div className="list-header">
                <h2>Orders</h2>
                <button className="btn-primary" onClick={() => navigate('/orders/new')}>
                    + Add New Order
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="empty-state">
                    <p>No orders found. Create your first order!</p>
                </div>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer Name</th>
                            <th>Blanket ID</th>
                            <th>Quantity</th>
                            <th>Order Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.orderId}>
                                <td>{order.orderId}</td>
                                <td>{order.customerName}</td>
                                <td>{order.blanketId}</td>
                                <td>{order.quantity}</td>
                                <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                <td>{order.status}</td>
                                <td>
                                    <button
                                        className="btn-edit"
                                        onClick={() => navigate(`/orders/${order.orderId}/edit`)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(order.orderId)}
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
