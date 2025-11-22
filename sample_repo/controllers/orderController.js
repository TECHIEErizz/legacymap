const logger = require('../utils/logger');
const OrderService = require('../services/orderService');
const PaymentService = require('../services/paymentService');

class OrderController {
  constructor(orderService, paymentService) {
    this.orderService = orderService;
    this.paymentService = paymentService;
    logger.info('OrderController initialized');
  }

  createOrder(req, res) {
    try {
      const { userId, items } = req.body;
      const total = this.orderService.calculateTotal(items);
      const order = this.orderService.createOrder(userId, items, total);
      res.json({ success: true, data: order });
    } catch (error) {
      logger.error('Create order failed', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  getOrder(req, res) {
    try {
      const order = this.orderService.getOrder(req.params.id);
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
      res.json({ success: true, data: order });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  processPayment(req, res) {
    try {
      const { amount, method } = req.body;
      if (!this.paymentService.validatePaymentMethod(method)) {
        throw new Error('Invalid payment method');
      }
      const payment = this.paymentService.processPayment(req.params.id, amount, method);
      res.json({ success: true, data: payment });
    } catch (error) {
      logger.error('Payment failed', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  shipOrder(req, res) {
    try {
      const order = this.orderService.shipOrder(req.params.id);
      res.json({ success: true, data: order });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  applyDiscount(req, res) {
    try {
      const { discountPercent } = req.body;
      const order = this.orderService.applyDiscount(req.params.id, discountPercent);
      res.json({ success: true, data: order });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = OrderController;
