-- ============================================================================
-- Migration 018: Seed Data (dev/staging only)
-- ============================================================================

-- Default admin user (password: admin123 — change in production)
-- bcrypt hash for 'admin123': $2b$10$...
INSERT INTO admin_users (id, email, password_hash, role) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'admin@uniformstore.com', '$2b$10$dmN1EGh30UoiblJKpSdjw.OoUj.AzLUc2JbSowbFE3n6SteSZ3.pW', 'super_admin');

-- Roles
INSERT INTO roles (id, name, description) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'super_admin', 'Full system access'),
    ('a0000000-0000-0000-0000-000000000002', 'admin', 'Admin access'),
    ('a0000000-0000-0000-0000-000000000003', 'editor', 'Content editor'),
    ('a0000000-0000-0000-0000-000000000004', 'customer', 'Standard customer');

-- Brands
INSERT INTO brands (id, name, slug, is_active, sort_order) VALUES
    ('b0000000-0000-0000-0000-000000000001', '{"en": "Minh An Uniform", "vi": "Đồng Phục Minh An", "de": "Minh An Uniform"}', 'minh-an-uniform', true, 1),
    ('b0000000-0000-0000-0000-000000000002', '{"en": "ProWork", "vi": "ProWork", "de": "ProWork"}', 'prowork', true, 2),
    ('b0000000-0000-0000-0000-000000000003', '{"en": "SafeGuard", "vi": "SafeGuard", "de": "SafeGuard"}', 'safeguard', true, 3);

-- Categories
INSERT INTO categories (id, parent_id, name, slug, is_active, sort_order) VALUES
    ('c0000000-0000-0000-0000-000000000001', NULL, '{"en": "Uniforms", "vi": "Đồng Phục", "de": "Uniformen"}', 'uniforms', true, 1),
    ('c0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', '{"en": "T-Shirts", "vi": "Áo Thun", "de": "T-Shirts"}', 't-shirts', true, 1),
    ('c0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', '{"en": "Dress Shirts", "vi": "Áo Sơ Mi", "de": "Hemden"}', 'dress-shirts', true, 2),
    ('c0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', '{"en": "Work Pants", "vi": "Quần Công Sở", "de": "Arbeits-hosen"}', 'work-pants', true, 3),
    ('c0000000-0000-0000-0000-000000000005', NULL, '{"en": "Safety Wear", "vi": "Quần Áo Bảo Hộ", "de": "Schutzkleidung"}', 'safety-wear', true, 2),
    ('c0000000-0000-0000-0000-000000000006', NULL, '{"en": "Accessories", "vi": "Phụ Kiện", "de": "Zubehör"}', 'accessories', true, 3);

-- Default settings
INSERT INTO settings (key, value, group_name, is_public, description) VALUES
    ('store_name', '"Minh An Uniform"', 'general', true, 'Store display name'),
    ('store_email', '"info@minhanuniform.vn"', 'general', true, 'Contact email'),
    ('store_phone', '"+84 28 1234 5678"', 'general', true, 'Contact phone'),
    ('currency_code', '"VND"', 'commerce', true, 'Default currency'),
    ('tax_rate', '10', 'commerce', false, 'Default tax rate %'),
    ('free_shipping_min', '"500000"', 'shipping', true, 'Min order for free shipping (cents)'),
    ('low_stock_threshold', '5', 'inventory', false, 'Default low stock alert level');
