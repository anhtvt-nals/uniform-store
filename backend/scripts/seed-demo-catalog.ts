import * as dotenv from 'dotenv';
import * as path from 'path';
import {Client} from 'pg';

dotenv.config({path: path.resolve(__dirname, '../../.env')});

type Text = Record<'vi' | 'en' | 'de', string>;
type Product = {slug: string; name: string; price: number; image: string};
type Category = {slug: string; name: string; description: string; image: string; products: Product[]};

const text = (vi: string, en = vi, de = en): Text => ({vi, en, de});
const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`;
const products = (items: Array<[string, string, number, string]>): Product[] =>
  items.map(([slug, name, price, imageId]) => ({slug, name, price, image: image(imageId)}));

const categories: Category[] = [
  {
    slug: 'dong-phuc-cong-so', name: 'Đồng phục công sở',
    description: 'Thiết kế chỉn chu, đồng bộ hình ảnh thương hiệu cho đội ngũ văn phòng.',
    image: image('photo-1521737711867-e3b97375f902'),
    products: products([
      ['ao-so-mi-cong-so-nu', 'Áo sơ mi công sở nữ', 24500000, 'photo-1598032895397-b9472444bf93'],
      ['ao-so-mi-cong-so-nam', 'Áo sơ mi công sở nam', 26500000, 'photo-1617127365659-c47fa864d8bc'],
      ['ao-blazer-nu-doanh-nghiep', 'Áo blazer nữ doanh nghiệp', 68000000, 'photo-1581044777550-4cfa60707c03'],
      ['ao-vest-nam-doanh-nghiep', 'Áo vest nam doanh nghiệp', 89000000, 'photo-1507679799987-c73779587ccf'],
      ['chan-vay-cong-so', 'Chân váy công sở', 28500000, 'photo-1551028719-00167b16eac5'],
      ['quan-tay-cong-so', 'Quần tây công sở', 32500000, 'photo-1473966968600-fa801b869a1a'],
    ]),
  },
  {
    slug: 'dong-phuc-khach-san', name: 'Đồng phục khách sạn',
    description: 'Trang phục chuyên nghiệp cho lễ tân, buồng phòng và đội ngũ dịch vụ khách sạn.',
    image: image('photo-1566073771259-6a8506099945'),
    products: products([
      ['ao-le-tan-nu-khach-san', 'Áo lễ tân nữ khách sạn', 42000000, 'photo-1566665797739-1674de7a421a'],
      ['ao-le-tan-nam-khach-san', 'Áo lễ tân nam khách sạn', 44500000, 'photo-1610652492500-ded49ceeb378'],
      ['dong-phuc-buong-phong', 'Đồng phục buồng phòng', 29500000, 'photo-1581578731548-c64695cc6952'],
      ['dong-phuc-phuc-vu-nha-hang', 'Đồng phục phục vụ nhà hàng', 31000000, 'photo-1577219491135-ce391730fb2c'],
      ['dong-phuc-bep-khach-san', 'Đồng phục bếp khách sạn', 35500000, 'photo-1600891964092-4316c288032e'],
      ['dong-phuc-bellman', 'Đồng phục bellman', 49500000, 'photo-1542314831-068cd1dbfeeb'],
    ]),
  },
  {
    slug: 'dong-phuc-ao-polo', name: 'Đồng phục áo Polo',
    description: 'Áo polo đa dụng, thoải mái và dễ nhận diện cho đội ngũ bán hàng, sự kiện.',
    image: image('photo-1521572163474-6864f9cf17ab'),
    products: products([
      ['ao-polo-cotton-premium', 'Áo Polo Cotton Premium', 19500000, 'photo-1523381210434-271e8be1f52b'],
      ['ao-polo-cafe', 'Áo Polo nhân viên cafe', 18500000, 'photo-1576566588028-4147f3842f27'],
      ['ao-polo-golf', 'Áo Polo Golf doanh nghiệp', 23500000, 'photo-1598033129183-c4f50c736f10'],
      ['ao-polo-the-thao', 'Áo Polo thể thao', 21000000, 'photo-1517836357463-d25dfeac3438'],
      ['ao-polo-su-kien', 'Áo Polo sự kiện', 17500000, 'photo-1529156069898-49953e39b3ac'],
      ['ao-polo-eco', 'Áo Polo Eco', 22500000, 'photo-1618354691373-d851c5c3a990'],
    ]),
  },
];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required to seed the demo catalog.');
  const client = new Client({connectionString: process.env.DATABASE_URL, ssl: process.env.DB_SSL === 'true' ? {rejectUnauthorized: false} : undefined});
  await client.connect();
  try {
    await client.query('BEGIN');
    for (const [categoryIndex, category] of categories.entries()) {
      const categoryName = text(category.name);
      const categoryDescription = text(category.description);
      const {rows: [categoryRow]} = await client.query<{id: string}>(
        `INSERT INTO categories (name, slug, description, image_url, is_active, sort_order)
         VALUES ($1, $2, $3, $4, true, $5)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, image_url = EXCLUDED.image_url, is_active = true, sort_order = EXCLUDED.sort_order, deleted_at = NULL, updated_at = now()
         RETURNING id`, [categoryName, category.slug, categoryDescription, category.image, categoryIndex + 1],
      );
      for (const [productIndex, product] of category.products.entries()) {
        const productName = text(product.name);
        const description = text(`${product.name} may theo nhận diện thương hiệu, chất liệu bền đẹp và thoải mái.`);
        const sku = `DEMO-${categoryIndex + 1}-${String(productIndex + 1).padStart(2, '0')}`;
        const {rows: [productRow]} = await client.query<{id: string}>(
          `INSERT INTO products (category_id, name, slug, description, sort_description, detail, sku, base_price, tax_rate, is_active, is_featured, weight, meta_title, meta_desc)
           VALUES ($1, $2, $3, $4, $4, $4, $5, $6, 0, true, $7, 300, $2, $4)
           ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, name = EXCLUDED.name, description = EXCLUDED.description, sort_description = EXCLUDED.sort_description, detail = EXCLUDED.detail, sku = EXCLUDED.sku, base_price = EXCLUDED.base_price, is_active = true, is_featured = EXCLUDED.is_featured, meta_title = EXCLUDED.meta_title, meta_desc = EXCLUDED.meta_desc, deleted_at = NULL, updated_at = now()
           RETURNING id`, [categoryRow.id, productName, product.slug, description, sku, product.price, productIndex < 2],
        );
        await client.query(
          `INSERT INTO product_variants (product_id, name, sku, barcode, price, tax_rate, weight, is_active, sort_order)
           VALUES ($1, $2, $3, '', $4, 0, 300, true, 0)
           ON CONFLICT (sku) DO UPDATE SET product_id = EXCLUDED.product_id, name = EXCLUDED.name, price = EXCLUDED.price, is_active = true, deleted_at = NULL, updated_at = now()`,
          [productRow.id, productName, `${sku}-STD`, product.price],
        );
        const {rows: [seedImage]} = await client.query<{id: string}>(`SELECT id FROM product_images WHERE product_id = $1 AND alt @> '{"seed":"demo-catalog"}'::jsonb LIMIT 1`, [productRow.id]);
        const alt = {...productName, seed: 'demo-catalog'};
        if (seedImage) await client.query(`UPDATE product_images SET url = CASE WHEN url LIKE $1 THEN url ELSE $2 END, alt = $3, deleted_at = NULL, updated_at = now() WHERE id = $4`, ['%/products/%', product.image, alt, seedImage.id]);
        else await client.query(`INSERT INTO product_images (product_id, url, alt, sort_order) VALUES ($1, $2, $3, 0)`, [productRow.id, product.image, alt]);
      }
    }
    await client.query('COMMIT');
    console.log('✅ Seeded 3 demo categories and 18 demo products.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { await client.end(); }
}

main().catch((error: Error) => { console.error('❌ Demo catalog seed failed:', error.message); process.exit(1); });
