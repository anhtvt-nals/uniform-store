INSERT INTO settings (key, value, group_name, is_public, description)
VALUES
    ('store_address', '"Xưởng SX: 123 Đường Số 1, Quận 1, TP.HCM"', 'general', true, 'Contact address displayed in the storefront footer')
ON CONFLICT (key) DO NOTHING;
