import * as dotenv from 'dotenv';
import * as path from 'path';
import {Client} from 'pg';

dotenv.config({path: path.resolve(__dirname, '../../.env')});

type LocalizedText = Record<'vi' | 'en' | 'de', string>;
type ArticleSeed = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: string;
  category: string;
  tags: string[];
  featured: boolean;
  publishedOffset: number;
};

const localized = (value: string): LocalizedText => ({vi: value, en: value, de: value});
const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=85`;

const articles: ArticleSeed[] = [
  {
    slug: 'kinh-nghiem-chon-dong-phuc-cong-so-chuyen-nghiep',
    title: 'Kinh nghiệm chọn đồng phục công sở chuyên nghiệp cho doanh nghiệp',
    excerpt: 'Cách cân bằng nhận diện thương hiệu, sự thoải mái và ngân sách khi đặt may đồng phục công sở.',
    imageUrl: image('photo-1521737711867-e3b97375f902'),
    author: 'Minh An Uniform', category: 'kien-thuc-dong-phuc', tags: ['dong-phuc-cong-so', 'chat-lieu-vai'], featured: true, publishedOffset: 1,
    content: `<h2>Đồng phục là một phần của trải nghiệm thương hiệu</h2><p>Với doanh nghiệp Việt Nam, đồng phục công sở không chỉ giúp đội ngũ trông chỉn chu hơn mà còn tạo cảm giác tin cậy trong mỗi lần gặp khách hàng. Một thiết kế tốt cần phù hợp với công việc hằng ngày, nhận diện thương hiệu và vóc dáng đa dạng của nhân sự.</p><h3>Ưu tiên chất liệu trước khi chọn kiểu dáng</h3><p>Khí hậu nóng ẩm khiến các chất liệu thoáng, thấm hút như cotton, cotton pha polyester hoặc bamboo trở thành lựa chọn an toàn. Với vị trí phải di chuyển nhiều, nên chọn vải ít nhăn và có độ co giãn nhẹ để áo luôn giữ phom trong ngày dài.</p><h3>Giữ màu thương hiệu ở những điểm vừa đủ</h3><p>Không nhất thiết toàn bộ áo phải dùng màu logo. Cổ áo, bo tay, đường viền, nút áo hoặc thêu logo ngực trái là những điểm nhấn tinh tế. Trước khi chốt số lượng lớn, hãy may mẫu để kiểm tra màu vải dưới ánh sáng thực tế và cảm giác mặc của nhân viên.</p><p>Một bộ đồng phục bền, dễ bảo quản và phù hợp văn hóa nội bộ sẽ được sử dụng thường xuyên hơn, từ đó tạo hiệu quả nhận diện lâu dài.</p>`,
  },
  {
    slug: 'dong-phuc-khach-san-tieu-chuan-dich-vu-chuyen-nghiep',
    title: 'Đồng phục khách sạn: Tiêu chuẩn dịch vụ bắt đầu từ diện mạo',
    excerpt: 'Gợi ý chọn đồng phục cho lễ tân, buồng phòng, nhà hàng và bếp để nâng cao trải nghiệm khách lưu trú.',
    imageUrl: image('photo-1566073771259-6a8506099945'),
    author: 'Minh An Uniform', category: 'dong-phuc-nganh-nghe', tags: ['dong-phuc-khach-san', 'dich-vu'], featured: true, publishedOffset: 3,
    content: `<h2>Mỗi bộ phận cần một ngôn ngữ trang phục riêng</h2><p>Trong khách sạn, đồng phục là chi tiết đầu tiên giúp khách nhận biết vai trò của nhân viên. Lễ tân cần vẻ thanh lịch, đội ngũ nhà hàng cần gọn gàng, còn buồng phòng và bếp cần ưu tiên độ bền, dễ vận động và dễ vệ sinh.</p><h3>Lễ tân và nhà hàng: ưu tiên hình ảnh</h3><p>Áo sơ mi, vest nhẹ hoặc đầm đồng phục nên sử dụng bảng màu đồng nhất với không gian thương hiệu. Phom dáng vừa vặn, đường may sắc nét và bảng tên rõ ràng sẽ giúp nhân viên tự tin khi tiếp đón khách.</p><h3>Buồng phòng và bếp: ưu tiên công năng</h3><p>Nhân viên làm việc liên tục nên cần vải thoáng, ít bám bẩn và dễ giặt. Áo bếp cần chịu nhiệt, có thiết kế tiện dụng; đồng phục buồng phòng nên có túi đủ dùng và độ co giãn phù hợp các thao tác vận động.</p><p>Việc thống nhất tiêu chuẩn đồng phục giúp khách sạn vận hành chuyên nghiệp hơn và tạo một hành trình dịch vụ liền mạch cho khách lưu trú.</p>`,
  },
  {
    slug: 'ao-polo-dong-phuc-giai-phap-linh-hoat-cho-doi-ngu-ban-hang',
    title: 'Áo polo đồng phục – giải pháp linh hoạt cho đội ngũ bán hàng',
    excerpt: 'Vì sao áo polo luôn là lựa chọn phổ biến cho nhân viên showroom, sự kiện và các đội ngũ ngoài thị trường?',
    imageUrl: image('photo-1521572163474-6864f9cf17ab'),
    author: 'Minh An Uniform', category: 'xu-huong-dong-phuc', tags: ['ao-polo', 'dong-phuc-su-kien'], featured: true, publishedOffset: 5,
    content: `<h2>Thoải mái như áo thun, chỉn chu hơn khi gặp khách hàng</h2><p>Áo polo là lựa chọn quen thuộc của các doanh nghiệp vì dễ mặc, phù hợp nhiều độ tuổi và có thể sử dụng trong cả môi trường văn phòng lẫn hoạt động ngoài trời. Phần cổ áo tạo cảm giác lịch sự hơn áo thun cổ tròn nhưng vẫn giữ được sự năng động.</p><h3>Chọn vải theo bối cảnh sử dụng</h3><p>Polo cá sấu cotton phù hợp đội ngũ thường xuyên tiếp xúc khách hàng nhờ bề mặt đứng phom. Polo poly hoặc cá sấu thể thao phù hợp sự kiện, bán hàng lưu động vì nhanh khô và ít nhăn. Nếu ưu tiên cảm giác mềm mát, có thể cân nhắc cotton pha bamboo.</p><h3>Thiết kế logo dễ nhận diện</h3><p>Logo thêu ngực trái là phương án bền và tinh tế cho số lượng sử dụng dài hạn. Với chương trình ngắn ngày, in lụa hoặc in chuyển nhiệt giúp linh hoạt hơn về màu sắc và thông điệp ở lưng áo.</p><p>Hãy thống nhất bảng size và duyệt mẫu in/thêu trước khi sản xuất để đồng phục lên form đồng đều cho toàn đội ngũ.</p>`,
  },
  {
    slug: 'cach-chon-chat-lieu-vai-dong-phuc-phu-hop-khi-hau-viet-nam',
    title: 'Cách chọn chất liệu vải đồng phục phù hợp khí hậu Việt Nam',
    excerpt: 'So sánh cotton, kate, kaki, thun cá sấu và bamboo để doanh nghiệp chọn đúng vải cho từng vị trí.',
    imageUrl: image('photo-1558618666-fcd25c85cd64'),
    author: 'Minh An Uniform', category: 'kien-thuc-dong-phuc', tags: ['chat-lieu-vai', 'tu-van-dat-may'], featured: false, publishedOffset: 7,
    content: `<h2>Không có một loại vải phù hợp cho mọi công việc</h2><p>Thời tiết Việt Nam thay đổi theo vùng và đặc thù công việc cũng rất khác nhau. Vì vậy, việc chọn chất liệu đồng phục nên bắt đầu bằng câu hỏi: nhân viên làm việc trong điều hòa, ngoài trời hay cần vận động nhiều?</p><h3>Những lựa chọn phổ biến</h3><p>Cotton có ưu điểm mềm và thấm hút tốt, thích hợp áo thun và áo polo. Kate thường được dùng cho sơ mi nhờ bề mặt mịn, dễ ủi. Kaki bền, đứng phom, phù hợp quần, áo khoác và đồng phục kỹ thuật. Vải bamboo tạo cảm giác mát, mềm và phù hợp những mẫu cần sự cao cấp.</p><h3>Đừng bỏ qua thử nghiệm thực tế</h3><p>Một mẫu vải đẹp trên bảng màu có thể cho cảm giác khác khi mặc. Doanh nghiệp nên kiểm tra độ dày, độ co giãn, độ xuyên thấu và khả năng giữ màu sau giặt. May mẫu trước khi đặt số lượng lớn là cách đơn giản để giảm rủi ro.</p><p>Chất liệu phù hợp giúp nhân viên thoải mái hơn, đồng thời kéo dài vòng đời của bộ đồng phục.</p>`,
  },
  {
    slug: 'quy-trinh-dat-may-dong-phuc-doanh-nghiep-tu-a-den-z',
    title: 'Quy trình đặt may đồng phục doanh nghiệp từ A đến Z',
    excerpt: 'Các bước doanh nghiệp cần chuẩn bị để đặt may đồng phục đúng tiến độ và hạn chế phát sinh.',
    imageUrl: image('photo-1454165804606-c3d57bc86b40'),
    author: 'Minh An Uniform', category: 'tu-van-dat-may', tags: ['tu-van-dat-may', 'thiet-ke-dong-phuc'], featured: false, publishedOffset: 10,
    content: `<h2>Chuẩn bị rõ từ đầu để tiết kiệm thời gian</h2><p>Một đơn hàng đồng phục suôn sẻ thường bắt đầu bằng thông tin đầy đủ: số lượng dự kiến, vị trí sử dụng, thời điểm cần nhận hàng, bảng màu thương hiệu và ngân sách. Những dữ liệu này giúp đơn vị may tư vấn đúng chất liệu và kỹ thuật in thêu ngay từ đầu.</p><h3>Từ ý tưởng đến mẫu duyệt</h3><p>Sau khi thống nhất nhu cầu, đội ngũ thiết kế sẽ lên bản vẽ hoặc mockup. Doanh nghiệp nên chốt logo, vị trí in thêu, màu sắc và bảng size trước khi may mẫu. Với đơn hàng từ 100 sản phẩm, mẫu thực tế đặc biệt quan trọng để đánh giá form dáng, chất liệu và độ sắc nét của logo.</p><h3>Sản xuất và bàn giao</h3><p>Khi mẫu được duyệt, đơn hàng đi vào sản xuất hàng loạt và kiểm tra chất lượng theo từng công đoạn. Trước ngày giao, doanh nghiệp cần xác nhận đầu mối nhận hàng, số lượng phân bổ theo phòng ban và phương án đóng gói để việc phát đồng phục diễn ra nhanh chóng.</p><p>Lập kế hoạch sớm luôn là cách tốt nhất để có sản phẩm đẹp, đúng hẹn và kiểm soát ngân sách.</p>`,
  },
  {
    slug: 'bao-quan-dong-phuc-de-giu-mau-va-phom-dang-ben-lau',
    title: 'Mẹo bảo quản đồng phục để giữ màu và phom dáng bền lâu',
    excerpt: 'Những lưu ý đơn giản khi giặt, phơi và ủi giúp đồng phục luôn sạch đẹp trong quá trình sử dụng.',
    imageUrl: image('photo-1517677208171-0bc6725a3e60'),
    author: 'Minh An Uniform', category: 'kien-thuc-dong-phuc', tags: ['bao-quan-dong-phuc', 'chat-lieu-vai'], featured: false, publishedOffset: 14,
    content: `<h2>Bảo quản đúng giúp đồng phục luôn chuyên nghiệp</h2><p>Đồng phục thường được mặc nhiều lần mỗi tuần, vì vậy cách giặt và phơi ảnh hưởng trực tiếp đến màu sắc, phom áo và chi tiết in thêu. Một vài thói quen đơn giản sẽ giúp sản phẩm bền hơn đáng kể.</p><h3>Giặt nhẹ và lộn trái áo</h3><p>Nên phân loại theo màu, lộn trái trước khi giặt và dùng nước mát hoặc ấm nhẹ. Với áo có hình in, hạn chế chà xát trực tiếp lên bề mặt in và tránh ngâm quá lâu trong chất tẩy mạnh. Khóa kéo, cúc áo nên được cài lại để giảm ma sát với các trang phục khác.</p><h3>Phơi và ủi đúng cách</h3><p>Phơi ở nơi thoáng gió, tránh nắng gắt kéo dài vì tia nắng có thể làm vải bạc màu. Khi ủi, hãy điều chỉnh nhiệt theo nhãn hướng dẫn và không ủi trực tiếp lên logo in. Áo sơ mi và vest nên treo bằng móc phù hợp để giữ vai áo luôn đẹp.</p><p>Chăm sóc đồng phục đúng cách vừa bảo vệ hình ảnh doanh nghiệp, vừa giảm chi phí thay mới định kỳ.</p>`,
  },
];

const categories = [
  ['kien-thuc-dong-phuc', 'Kiến thức đồng phục'],
  ['dong-phuc-nganh-nghe', 'Đồng phục ngành nghề'],
  ['xu-huong-dong-phuc', 'Xu hướng đồng phục'],
  ['tu-van-dat-may', 'Tư vấn đặt may'],
] as const;

const tags = [
  ['dong-phuc-cong-so', 'Đồng phục công sở'], ['chat-lieu-vai', 'Chất liệu vải'],
  ['dong-phuc-khach-san', 'Đồng phục khách sạn'], ['dich-vu', 'Ngành dịch vụ'],
  ['ao-polo', 'Áo polo'], ['dong-phuc-su-kien', 'Đồng phục sự kiện'],
  ['tu-van-dat-may', 'Tư vấn đặt may'], ['thiet-ke-dong-phuc', 'Thiết kế đồng phục'],
  ['bao-quan-dong-phuc', 'Bảo quản đồng phục'],
] as const;

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required to seed demo articles.');
  const client = new Client({connectionString: process.env.DATABASE_URL, ssl: process.env.DB_SSL === 'true' ? {rejectUnauthorized: false} : undefined});
  await client.connect();

  try {
    await client.query('BEGIN');
    const categoryIds = new Map<string, string>();
    const tagIds = new Map<string, string>();

    for (const [index, [slug, name]] of categories.entries()) {
      const {rows: [row]} = await client.query<{id: string}>(
        `INSERT INTO article_categories (slug, name, description, is_active, sort_order)
         VALUES ($1, $2, $3, true, $4)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = true, sort_order = EXCLUDED.sort_order, deleted_at = NULL, updated_at = now()
         RETURNING id`, [slug, localized(name), localized(`Bài viết ${name.toLowerCase()} của Minh An Uniform.`), index + 1],
      );
      categoryIds.set(slug, row.id);
    }

    for (const [slug, name] of tags) {
      const {rows: [row]} = await client.query<{id: string}>(
        `INSERT INTO article_tags (slug, name) VALUES ($1, $2)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`, [slug, localized(name)],
      );
      tagIds.set(slug, row.id);
    }

    for (const article of articles) {
      const {rows: [row]} = await client.query<{id: string}>(
        `INSERT INTO articles (slug, title, content, excerpt, image_url, author, is_featured, is_published, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true, now() - ($8 * interval '1 day'))
         ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, excerpt = EXCLUDED.excerpt, image_url = EXCLUDED.image_url, author = EXCLUDED.author, is_featured = EXCLUDED.is_featured, is_published = true, published_at = EXCLUDED.published_at, deleted_at = NULL, updated_at = now()
         RETURNING id`, [article.slug, localized(article.title), localized(article.content), localized(article.excerpt), article.imageUrl, article.author, article.featured, article.publishedOffset],
      );
      await client.query('DELETE FROM article_category_map WHERE article_id = $1', [row.id]);
      await client.query('DELETE FROM article_tag_map WHERE article_id = $1', [row.id]);
      await client.query('INSERT INTO article_category_map (article_id, category_id) VALUES ($1, $2)', [row.id, categoryIds.get(article.category)]);
      for (const tag of article.tags) {
        await client.query('INSERT INTO article_tag_map (article_id, tag_id) VALUES ($1, $2)', [row.id, tagIds.get(tag)]);
      }
    }

    await client.query('COMMIT');
    console.log('✅ Seeded 6 Vietnamese demo articles with thumbnails, categories, and tags.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error: Error) => {
  console.error('❌ Demo article seed failed:', error.message);
  process.exit(1);
});
