-- Migration: Add Order Tracking Fields and History Table
-- This migration updates the orders table and creates the order_tracking_history table.

-- 1. Modify the existing order_status check constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_order_status_check 
  CHECK (order_status IN (
    'pending_payment', 'payment_confirmed', 'order_confirmed', 
    'jewellery_preparing', 'quality_check', 'packed', 'shipped', 
    'out_for_delivery', 'delivered', 'cancelled', 'returned', 
    'refund_initiated', 'refund_completed', 
    'pending', 'confirmed', 'processing', 'refunded' -- Legacy ones kept for safety
  ));

-- 2. Add new columns to orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS courier_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS shipment_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- 3. Create order_tracking_history table
CREATE TABLE IF NOT EXISTS order_tracking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Enable RLS on order_tracking_history
ALTER TABLE order_tracking_history ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for order_tracking_history
-- Users can view tracking history of their own orders
CREATE POLICY "Users can view tracking history of their own orders"
  ON order_tracking_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_tracking_history.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Admins can manage tracking history (Assuming admin check logic is similar to others, or true if superuser)
-- Typically handled by backend logic using service role key, but if needed via client:
CREATE POLICY "Admins can manage tracking history"
  ON order_tracking_history FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.auth_id = auth.uid() AND admin_users.is_active = true
    )
  );
