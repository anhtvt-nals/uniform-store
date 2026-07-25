INSERT INTO settings (key, value, group_name, is_public, description)
VALUES
    ('facebook_url', '"https://facebook.com/minhanuniform"', 'general', true, 'Facebook page URL'),
    ('zalo_url', '"https://zalo.me/0901234567"', 'general', true, 'Zalo chat URL')
ON CONFLICT (key) DO NOTHING;
