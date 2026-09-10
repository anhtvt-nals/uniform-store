-- Site-wide SEO settings, editable from Admin > Cài đặt.
INSERT INTO settings (key, value, group_name, is_public, description)
VALUES
    ('seo_site_title', '"Minh An Uniform"', 'seo', true, 'Tên website, dùng làm hậu tố cho tiêu đề trang'),
    ('seo_home_title', '"Đồng phục Minh An | Thiết kế & may đồng phục doanh nghiệp"', 'seo', true, 'Thẻ title cho trang chủ'),
    ('seo_home_description', '"Minh An Uniform chuyên thiết kế, sản xuất đồng phục doanh nghiệp chất lượng cao theo yêu cầu."', 'seo', true, 'Thẻ meta description cho trang chủ (khuyến nghị 150–160 ký tự)'),
    ('seo_keywords', '"đồng phục, đồng phục doanh nghiệp, may đồng phục, Minh An Uniform"', 'seo', true, 'Từ khóa SEO, ngăn cách bằng dấu phẩy'),
    ('seo_og_image', '""', 'seo', true, 'URL ảnh dùng khi chia sẻ trang trên Facebook, Zalo và các mạng xã hội')
ON CONFLICT (key) DO NOTHING;
