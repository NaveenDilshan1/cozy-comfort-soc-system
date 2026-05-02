// TypeScript interfaces matching backend models

export interface User {
  userId: number;
  username: string;
  email: string;
  role: string;
  manufacturer?: Manufacturer;
  distributor?: Distributor;
  seller?: Seller;
}

export interface Blanket {
  blanketId: number;
  modelName: string;
  material: string;
  stockLevel: number;
  productionCapacity: number;
  size: string;
  imageUrl?: string;
}

export interface Distributor {
  distributorId: number;
  userId: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

export interface Seller {
  sellerId: number;
  userId: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
}

export interface Manufacturer {
  manufacturerId: number;
  userId: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
}

export interface Order {
  orderId: number;
  blanketId: number;
  quantity: number;
  orderDate: string;
  status: string;
  customerName: string;
  userId: number;
  supplierId?: number;
  orderType: string;
  totalPrice: number;
}

export interface Inventory {
  inventoryId: number;
  blanketId: number;
  location: string;
  quantity: number;
  lastUpdated: string;
  ownerId: number;
  ownerRole: string;
  pricePerUnit: number;
}

export interface Notification {
  notificationId: number;
  userId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: string;
}
