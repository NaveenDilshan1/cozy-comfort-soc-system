import React, { useState, useEffect } from 'react';
import { InventoryAPI, Products, OrdersAPI, NotificationsAPI } from '../../api/client';
import type { Inventory, Blanket } from '../../types/models';
import MyOrders from '../Orders/MyOrders';
import NotificationList from '../Notifications/NotificationList';
import './CustomerDashboard.css';

interface Props {
    currentUser: any;
}

const CustomerDashboard: React.FC<Props> = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState<'shop' | 'orders' | 'notifications'>('shop');
    const [sellerInventory, setSellerInventory] = useState<Inventory[]>([]);
    const [products, setProducts] = useState<Blanket[]>([]);
    const [orderQuantity, setOrderQuantity] = useState<{ [key: number]: number }>({});
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        loadData();
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, [currentUser.userId]);

    const loadData = async () => {
        try {
            const sInv = await InventoryAPI.listByRoleOnly('Seller');
            setSellerInventory(sInv);
            const prodData = await Products.list();
            setProducts(prodData);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchNotifications = async () => {
        try {
            if (currentUser?.userId) {
                const notes = await NotificationsAPI.list(currentUser.userId);
                setUnreadCount(notes.filter(n => !n.isRead).length);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handlePurchase = async (item: Inventory) => {
        const qty = orderQuantity[item.inventoryId];
        if (!qty || qty <= 0) return alert("Please enter a valid quantity");
        if (qty > item.quantity) return alert("Not enough stock available");

        try {
            await OrdersAPI.create({
                blanketId: item.blanketId,
                quantity: qty,
                supplierId: item.ownerId, // Seller
                userId: currentUser.userId,
                orderType: 'Customer',
                status: 'Pending',
                orderDate: new Date().toISOString(),
                totalPrice: qty * item.pricePerUnit
            });
            alert("Order placed successfully!");
            loadData();
            setOrderQuantity({ ...orderQuantity, [item.inventoryId]: 0 });
        } catch (error) {
            console.error(error);
            alert("Failed to place order");
        }
    };

    return (
        <div className="dashboard-container">
            <h2>Welcome, {currentUser.username}! 🛍️</h2>
            <div className="tabs" style={{ marginBottom: '20px' }}>
                <button className={activeTab === 'shop' ? 'active' : ''} onClick={() => setActiveTab('shop')}>Shop Products</button>
                <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>My Orders</button>
                <button className={`${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
                    🔔 Notifications
                    {unreadCount > 0 && <span className="badge" style={{ marginLeft: '8px', background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '9999px', fontSize: '12px' }}>{unreadCount}</span>}
                </button>
            </div>

            {activeTab === 'shop' ? (
                <>
                    <h3 className="section-title">✨ Featured Products from Local Sellers</h3>
                    <div className="product-grid">
                        {sellerInventory.length === 0 ? (
                            <p className="no-products">No products are currently available. Check back soon!</p>
                        ) : (
                            sellerInventory
                                .filter(item => products.some(p => p.blanketId === item.blanketId))
                                .map(item => {
                                    const product = products.find(p => p.blanketId === item.blanketId);
                                    return (
                                        <div key={item.inventoryId} className="product-card">
                                            {product?.imageUrl ? (
                                                <img
                                                    src={`http://localhost:5250${product.imageUrl}`}
                                                    alt={product.modelName}
                                                    className="product-card-img"
                                                />
                                            ) : (
                                                <div className="product-card-no-img">No Preview</div>
                                            )}
                                            <div className="product-card-content">
                                                <div className="product-card-header">
                                                    <h4>{product?.modelName}</h4>
                                                    <span className="seller-badge">Verified Seller #{item.ownerId}</span>
                                                </div>
                                                <div className="product-details">
                                                    <p><span>Material:</span> <strong>{product?.material}</strong></p>
                                                    <p><span>Size:</span> <strong>{product?.size}</strong></p>
                                                    <p>
                                                        <span>Stock Status:</span>
                                                        <span className={`stock-tag ${item.quantity > 5 ? 'stock-high' : item.quantity > 0 ? 'stock-low' : 'stock-out'}`}>
                                                            {item.quantity > 0 ? `${item.quantity} in stock` : 'Out of Stock'}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="price-box">
                                                    <span className="price-text">${item.pricePerUnit}</span>
                                                    <span className="price-unit">/ item</span>
                                                </div>
                                            </div>
                                            <div className="product-card-footer">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={item.quantity}
                                                    value={orderQuantity[item.inventoryId] || ''}
                                                    onChange={(e) => setOrderQuantity({ ...orderQuantity, [item.inventoryId]: parseInt(e.target.value) })}
                                                    placeholder="Qty"
                                                    disabled={item.quantity === 0}
                                                />
                                                <button
                                                    onClick={() => handlePurchase(item)}
                                                    disabled={item.quantity === 0}
                                                    className="buy-btn"
                                                >
                                                    Purchase
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                        )}

                    </div>
                </>
            ) : activeTab === 'orders' ? (
                <MyOrders userId={currentUser.userId} />
            ) : (
                <NotificationList userId={currentUser.userId} />
            )}
        </div>
    );
};

export default CustomerDashboard;
