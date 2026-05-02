import React, { useState, useEffect } from 'react';
import { OrdersAPI, Products } from '../../api/client';
import type { Order, Blanket } from '../../types/models';
import './IncomingOrders.css';

interface Props {
    supplierId: number;
    role: 'Manufacturer' | 'Distributor' | 'Seller';
    title?: string;
}

const IncomingOrders: React.FC<Props> = ({ supplierId, role, title }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Blanket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [supplierId]);

    const loadData = async () => {
        setLoading(true);
        try {
            console.log(`IncomingOrders.loadData: supplierId=${supplierId}, role=${role}, type=incoming`);
            const [ordersData, productsData] = await Promise.all([
                OrdersAPI.list({ supplierId, role, type: 'incoming' }),
                Products.list()
            ]);
            console.log("IncomingOrders received:", ordersData.length, "orders");
            setOrders(ordersData);
            setProducts(productsData);
        } catch (error) {
            console.error("IncomingOrders.loadData Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId: number, newStatus: string) => {
        if (!confirm(`Are you sure you want to mark order #${orderId} as ${newStatus}?`)) return;

        try {
            await OrdersAPI.updateStatus(orderId, newStatus);
            alert(`Order #${orderId} marked as ${newStatus}`);
            // Reload orders to reflect status change
            const updatedOrders = await OrdersAPI.list({ supplierId, role, type: 'incoming' });
            setOrders(updatedOrders);
        } catch (error) {
            console.error(error);
            alert("Failed to update status");
        }
    };

    const getNextStatus = (currentStatus: string) => {
        switch (currentStatus) {
            case 'Pending': return 'Processing';
            case 'Processing': return 'Completed'; // Or 'Ready' then 'Delivered'
            default: return null;
        }
    };

    if (loading) return <div>Loading orders...</div>;

    return (
        <div className="incoming-orders-container">
            <h3>📥 {title || 'Incoming Orders'}</h3>
            {orders.length === 0 ? (
                <div className="no-orders-message">
                    <p>No incoming orders at the moment.</p>
                    {role === 'Manufacturer' && (
                        <div className="help-text" style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #007bff' }}>
                            <p><strong>Why aren't my orders showing?</strong></p>
                            <ul style={{ textAlign: 'left', marginTop: '10px' }}>
                                <li>You are currently logged in as Manufacturer <strong>#{supplierId}</strong>.</li>
                                <li>Orders appear here only when a Distributor places an order specifically for <strong>YOUR</strong> stock (Manufacturer #{supplierId}).</li>
                                <li>Ensure you have added products and stock in the <strong>"My Stock"</strong> tab.</li>
                                <li>Distributors see stock from all manufacturers. They must choose items from <strong>Manufacturer #{supplierId}</strong> to order from you.</li>
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Total Price</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => {
                            const nextStatus = getNextStatus(order.status);
                            const isCompleted = order.status === 'Completed' || order.status === 'Delivered';
                            const product = products.find(p => p.blanketId === order.blanketId);

                            return (
                                <tr key={order.orderId} className={isCompleted ? 'order-completed' : ''}>
                                    <td>#{order.orderId}</td>
                                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                    <td>
                                        <strong>{product?.modelName || `Unknown (ID: ${order.blanketId})`}</strong>
                                        <div style={{ fontSize: '0.85em', color: '#666' }}>
                                            {product?.size} - {product?.material}
                                        </div>
                                    </td>
                                    <td>{order.quantity}</td>
                                    <td>${order.totalPrice.toFixed(2)}</td>
                                    <td>
                                        <span className={`status-badge status-${order.status.toLowerCase()}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        {nextStatus && (
                                            <button
                                                className="btn-action"
                                                onClick={() => handleStatusUpdate(order.orderId, nextStatus)}
                                            >
                                                Mark as {nextStatus}
                                            </button>
                                        )}
                                        {order.status === 'Completed' && (
                                            <span className="text-muted">Fulfilled</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default IncomingOrders;
