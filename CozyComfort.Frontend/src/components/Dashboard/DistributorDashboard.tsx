import React, { useState, useEffect } from 'react';
import { InventoryAPI, Products, OrdersAPI } from '../../api/client';
import type { Inventory, Blanket, Distributor } from '../../types/models';
import NotificationList from '../Notifications/NotificationList';
import IncomingOrders from '../Orders/IncomingOrders';
import MyOrders from '../Orders/MyOrders'; // Import
import './DistributorDashboard.css';

interface Props {
    user: Distributor;
    currentUser: any;
}

const DistributorDashboard: React.FC<Props> = ({ user, currentUser }) => {
    const [activeTab, setActiveTab] = useState<'marketplace' | 'inventory' | 'orders' | 'my-orders' | 'notifications'>('marketplace');
    const [manufInventory, setManufInventory] = useState<Inventory[]>([]);
    const [myInventory, setMyInventory] = useState<Inventory[]>([]);
    const [products, setProducts] = useState<Blanket[]>([]);
    const [manufacturers, setManufacturers] = useState<{ [key: number]: string }>({});
    const [orderQuantity, setOrderQuantity] = useState<{ [key: number]: number }>({});

    useEffect(() => {
        loadData();
    }, [user.distributorId]);

    const loadData = async () => {
        try {
            console.log('DistributorDashboard.loadData: distributorId=', user.distributorId, 'userId=', currentUser.userId);
            const mInv = await InventoryAPI.listByRoleOnly('Manufacturer');
            console.log('Manufacturer inventory loaded:', mInv.length, 'items. OwnerIds:', [...new Set(mInv.map(i => i.ownerId))]);
            setManufInventory(mInv);
            const myInv = await InventoryAPI.listByRole('Distributor', user.distributorId);
            setMyInventory(myInv);
            const prodData = await Products.list();
            setProducts(prodData);

            // Fetch manufacturers to map names
            const manData = await import('../../api/client').then(m => m.Manufacturers.list());
            const manMap: { [key: number]: string } = {};
            manData.forEach(m => manMap[m.manufacturerId] = m.name);
            setManufacturers(manMap);
        } catch (error) {
            console.error(error);
        }
    };

    const handlePlaceOrder = async (item: Inventory) => {
        const qty = orderQuantity[item.inventoryId];
        if (!qty || qty <= 0) return alert("Please enter a valid quantity");
        if (qty > item.quantity) return alert("Not enough stock available");

        console.log('handlePlaceOrder: placing order with supplierId=', item.ownerId, 'blanketId=', item.blanketId, 'qty=', qty, 'userId=', currentUser.userId);

        try {
            const result = await OrdersAPI.create({
                blanketId: item.blanketId,
                quantity: qty,
                supplierId: item.ownerId,
                userId: currentUser.userId,
                orderType: 'DistributorToManufacturer',
                status: 'Pending',
                orderDate: new Date().toISOString(),
                totalPrice: qty * item.pricePerUnit
            });
            console.log('Order created successfully:', result);
            alert("Order placed successfully!");
            loadData();
            setOrderQuantity({ ...orderQuantity, [item.inventoryId]: 0 });
        } catch (error) {
            console.error('Failed to place order:', error);
            alert("Failed to place order");
        }
    };

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
                ownerId: user.distributorId,
                ownerRole: 'Distributor',
                location: user.address // assuming address as location
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
            <h2>Distributor Dashboard: {user.name}</h2>
            <div className="tabs">
                <button className={activeTab === 'marketplace' ? 'active' : ''} onClick={() => setActiveTab('marketplace')}>Marketplace</button>
                <button className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')}>My Inventory</button>
                <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>Incoming Orders</button>
                <button className={activeTab === 'my-orders' ? 'active' : ''} onClick={() => setActiveTab('my-orders')}>My Orders</button>
                <button className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>Notifications</button>
            </div>

            {activeTab === 'marketplace' && (
                <div>
                    <h3>📦 Manufacturer Marketplace</h3>
                    <div className="stock-grid">
                        {manufInventory.length === 0 ? (
                            <p className="card" style={{ textAlign: 'center', color: '#64748b' }}>No stocks currently available in the marketplace.</p>
                        ) : (
                            manufInventory
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
                                                    <span className="badge-manuf">
                                                        {manufacturers[item.ownerId] || `Supplier #${item.ownerId}`}
                                                    </span>
                                                </div>
                                                <div className="stock-card-body">
                                                    <p><span>Material:</span> <strong>{product?.material}</strong></p>
                                                    <p><span>Size:</span> <strong>{product?.size}</strong></p>
                                                    <p><span>Availability:</span> <strong>{item.quantity} units</strong></p>
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
            )}

            {activeTab === 'inventory' && (
                <div>
                    <h3>🏪 My Inventory</h3>

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
                                    <th>Material</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myInventory.length === 0 ? (
                                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>No products in your inventory</td></tr>
                                ) : (
                                    myInventory.map(item => {
                                        const product = products.find(p => p.blanketId === item.blanketId);
                                        return (
                                            <tr key={item.inventoryId}>
                                                <td><strong>{product?.modelName}</strong> <br /><small style={{ color: '#94a3b8' }}>{product?.size}</small></td>
                                                <td>{product?.material}</td>
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
            )}

            {activeTab === 'orders' && (
                <IncomingOrders supplierId={user.distributorId} role="Distributor" />
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

export default DistributorDashboard;
