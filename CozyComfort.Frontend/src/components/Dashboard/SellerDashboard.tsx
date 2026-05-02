import React, { useState, useEffect } from 'react';
import { InventoryAPI, Products, OrdersAPI } from '../../api/client';
import type { Inventory, Blanket, Seller } from '../../types/models';
import NotificationList from '../Notifications/NotificationList';
import IncomingOrders from '../Orders/IncomingOrders';
import MyOrders from '../Orders/MyOrders'; // Import
import './SellerDashboard.css';

interface Props {
    user: Seller;
    currentUser: any;
}

const SellerDashboard: React.FC<Props> = ({ user, currentUser }) => {
    const [activeTab, setActiveTab] = useState<'marketplace' | 'orders' | 'my-orders' | 'notifications'>('marketplace');
    const [distInventory, setDistInventory] = useState<Inventory[]>([]);
    const [myInventory, setMyInventory] = useState<Inventory[]>([]);
    const [products, setProducts] = useState<Blanket[]>([]);
    const [orderQuantity, setOrderQuantity] = useState<{ [key: number]: number }>({});

    useEffect(() => {
        loadData();
    }, [user.sellerId]);

    const loadData = async () => {
        try {
            const dInv = await InventoryAPI.listByRoleOnly('Distributor');
            setDistInventory(dInv);
            const myInv = await InventoryAPI.listByRole('Seller', user.sellerId);
            setMyInventory(myInv);
            const prodData = await Products.list();
            setProducts(prodData);
        } catch (error) {
            console.error(error);
        }
    };

    const handlePlaceOrder = async (item: Inventory) => {
        const qty = orderQuantity[item.inventoryId];
        if (!qty || qty <= 0) return alert("Please enter a valid quantity");
        if (qty > item.quantity) return alert("Not enough stock available");

        try {
            await OrdersAPI.create({
                blanketId: item.blanketId,
                quantity: qty,
                supplierId: item.ownerId,
                userId: currentUser.userId,
                orderType: 'SellerToDistributor',
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

    // --- STOCK MANAGEMENT ---
    const [newStock, setNewStock] = useState({ blanketId: 0, quantity: 0, price: 0 });

    const handleAddStock = async () => {
        if (newStock.blanketId === 0 || newStock.quantity <= 0 || newStock.price <= 0) {
            alert("Please fill in all fields with valid values");
            return;
        }
        try {
            await InventoryAPI.update({
                blanketId: newStock.blanketId,
                quantity: newStock.quantity,
                pricePerUnit: newStock.price,
                ownerId: user.sellerId,
                ownerRole: 'Seller',
                location: user.location // Seller uses 'location'
            });
            loadData();
            setNewStock({ blanketId: 0, quantity: 0, price: 0 });
            alert("Stock added successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to add stock");
        }
    };

    return (
        <div className="dashboard-container">
            <h2>Seller Dashboard: {user.name}</h2>
            <div className="tabs">
                <button className={activeTab === 'marketplace' ? 'active' : ''} onClick={() => setActiveTab('marketplace')}>Marketplace & My Stock</button>
                <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>Incoming Orders</button>
                <button className={activeTab === 'my-orders' ? 'active' : ''} onClick={() => setActiveTab('my-orders')}>My Orders</button>
                <button className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>Notifications</button>
            </div>

            {activeTab === 'marketplace' && (
                <div className="split-view">
                    {/* Left Panel - Distributor Stock */}
                    <div className="panel-left">
                        <h3>📦 Distributor Marketplace</h3>
                        <div className="stock-grid">
                            {distInventory.length === 0 ? (
                                <p className="card" style={{ textAlign: 'center', color: '#64748b' }}>No distributor stock currently available.</p>
                            ) : (
                                distInventory
                                    .filter(item => products.some(p => p.blanketId === item.blanketId))
                                    .map(item => {
                                        const product = products.find(p => p.blanketId === item.blanketId);
                                        return (
                                            <div key={item.inventoryId} className="stock-card">
                                                {product?.imageUrl ? (
                                                    <img
                                                        src={`http://localhost:5250${product.imageUrl}`}
                                                        alt={product.modelName}
                                                        className="stock-card-img"
                                                    />
                                                ) : (
                                                    <div className="stock-card-no-img">No Preview Available</div>
                                                )}
                                                <div className="stock-card-content">
                                                    <div className="stock-card-header">
                                                        <h4>{product?.modelName}</h4>
                                                        <span className="badge-dist">Dist #{item.ownerId}</span>
                                                    </div>
                                                    <div className="stock-card-body">
                                                        <p><span>Material:</span> <strong>{product?.material}</strong></p>
                                                        <p><span>Size:</span> <strong>{product?.size}</strong></p>
                                                        <p><span>Available:</span> <strong>{item.quantity} units</strong></p>
                                                        <span className="price-tag">${item.pricePerUnit}</span>
                                                    </div>
                                                </div>
                                                <div className="stock-card-footer">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={item.quantity}
                                                        value={orderQuantity[item.inventoryId] || ''}
                                                        onChange={(e) => setOrderQuantity({ ...orderQuantity, [item.inventoryId]: parseInt(e.target.value) })}
                                                        placeholder="Qty"
                                                    />
                                                    <button className="primary" onClick={() => handlePlaceOrder(item)}>Place Order</button>
                                                </div>
                                            </div>
                                        );
                                    })
                            )}

                        </div>
                    </div>

                    {/* Right Panel - My Stock */}
                    <div className="panel-right">
                        <h3>🏪 My Shop Stock</h3>

                        <div className="add-stock-card">
                            <h4>Manually Adjust Stock</h4>
                            <div className="form-row">
                                <select
                                    value={newStock.blanketId}
                                    onChange={(e) => setNewStock({ ...newStock, blanketId: Number(e.target.value) })}
                                >
                                    <option value={0}>Select Product...</option>
                                    {products.map(p => (
                                        <option key={p.blanketId} value={p.blanketId}>
                                            {p.modelName} ({p.size})
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    placeholder="Qty"
                                    value={newStock.quantity || ''}
                                    onChange={(e) => setNewStock({ ...newStock, quantity: Number(e.target.value) })}
                                />
                                <input
                                    type="number"
                                    placeholder="Price"
                                    value={newStock.price || ''}
                                    onChange={(e) => setNewStock({ ...newStock, price: Number(e.target.value) })}
                                />
                                <button
                                    className="primary"
                                    onClick={handleAddStock}
                                    style={{ gridColumn: 'span 1' }}
                                >
                                    Update
                                </button>
                            </div>
                        </div>

                        <div className="inventory-list-card">
                            <table className="inventory-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myInventory.length === 0 ? (
                                        <tr><td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>No items in your shop inventory</td></tr>
                                    ) : (
                                        myInventory.map(item => {
                                            const product = products.find(p => p.blanketId === item.blanketId);
                                            return (
                                                <tr key={item.inventoryId}>
                                                    <td><strong>{product?.modelName}</strong> <br /><small style={{ color: '#94a3b8' }}>{product?.size}</small></td>
                                                    <td><span className="badge" style={{ background: '#f1f5f9', color: '#1e293b' }}>{item.quantity}</span></td>
                                                    <td><strong>${item.pricePerUnit}</strong></td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <IncomingOrders supplierId={user.sellerId} role="Seller" />
            )}

            {activeTab === 'my-orders' && (
                <MyOrders userId={currentUser.userId} />
            )}

            {activeTab === 'notifications' && (
                <NotificationList userId={currentUser.userId} />
            )}
        </div>
    );
};

export default SellerDashboard;
