-- ============================================================================
-- Migration 017: Row Level Security Policies
-- ============================================================================

-- Stub auth.uid() for local dev (Supabase compatibility)
CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
BEGIN
    RETURN NULL::UUID;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on all user-facing tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Users: can read/update own profile
CREATE POLICY user_self_select ON users
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY user_self_update ON users
    FOR UPDATE USING (auth.uid() = id);

-- Addresses: can CRUD own addresses
CREATE POLICY address_own_all ON addresses
    FOR ALL USING (auth.uid() = user_id);

-- Carts: can read/update own carts
CREATE POLICY cart_own_select ON carts
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY cart_own_update ON carts
    FOR UPDATE USING (auth.uid() = user_id);

-- Cart items: via cart ownership
CREATE POLICY cart_item_own_all ON cart_items
    FOR ALL USING (
        cart_id IN (
            SELECT id FROM carts WHERE user_id = auth.uid()
        )
    );

-- Cart coupons: via cart ownership
CREATE POLICY cart_coupon_own_all ON cart_coupons
    FOR ALL USING (
        cart_id IN (
            SELECT id FROM carts WHERE user_id = auth.uid()
        )
    );

-- Orders: can read own orders
CREATE POLICY order_own_select ON orders
    FOR SELECT USING (auth.uid() = user_id);

-- Order items: via order ownership
CREATE POLICY order_item_own_select ON order_items
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders WHERE user_id = auth.uid()
        )
    );

-- Order addresses: via order ownership
CREATE POLICY order_addr_own_select ON order_addresses
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders WHERE user_id = auth.uid()
        )
    );

-- Order payments: via order ownership
CREATE POLICY order_payment_own_select ON order_payments
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders WHERE user_id = auth.uid()
        )
    );

-- Order history: via order ownership
CREATE POLICY order_history_own_select ON order_status_history
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders WHERE user_id = auth.uid()
        )
    );

-- Reviews: public read approved, own CRUD
CREATE POLICY review_public_select ON reviews
    FOR SELECT USING (is_approved = true AND deleted_at IS NULL);
CREATE POLICY review_own_insert ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY review_own_update ON reviews
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY review_own_delete ON reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Wishlists: own CRUD
CREATE POLICY wishlist_own_all ON wishlists
    FOR ALL USING (auth.uid() = user_id);
