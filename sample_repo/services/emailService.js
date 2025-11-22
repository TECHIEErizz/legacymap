/**
 * Email Service - Send email notifications (Legacy Code)
 */

const logger = require('./logger');

class EmailService {
  constructor() {
    logger.info('EmailService initialized');
    this.emailQueue = [];
  }

  sendWelcomeEmail(user) {
    logger.info('Sending welcome email', { email: user.email });
    try {
      const emailContent = this.generateWelcomeContent(user);
      this.queueEmail(user.email, 'Welcome!', emailContent);
      logger.success('Welcome email queued', { email: user.email });
    } catch (error) {
      logger.error('Failed to send welcome email', { email: user.email });
      this.handleEmailError(error);
    }
  }

  sendUpdateNotification(userId, updates) {
    logger.info('Sending update notification', { userId });
    try {
      const content = this.generateUpdateContent(userId, updates);
      this.queueEmail(`user_${userId}@legacy.local`, 'Profile Updated', content);
      logger.success('Update notification queued', { userId });
    } catch (error) {
      logger.error('Failed to send update notification', { userId });
      this.handleEmailError(error);
    }
  }

  sendFarewellEmail(user) {
    logger.info('Sending farewell email', { email: user.email });
    try {
      const content = this.generateFarewellContent(user);
      this.queueEmail(user.email, 'Account Deleted', content);
      logger.success('Farewell email queued', { email: user.email });
    } catch (error) {
      logger.error('Failed to send farewell email', { email: user.email });
    }
  }

  generateWelcomeContent(user) {
    logger.info('Generating welcome email content');
    return `Welcome ${user.name}! Your account has been created.`;
  }

  generateUpdateContent(userId, updates) {
    logger.info('Generating update email content', { userId });
    return `Your profile has been updated with new information.`;
  }

  generateFarewellContent(user) {
    logger.info('Generating farewell email content');
    return `We\'re sad to see you go, ${user.name}!`;
  }

  queueEmail(email, subject, content) {
    logger.info('Queueing email', { email, subject });
    this.emailQueue.push({
      email,
      subject,
      content,
      timestamp: new Date()
    });
  }

  processQueue() {
    logger.info('Processing email queue', { count: this.emailQueue.length });
    this.emailQueue.forEach(email => {
      this.sendEmail(email.email, email.subject, email.content);
    });
    this.emailQueue = [];
  }

  sendEmail(email, subject, content) {
    logger.info('Sending email', { email, subject });
    logger.success('Email sent successfully', { email });
  }

  handleEmailError(error) {
    logger.error('Email service error', { message: error.message });
  }
}

module.exports = new EmailService();
