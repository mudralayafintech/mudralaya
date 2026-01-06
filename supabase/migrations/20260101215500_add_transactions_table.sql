-- Create transactions table to log payments and prevent replay attacks
CREATE TABLE IF NOT EXISTS transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    amount numeric,
    currency text,
    type text,
    razorpay_order_id text UNIQUE NOT NULL,
    razorpay_payment_id text,
    status text DEFAULT 'success',
    created_at timestamptz DEFAULT now()
);

-- Index for faster lookups on order_id
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(razorpay_order_id);
