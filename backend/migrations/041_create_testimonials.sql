CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content jsonb NOT NULL,
  author jsonb NOT NULL,
  role jsonb NOT NULL DEFAULT '{}'::jsonb,
  avatar_url text NOT NULL DEFAULT '',
  rating smallint NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_active_order ON testimonials (is_active, sort_order, created_at);

INSERT INTO testimonials (content, author, role, avatar_url, sort_order)
SELECT * FROM (VALUES
  ('{"vi":"Chất lượng áo xuất sắc, form dáng chuẩn và hình in rất sắc nét. Đội ngũ tư vấn nhiệt tình, giao hàng đúng hẹn. Chắc chắn sẽ hợp tác lâu dài với Minh An Uniform."}'::jsonb, '{"vi":"Nguyễn Văn A"}'::jsonb, '{"vi":"Giám đốc nhân sự - Vingroup"}'::jsonb, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', 1),
  ('{"vi":"Chúng tôi rất hài lòng với mẫu áo thun sự kiện do Minh An sản xuất. Vải mát, không xù lông sau nhiều lần giặt. Các bạn nhân viên mặc đều khen ngợi."}'::jsonb, '{"vi":"Trần Thị B"}'::jsonb, '{"vi":"Trưởng phòng Marketing - Techcombank"}'::jsonb, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', 2),
  ('{"vi":"Thiết kế nhanh chóng, hỗ trợ lên ý tưởng tận tình. Sản phẩm thực tế đẹp hơn mong đợi. Giá cả lại rất cạnh tranh so với thị trường."}'::jsonb, '{"vi":"Lê Hoàng C"}'::jsonb, '{"vi":"CEO - Startup Việt"}'::jsonb, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop', 3)
) AS seed(content, author, role, avatar_url, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM testimonials);
