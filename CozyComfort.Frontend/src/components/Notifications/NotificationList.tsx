import React, { useEffect, useState } from 'react';
import { NotificationsAPI } from '../../api/client';
import type { Notification } from '../../types/models';
import './NotificationList.css';

interface Props {
    userId: number;
}

const NotificationList: React.FC<Props> = ({ userId }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const fetchNotifications = async () => {
        if (!userId) return;
        try {
            const data = await NotificationsAPI.list(userId);
            setNotifications(data);
        } catch (error) {
            console.error("Failed to load notifications", error);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await NotificationsAPI.markRead(id);
            setNotifications(notifications.map(n => n.notificationId === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    useEffect(() => {
        if (userId) fetchNotifications();
        const interval = setInterval(() => {
            if (userId) fetchNotifications();
        }, 10000);
        return () => clearInterval(interval);
    }, [userId]);

    return (
        <div className="notification-list">
            <h3>Notifications</h3>
            {notifications.length === 0 ? <p>No notifications.</p> : (
                <ul>
                    {notifications.map(n => (
                        <li key={n.notificationId} className={`notification-item ${n.isRead ? 'read' : 'unread'}`}>
                            <p>{n.message}</p>
                            <div className="notification-meta">
                                <span className="timestamp">{new Date(n.createdAt).toLocaleString()}</span>
                                {!n.isRead && <button onClick={() => markAsRead(n.notificationId)}>Mark as Read</button>}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NotificationList;
