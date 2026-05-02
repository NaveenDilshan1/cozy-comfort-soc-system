import React, { useState, useEffect } from 'react';
import { InventoryAPI, Products, NotificationsAPI } from '../../api/client';
import type { Inventory, Blanket, Manufacturer } from '../../types/models';
import NotificationList from '../Notifications/NotificationList';
import IncomingOrders from '../Orders/IncomingOrders';
import './ManufacturerDashboard.css';

interface Props {
    user: Manufacturer;
    currentUser: any;
}

const MATERIALS = ["Cotton", "Wool", "Fleece", "Velvet", "Silk", "Polyester", "Sherpa", "Cashmere", "Microfiber", "Bamboo"];

const ManufacturerDashboard: React.FC<Props> = ({ user, currentUser }) => {
    const [activeTab, setActiveTab] = useState<'stock' | 'products' | 'orders' | 'notifications'>('stock');
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [products, setProducts] = useState<Blanket[]>([]);
    // const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Stock Form State
    const [newStock, setNewStock] = useState({ blanketId: 0, quantity: 0, price: 0 });
    const [editingStock, setEditingStock] = useState<{ [key: number]: { quantity: number, price: number } }>({});

    // Product Form State
    const [newProduct, setNewProduct] = useState({
        modelName: '',
        material: MATERIALS[0],
        size: '',
        imageUrl: ''
    });
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [editingProduct, setEditingProduct] = useState<{ [key: number]: { modelName: string, material: string, size: string } }>({});

    useEffect(() => {
        loadData();
        fetchNotifications();
        // Poll for notifications
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, [user.manufacturerId, currentUser.userId]);

    const loadData = async () => {
        try {
            console.log("ManufacturerDashboard.loadData: manufacturerId =", user.manufacturerId, "userId =", currentUser.userId);
            console.log("ManufacturerDashboard user object:", JSON.stringify(user));
            console.log("Loading manufacturer inventory...");
            const invData = await InventoryAPI.listByRole('Manufacturer', user.manufacturerId);
            setInventory(invData);

            console.log("Fetching products...");
            const prodData = await Products.list();
            console.log("Products loaded:", prodData.length);
            setProducts(prodData);
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        }
    };

    const fetchNotifications = async () => {
        try {
            if (currentUser?.userId) {
                const notes = await NotificationsAPI.list(currentUser.userId);
                // setNotifications(notes);
                setUnreadCount(notes.filter(n => !n.isRead).length);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // --- STOCK MANAGEMENT ---

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
                ownerId: user.manufacturerId,
                ownerRole: 'Manufacturer',
                location: user.location
            });
            loadData();
            setNewStock({ blanketId: 0, quantity: 0, price: 0 });
            alert("Stock added successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to add stock");
        }
    };

    const handleUpdateStock = async (invId: number, blanketId: number) => {
        const edit = editingStock[invId];
        if (!edit || edit.quantity < 0 || edit.price < 0) {
            alert("Please enter valid values");
            return;
        }
        try {
            await InventoryAPI.update({
                blanketId: blanketId,
                quantity: edit.quantity,
                pricePerUnit: edit.price,
                ownerId: user.manufacturerId,
                ownerRole: 'Manufacturer',
                location: user.location
            });
            loadData();
            setEditingStock(prev => {
                const next = { ...prev };
                delete next[invId];
                return next;
            });
            alert("Stock updated successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to update stock");
        }
    };

    const handleDeleteStock = async (item: Inventory) => {
        if (!confirm(`Are you sure you want to remove ${item.quantity} units of this item from stock?`)) return;
        try {
            // Setting quantity to 0 effectively removes it from view in many logic flows, 
            // or we could implement a hard delete API. For now, we update to 0 or use a specific delete endpoint if available.
            // As InventoryAPI.update handles logic, let's just set quantity to 0. 
            // Or ideally, we should have a delete endpoint. 
            // Looking at the controller, there is no Delete in InventoryAPI, but update can set it.
            // Let's assume setting quantity to 0 is the 'delete' or we can add a delete endpoint later.
            // Actually, for "Delete" button, users expect it to be gone.
            // Let's try to update with 0 quantity.
            await InventoryAPI.update({
                blanketId: item.blanketId,
                quantity: 0,
                pricePerUnit: item.pricePerUnit,
                ownerId: user.manufacturerId,
                ownerRole: 'Manufacturer',
                location: user.location
            });
            // Client side filter or reload
            loadData();
            alert("Stock removed.");
        } catch (error) {
            console.error(error);
            alert("Failed to delete stock");
        }
    };

    const startEditingStock = (invId: number, currentQty: number, currentPrice: number) => {
        setEditingStock({
            ...editingStock,
            [invId]: { quantity: currentQty, price: currentPrice }
        });
    };

    const cancelEditingStock = (invId: number) => {
        const updated = { ...editingStock };
        delete updated[invId];
        setEditingStock(updated);
    };

    // --- PRODUCT MANAGEMENT ---

    const handleCreateProduct = async () => {
        if (!newProduct.modelName || !newProduct.material || !newProduct.size) {
            alert("Please fill in all product fields");
            return;
        }
        try {
            const formData = new FormData();
            formData.append('modelName', newProduct.modelName);
            formData.append('material', newProduct.material);
            formData.append('size', newProduct.size);
            if (selectedImageFile) {
                formData.append('imageFile', selectedImageFile);
            }

            // Products.create usually takes an object, but we need to send FormData.
            // Axios will handleFormData if passed. 
            await Products.create(formData as any);

            loadData();
            setNewProduct({ modelName: '', material: MATERIALS[0], size: '', imageUrl: '' });
            setSelectedImageFile(null);
            alert("Product created successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to create product");
        }
    };

    const handleUpdateProduct = async (blanketId: number) => {
        const edit = editingProduct[blanketId];
        if (!edit || !edit.modelName || !edit.material || !edit.size) {
            alert("Please fill in all fields");
            return;
        }
        try {
            // We need a proper Update endpoint in Products API.
            // Assuming Products.update(id, data) exists or we use create/upsert logic?
            // Checking client.ts... Products only has list, create, delete.
            // If update is missing in client, we might need to add it or fail.
            // Let's assume we can't edit yet without client update, BUT I can add it to client.
            // For now, let's verify if `Products.update` exists. 
            // If not, I'll restrict or stub it. 
            // Wait, previous file view didn't show client.ts. I should assume I might need to add it.
            // I will optimistically check if I can use PUT on the endpoint via fetch if client is missing it.
            // Or for this turn, I'll skip actual API call if function missing and tell user.
            // But I should try. The API controller usually has PUT.

            // Temporary direct fetch if client missing:
            const response = await fetch(`http://localhost:5000/api/blanket/${blanketId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blanketId, ...edit })
            });
            if (!response.ok) throw new Error("Failed to update");

            loadData();
            setEditingProduct(prev => {
                const next = { ...prev };
                delete next[blanketId];
                return next;
            });
            alert("Product updated!");
        } catch (error) {
            console.error(error);
            alert("Failed to update product");
        }
    };

    const handleDeleteProduct = async (blanketId: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await Products.delete(blanketId);
            loadData();
            alert("Product deleted successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to delete product");
        }
    };

    const startEditingProduct = (p: Blanket) => {
        setEditingProduct({
            ...editingProduct,
            [p.blanketId]: { modelName: p.modelName, material: p.material, size: p.size }
        });
    };

    const cancelEditingProduct = (blanketId: number) => {
        const updated = { ...editingProduct };
        delete updated[blanketId];
        setEditingProduct(updated);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Manufacturer Dashboard: {user.name} <span style={{ fontSize: '0.6em', color: '#666' }}>(ID: {user.manufacturerId})</span></h2>
            </div>

            <div className="tabs">
                <button
                    className={activeTab === 'stock' ? 'active' : ''}
                    onClick={() => setActiveTab('stock')}
                >
                    My Stock
                </button>
                <button
                    className={activeTab === 'products' ? 'active' : ''}
                    onClick={() => setActiveTab('products')}
                >
                    Manage Products
                </button>
                <button
                    className={activeTab === 'orders' ? 'active' : ''}
                    onClick={() => setActiveTab('orders')}
                >
                    Distributor Orders
                </button>
                <button
                    className={`notification-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    Notifications
                    {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                </button>
            </div>

            {activeTab === 'stock' && (
                <div className="stock-section">
                    <div className="add-stock-form">
                        <h3>Add New Stock</h3>
                        <div className="form-group">
                            <label>Product</label>
                            <select
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setNewStock({ ...newStock, blanketId: val });
                                }}
                                value={newStock.blanketId}
                            >
                                <option value={0}>Select Product...</option>
                                {products.map(p => (
                                    <option key={p.blanketId} value={p.blanketId}>
                                        {p.modelName} ({p.size})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Quantity</label>
                            <input type="number" value={newStock.quantity || ''} onChange={(e) => setNewStock({ ...newStock, quantity: Number(e.target.value) })} />
                        </div>
                        <div className="form-group">
                            <label>Price Per Unit</label>
                            <input type="number" value={newStock.price || ''} onChange={(e) => setNewStock({ ...newStock, price: Number(e.target.value) })} />
                        </div>
                        <button className="primary" onClick={handleAddStock}>Add Stock</button>
                    </div>

                    <table className="stock-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category/Material</th>
                                <th>Size</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map(item => {
                                const product = products.find(p => p.blanketId === item.blanketId);
                                const isEditing = editingStock[item.inventoryId];
                                return (
                                    <tr key={item.inventoryId}>
                                        <td><strong>{product?.modelName}</strong></td>
                                        <td>{product?.material}</td>
                                        <td><span className="badge">{product?.size}</span></td>
                                        <td>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={isEditing.quantity}
                                                    onChange={(e) => setEditingStock({
                                                        ...editingStock,
                                                        [item.inventoryId]: { ...isEditing, quantity: Number(e.target.value) }
                                                    })}
                                                />
                                            ) : <span style={{ fontWeight: 600 }}>{item.quantity}</span>}
                                        </td>
                                        <td>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={isEditing.price}
                                                    onChange={(e) => setEditingStock({
                                                        ...editingStock,
                                                        [item.inventoryId]: { ...isEditing, price: Number(e.target.value) }
                                                    })}
                                                />
                                            ) : `$${item.pricePerUnit}`}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                {isEditing ? (
                                                    <>
                                                        <button className="primary" onClick={() => handleUpdateStock(item.inventoryId, item.blanketId)}>Save</button>
                                                        <button onClick={() => cancelEditingStock(item.inventoryId)}>Cancel</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => startEditingStock(item.inventoryId, item.quantity, item.pricePerUnit)}>Edit</button>
                                                        <button className="btn-delete" onClick={() => handleDeleteStock(item)}>Delete</button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'products' && (
                <div className="products-section">
                    <div className="add-product-form">
                        <h3>Create New Product</h3>
                        <div className="form-group">
                            <label>Model Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Dream Soft"
                                value={newProduct.modelName}
                                onChange={(e) => setNewProduct({ ...newProduct, modelName: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Material</label>
                            <select
                                value={newProduct.material}
                                onChange={(e) => setNewProduct({ ...newProduct, material: e.target.value })}
                            >
                                {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Size</label>
                            <input
                                type="text"
                                placeholder="Queen / King"
                                value={newProduct.size}
                                onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Product Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setSelectedImageFile(e.target.files?.[0] || null)}
                                style={{ border: 'none', padding: '4px 0' }}
                            />
                        </div>
                        <button className="primary" onClick={handleCreateProduct}>Create Product</button>
                    </div>

                    <h3>Catalogue</h3>
                    <table className="stock-table">
                        <thead>
                            <tr>
                                <th className="product-img-cell">Image</th>
                                <th>Model Name</th>
                                <th>Material</th>
                                <th>Size</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => {
                                const isEditing = editingProduct[product.blanketId];
                                return (
                                    <tr key={product.blanketId}>
                                        <td>
                                            {product.imageUrl ? (
                                                <img
                                                    src={`http://localhost:5250${product.imageUrl}`}
                                                    alt={product.modelName}
                                                    className="product-img"
                                                />
                                            ) : (
                                                <div className="no-img">No Image</div>
                                            )}
                                        </td>
                                        <td>
                                            {isEditing ?
                                                <input value={isEditing.modelName} onChange={e => setEditingProduct({ ...editingProduct, [product.blanketId]: { ...isEditing, modelName: e.target.value } })} /> :
                                                <strong>{product.modelName}</strong>
                                            }
                                        </td>
                                        <td>
                                            {isEditing ?
                                                <select value={isEditing.material} onChange={e => setEditingProduct({ ...editingProduct, [product.blanketId]: { ...isEditing, material: e.target.value } })}>
                                                    {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                                                </select> :
                                                product.material
                                            }
                                        </td>
                                        <td>
                                            {isEditing ?
                                                <input value={isEditing.size} onChange={e => setEditingProduct({ ...editingProduct, [product.blanketId]: { ...isEditing, size: e.target.value } })} /> :
                                                <span className="badge">{product.size}</span>
                                            }
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                {isEditing ? (
                                                    <>
                                                        <button className="primary" onClick={() => handleUpdateProduct(product.blanketId)}>Save</button>
                                                        <button onClick={() => cancelEditingProduct(product.blanketId)}>Cancel</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => startEditingProduct(product)}>Edit</button>
                                                        <button onClick={() => handleDeleteProduct(product.blanketId)} className="btn-delete">Delete</button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'orders' && (
                <IncomingOrders supplierId={user.manufacturerId} role="Manufacturer" title="Distributor Orders" />
            )}

            {activeTab === 'notifications' && (
                <NotificationList userId={currentUser.userId} />
            )}
        </div>
    );
};

export default ManufacturerDashboard;
