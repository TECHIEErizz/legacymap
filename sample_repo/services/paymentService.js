/**
 * Payment Service - Payment processing
 */

const logger = require('../utils/logger');

class PaymentService {
  constructor(database, orderService) {
    this.database = database;
    this.orderService = orderService;
    logger.info('PaymentService initialized');
  }

  processPayment(orderId, amount, paymentMethod) {
    logger.info('Processing payment', { orderId, amount, paymentMethod });
    
    const order = this.orderService.getOrder(orderId);
    if (!order) {
      logger.error('Order not found for payment', { orderId });
      throw new Error('Order not found');
    }
    
    if (amount < order.total) {
      logger.warn('Payment amount insufficient', { orderId, amount, required: order.total });
      throw new Error('Insufficient payment amount');
    }
    
    const transactionId = this.generateTransactionId();
    const payment = {
      id: transactionId,
      orderId,
      amount,
      method: paymentMethod,
      status: 'completed',
      processedAt: new Date()
    };
    
    this.database.insert('payments', payment);
    
    this.orderService.updateOrderStatus(orderId, 'paid');
    logger.success('Payment processed successfully', { orderId, transactionId, amount });
    
    return payment;
  }

  generateTransactionId() {
    const id = 'TXN_' + Math.random().toString(36).substring(2, 9).toUpperCase();
    logger.debug('Generated transaction ID', { id });
    return id;
  }

  refundPayment(transactionId) {
    logger.info('Processing refund', { transactionId });
    
    const payments = this.database.query('payments');
    const payment = payments.find(p => p.id === transactionId);
    
    if (!payment) {
      logger.error('Payment not found for refund', { transactionId });
      throw new Error('Payment not found');
    }
    
    const refund = {
      ...payment,
      status: 'refunded',
      refundedAt: new Date()
    };
    
    this.database.update('payments', transactionId, refund);
    logger.success('Refund processed successfully', { transactionId, amount: payment.amount });
    
    return refund;
  }

  validatePaymentMethod(method) {
    logger.debug('Validating payment method', { method });
    
    const validMethods = ['credit_card', 'debit_card', 'paypal', 'bank_transfer'];
    const valid = validMethods.includes(method);
    
    if (!valid) {
      logger.warn('Invalid payment method', { method });
    }
    
    return valid;
  }

  getPaymentStatus(transactionId) {
    logger.info('Fetching payment status', { transactionId });
    
    const payments = this.database.query('payments');
    const payment = payments.find(p => p.id === transactionId);
    
    return payment ? payment.status : null;
  }
}

module.exports = PaymentService;
