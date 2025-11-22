/**
 * Order Model - Represents a customer order with items and pricing
 */
class Order {
  constructor(id, userId, items, total) {
    this.id = id;
    this.userId = userId;
    this.items = items;
    this.total = total;
    this.status = 'pending';
    this.discount = 0;
    this.tax = 0;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  calculateTax(taxRate = 0.1) {
    this.tax = this.total * taxRate;
    return this.tax;
  }

  applyDiscount(discountPercent) {
    if (discountPercent < 0 || discountPercent > 100) {
      throw new Error('Invalid discount percent');
    }
    this.discount = (this.total * discountPercent) / 100;
    this.total = this.total - this.discount;
    this.updatedAt = new Date();
  }

  markAsShipped() {
    this.status = 'shipped';
    this.shippedAt = new Date();
    this.updatedAt = new Date();
  }

  markAsDelivered() {
    this.status = 'delivered';
    this.deliveredAt = new Date();
    this.updatedAt = new Date();
  }

  cancel() {
    if (this.status === 'shipped' || this.status === 'delivered') {
      throw new Error('Cannot cancel shipped or delivered order');
    }
    this.status = 'cancelled';
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      items: this.items,
      total: this.total,
      discount: this.discount,
      tax: this.calculateTax(),
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Order;
