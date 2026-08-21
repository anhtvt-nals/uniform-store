INSERT INTO banners (title, subtitle, image_url, position, is_active, sort_order)
VALUES
 ('{"vi":"NÂNG TẦM\\nTHƯƠNG HIỆU","en":"ELEVATE\\nYOUR BRAND","de":"STARKE\\nMARKE"}', '{"vi":"Giải pháp đồng phục chuyên nghiệp, hiện đại và chất lượng cao, giúp doanh nghiệp tự tin tỏa sáng."}', 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1000&auto=format&fit=crop', 'hero', true, 1),
 ('{"vi":"CHẤT LIỆU\\nCAO CẤP","en":"PREMIUM\\nMATERIALS","de":"HOCHWERTIGE\\nMATERIALIEN"}', '{"vi":"Đa dạng các loại vải từ tiêu chuẩn đến cao cấp, độ bền cao, thấm hút mồ hôi, đứng form dáng."}', 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=80&w=1000&auto=format&fit=crop', 'hero', true, 2),
 ('{"vi":"SÁNG TẠO &\\nTHOẢI MÁI","en":"CREATIVE &\\nCOMFORTABLE","de":"KREATIV &\\nKOMFORTABEL"}', '{"vi":"Thiết kế thời trang, tính ứng dụng cao, mang lại sự năng động cho nhân viên trong mọi hoàn cảnh."}', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop', 'hero', true, 3)
ON CONFLICT DO NOTHING;
