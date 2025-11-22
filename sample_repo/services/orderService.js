/**
 * Order Service - Order business logic
 */

const logger = require('../utils/logger');
const Order = require('../models/Order');

class OrderService {
  constructor(database, userService) {
    this.database = database;
    this.userService = userService;
    logger.info('OrderService initialized');
  }

  createOrder(userId, items, total) {
    logger.info('Creating new order', { userId, itemCount: items.length, total });
    
    const user = this.userService.getUser(userId);
    if (!user) {
      logger.error('User not found for order', { userId });
      throw new Error('User not found');
    }
    
    const order = new Order(Math.random(), userId, items, total);
    const savedOrder = this.database.insert('orders', order);
    
    logger.success('Order created successfully', { orderId: savedOrder.id, userId });
    
    return savedOrder;
  }

  getOrder(orderId) {
    logger.info('Fetching order', { orderId });
    
    const orders = this.database.query('orders');
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
      logger.warn('Order not found', { orderId });
      return null;
    }
    
    return order;
  }

  updateOrderStatus(orderId, status) {
    logger.info('Updating order status', { orderId, status });
    
    const order = this.getOrder(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    
    const updated = this.database.update('orders', orderId, { status });
    logger.success('Order status updated', { orderId, status });
    
    return updated;
  }

  shipOrder(orderId) {
    logger.info('Shipping order', { orderId });
    
    const updated = this.updateOrderStatus(orderId, 'shipped');
    logger.success('Order shipped', { orderId });
    
    return updated;
  }

  deliverOrder(orderId) {
    logger.info('Delivering order', { orderId });
    return this.updateOrderStatus(orderId, 'delivered');
  }

  calculateTotal(items) {
    logger.debug('Calculating order total', { itemCount: items.length });
    
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    logger.debug('Total calculated', { total });
    return total;
  }

  applyDiscount(orderId, discountPercent) {
    logger.info('Applying discount', { orderId, discountPercent });
    
    const order = this.getOrder(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    
    order.applyDiscount(discountPercent);
    const updated = this.database.update('orders', orderId, { total: order.total });
    
    logger.success('Discount applied', { orderId, discountPercent, newTotal: order.total });
    
    return updated;
  }

  listOrders(userId) {
    logger.info('Listing orders for user', { userId });
    
    const orders = this.database.query('orders').filter(o => o.userId === userId);
    logger.info('Orders listed', { count: orders.length, userId });
    
    return orders;
  }
}

module.exports = OrderService;
