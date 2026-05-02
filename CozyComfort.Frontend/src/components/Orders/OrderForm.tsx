import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Order } from '../../types/models';
import { orderService } from '../../services/orderService';
import '../Distributors/DistributorForm.css';

export default function OrderForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState<Omit<Order, 'orderId'>>({
        blanketId: 0,
        quantity: 0,
        orderDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        customerName: '',
        userId: 0,
        orderType: 'Customer',
        totalPrice: 0,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit && id) {
            loadOrder(parseInt(id));
        }
    }, [id, isEdit]);

    const loadOrder = async (orderId: number) => {
        try {
            const data = await orderService.getById(orderId);
            setFormData({
                blanketId: data.blanketId,
                quantity: data.quantity,
                orderDate: data.orderDate.split('T')[0],
                status: data.status,
                customerName: data.customerName,
                userId: data.userId,
                orderType: data.orderType,
                totalPrice: data.totalPrice,
            });
        } catch (err) {
            setError('Failed to load order');
            console.error(err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const orderData = {
                ...formData,
                orderDate: new Date(formData.orderDate).toISOString(),
            };

            if (isEdit && id) {
                await orderService.update(parseInt(id), {
                    ...orderData,
                    orderId: parseInt(id),
                });
            } else {
                await orderService.create(orderData);
            }
            navigate('/orders');
        } catch (err) {
            setError('Failed to save order. Make sure the backend is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>{isEdit ? 'Edit Order' : 'Add New Order'}</h2>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="customerName">Customer Name *</label>
                    <input
                        type="text"
                        id="customerName"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="blanketId">Blanket ID *</label>
                    <input
                        type="number"
                        id="blanketId"
                        name="blanketId"
                        value={formData.blanketId}
                        onChange={handleChange}
                        min="1"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="quantity">Quantity *</label>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        min="1"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="orderDate">Order Date *</label>
                    <input
                        type="date"
                        id="orderDate"
                        name="orderDate"
                        value={formData.orderDate}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="status">Status *</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                    >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                    </button>
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => navigate('/orders')}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
