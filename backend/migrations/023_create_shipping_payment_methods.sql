-- ============================================================================
-- Migration 023: Shipping & Payment Methods
-- ============================================================================

CREATE TABLE shipping_methods (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code              TEXT NOT NULL UNIQUE,     -- 'standard', 'express'
    name              JSONB NOT NULL,           -- {en, vi, de}
    description       JSONB NOT NULL DEFAULT '{}',
    price             INTEGER NOT NULL DEFAULT 0,  -- cents
    tax_rate          DECIMAL NOT NULL DEFAULT 0,
    min_order_amount  INTEGER NOT NULL DEFAULT 0,  -- free shipping threshold, 0 = no minimum
    is_active         BOOLEAN NOT NULL DEFAULT true,
    sort_order        INTEGER NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payment_methods (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        TEXT NOT NULL UNIQUE,           -- 'cod', 'bank_transfer', 'momo', 'vnpay'
    name        JSONB NOT NULL,                 -- {en, vi, de}
    description JSONB NOT NULL DEFAULT '{}',
    is_active   BOOLEAN NOT NULL DEFAULT true,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed shipping methods
INSERT INTO shipping_methods (id, code, name, description, price, tax_rate, min_order_amount, is_active, sort_order) VALUES
    ('e0000000-0000-0000-0000-000000000001', 'standard',
     '{"en": "Standard Shipping", "vi": "Giao Hàng Tiêu Chuẩn", "de": "Standardversand"}',
     '{"en": "Delivery in 5-7 business days", "vi": "Giao hàng trong 5-7 ngày làm việc", "de": "Lieferung in 5-7 Werktagen"}',
     30000, 0, 500000, true, 1),
    ('e0000000-0000-0000-0000-000000000002', 'express',
     '{"en": "Express Shipping", "vi": "Giao Hàng Nhanh", "de": "Expressversand"}',
     '{"en": "Delivery in 1-2 business days", "vi": "Giao hàng trong 1-2 ngày làm việc", "de": "Lieferung in 1-2 Werktagen"}',
     80000, 0, 0, true, 2);

-- Seed payment methods
INSERT INTO payment_methods (id, code, name, description, is_active, sort_order) VALUES
    ('f0000000-0000-0000-0000-000000000001', 'cod',
     '{"en": "Cash on Delivery", "vi": "Thanh Toán Khi Nhận Hàng", "de": "Zahlung bei Lieferung"}',
     '{"en": "Pay in cash when you receive your order", "vi": "Thanh toán bằng tiền mặt khi nhận hàng", "de": "Barzahlung bei Erhalt"}',
     true, 1),
    ('f0000000-0000-0000-0000-000000000002', 'bank_transfer',
     '{"en": "Bank Transfer", "vi": "Chuyển Khoản Ngân Hàng", "de": "Überweisung"}',
     '{"en": "Transfer payment to our bank account", "vi": "Chuyển khoản thanh toán vào tài khoản ngân hàng của chúng tôi", "de": "Überweisung auf unser Bankkonto"}',
     true, 2),
    ('f0000000-0000-0000-0000-000000000003', 'momo',
     '{"en": "Momo E-Wallet", "vi": "Ví Momo", "de": "Momo Wallet"}',
     '{"en": "Pay with Momo e-wallet", "vi": "Thanh toán bằng ví Momo", "de": "Zahlung mit Momo-Wallet"}',
     true, 3),
    ('f0000000-0000-0000-0000-000000000004', 'vnpay',
     '{"en": "VNPay QR", "vi": "VNPay QR", "de": "VNPay QR"}',
     '{"en": "Pay with VNPay QR code", "vi": "Thanh toán bằng mã QR VNPay", "de": "Zahlung mit VNPay QR-Code"}',
     true, 4);

CREATE INDEX idx_shipping_methods_active ON shipping_methods(is_active) WHERE is_active = true;
CREATE INDEX idx_payment_methods_active ON payment_methods(is_active) WHERE is_active = true;
