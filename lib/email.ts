import { Resend } from 'resend';
import { Order } from './types';

// Lazy init wrapper
const getResend = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
};

// Accessor for use within functions
const resend = getResend();

export async function sendOrderConfirmationEmail(order: Order, customerEmail: string) {
  console.log(`Sending order confirmation to: ${customerEmail} for order ${order.orderNumber}`);
  try {
    if (!resend) {
      console.warn("Resend not initialized - skipping email");
      return { success: false, error: "Resend not initialized" };
    }

    const { data, error } = await resend.emails.send({
      from: 'KSWebWear <orders@kswebwear.com.au>', // Use verified domain
      to: [customerEmail],
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #000; color: #fff; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .order-details { background: #fff; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .item { padding: 10px 0; border-bottom: 1px solid #eee; }
              .total { font-size: 18px; font-weight: bold; margin-top: 15px; }
              .address { margin-top: 20px; line-height: 1.4; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background-color: #000; 
                color: #fff; 
                text-decoration: none; 
                border-radius: 5px; 
                font-weight: bold;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Order Confirmed!</h1>
              </div>
              <div class="content">
                <p>Hi there,</p>
                <p>Thank you for your order! We've received it and are getting things ready.</p>
                
                <div class="order-details">
                  <h2>Order ${order.orderNumber}</h2>
                  <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  
                  <h3>Items:</h3>
                  ${order.items.map(item => `
                    <div class="item">
                      <strong>${item.name}</strong>
                      ${item.size ? `<br>Size: ${item.size}` : ''}
                      ${item.beadSize ? `<br>Bead Size: ${item.beadSize}` : ''}
                      ${item.color ? `<br>Color: ${item.color}` : ''}
                      <br>Quantity: ${item.quantity} × $${item.price.toFixed(2)}
                    </div>
                  `).join('')}
                  
                  <div class="total">
                    Total: $${order.totalAmount.toFixed(2)} AUD
                  </div>
                </div>
                
                <div class="order-details">
                  <h3>Shipping Address:</h3>
                  <div class="address">
                    ${order.shippingAddress.line1}<br>
                    ${order.shippingAddress.line2 ? `${order.shippingAddress.line2}<br>` : ''}
                    ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
                    ${order.shippingAddress.country}
                  </div>
                </div>
                
                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL}/account/orders" class="button">View Order Status</a>
                </div>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} KSWebWear. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error (customer):', error);
      return { success: false, error };
    }

    console.log(`Order confirmation sent successfully: ${order.orderNumber}`);
    return { success: true, data };
  } catch (error) {
    console.error('Exception sending customer email:', error);
    return { success: false, error };
  }
}

export async function sendAdminOrderNotification(order: Order) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@kswebwear.com.au';
  console.log(`Sending admin notification to: ${adminEmail} for order ${order.orderNumber}`);
  try {
    if (!resend) {
      console.warn("Resend not initialized - skipping admin email");
      return { success: false, error: "Resend not initialized" };
    }

    const { data, error } = await resend.emails.send({
      from: 'KSWebWear <orders@kswebwear.com.au>', // Use verified domain
      to: [adminEmail],
      subject: `New Order: ${order.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif;">
            <h2>New Order Received</h2>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Total:</strong> $${order.totalAmount.toFixed(2)}</p>
            <p><strong>Items:</strong> ${order.items.length}</p>
            <p><strong>Customer:</strong> ${order.shippingAddress.line1}, ${order.shippingAddress.city}</p>
            <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/orders">View in Admin Dashboard</a></p>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error (admin):', error);
      return { success: false, error };
    }

    console.log(`Admin notification sent successfully: ${order.orderNumber}`);
    return { success: true, data };
  } catch (error) {
    console.error('Exception sending admin notification:', error);
    return { success: false, error };
  }
}
export async function sendOrderStatusUpdateEmail(order: Order, customerEmail: string) {
  try {
    if (!resend) {
      console.warn("Resend not initialized - skipping status email");
      return { success: false, error: "Resend not initialized" };
    }

    const { data, error } = await resend.emails.send({
      from: 'KSWebWear <orders@kswebwear.com.au>',
      to: [customerEmail],
      subject: `Order Update: ${order.orderNumber} is now ${order.status.toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #000;">Order Status Update</h1>
              <p>Hello,</p>
              <p>The status of your order <strong>${order.orderNumber}</strong> has been updated to: <span style="font-weight: bold; text-transform: uppercase; color: #000;">${order.status}</span></p>
              
              <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
                <p><strong>Items:</strong> ${order.items.length}</p>
              </div>

              <p>You can view your order history and track shipments in your dashboard.</p>
              <p>Thank you for shopping with us!</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #666; text-align: center;">© ${new Date().getFullYear()} KSWebWear. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending status update email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending status update email:', error);
    return { success: false, error };
  }
}
