import React, { useState, useEffect } from 'react';
import { OrdersAPI, Products } from '../../api/client';
import type { Order, Blanket } from '../../types/models';
import './IncomingOrders.css'; // Reuse existing styles

interface Props {
    userId: number;
}

const MyOrders: React.FC<Props> = ({ userId }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Blanket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [userId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [orderData, prodData] = await Promise.all([
                OrdersAPI.list({ userId }),
                Products.list()
            ]);
            setOrders(orderData);
            setProducts(prodData);
        } catch (error) {
            console.error("Failed to load orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (orderId: number) => {
        if (!confirm('Are you sure you want to delete this order?')) return;
        try {
            await OrdersAPI.delete(orderId);
            loadData();
        } catch (error) {
            console.error('Failed to delete order', error);
            alert('Failed to delete order');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Pending': return 'badge-warning';
            case 'Processing': return 'badge-info';
            case 'Completed': return 'badge-success';
            case 'Delivered': return 'badge-success';
            case 'Cancelled': return 'badge-danger';
            default: return 'badge-secondary';
        }
    };

    return (
        <div className="orders-container">
            <h3>My Orders (Outgoing)</h3>
            {loading ? (
                <p>Loading orders...</p>
            ) : orders.length === 0 ? (
                <p className="no-orders">You haven't placed any orders yet.</p>
            ) : (
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Total Price</th>
                            <th>Supplier</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => {
                            const product = products.find(p => p.blanketId === order.blanketId);
                            // Supplier info is in order.supplierId, but we might not have names easily without another proper fetch.
                            // For now, ID is sufficient or we can infer role.
                            return (
                                <tr key={order.orderId}>
                                    <td>#{order.orderId}</td>
                                    <td>{product?.modelName || 'Unknown Product'}</td>
                                    <td>{order.quantity}</td>
                                    <td>${order.totalPrice?.toFixed(2)}</td>
                                    <td>ID: {order.supplierId}</td>
                                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                    <td><span className={`status-badge ${getStatusBadge(order.status)}`}>{order.status}</span></td>
                                    <td><button onClick={() => handleDelete(order.orderId)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Delete</button></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default MyOrders;
