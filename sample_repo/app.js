const logger = require('./utils/logger');
const Database = require('./utils/database');
const AuthService = require('./services/authService');
const UserService = require('./services/userService');
const OrderService = require('./services/orderService');
const PaymentService = require('./services/paymentService');
const UserController = require('./controllers/userController');
const OrderController = require('./controllers/orderController');

logger.info('Application starting...');

// Initialize database
const db = new Database({ host: 'localhost', port: 5432 });
db.connect();

// Initialize services with dependencies
logger.info('Initializing services...');
const authService = new AuthService(db);
const userService = new UserService(db, authService);
const orderService = new OrderService(db, userService);
const paymentService = new PaymentService(db, orderService);

// Initialize controllers
logger.info('Initializing controllers...');
const userController = new UserController(userService);
const orderController = new OrderController(orderService, paymentService);

// Example usage - create and call functions
logger.info('Running example workflows...');

try {
  // Register user
  const user = authService.register('john@example.com', 'John Doe', 'password123');
  logger.success('User registered', { userId: user.id });
  
  // Create order
  const items = [
    { name: 'Item 1', price: 100, quantity: 2 },
    { name: 'Item 2', price: 50, quantity: 1 }
  ];
  const total = orderService.calculateTotal(items);
  const order = orderService.createOrder(user.id, items, total);
  logger.success('Order created', { orderId: order.id });
  
  // Process payment
  const payment = paymentService.processPayment(order.id, total, 'credit_card');
  logger.success('Payment processed', { transactionId: payment.id });
  
  // Ship order
  orderService.shipOrder(order.id);
  logger.success('Order shipped');
  
  // List user orders
  const userOrders = orderService.listOrders(user.id);
  logger.info('User orders retrieved', { count: userOrders.length });
  
} catch (error) {
  logger.error('Error in workflows', { error: error.message });
}

module.exports = {
  db,
  authService,
  userService,
  orderService,
  paymentService,
  userController,
  orderController
};
