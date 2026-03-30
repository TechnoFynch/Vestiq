import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedData1768561639614 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    /**
     * =========================
     * USERS (50)
     * =========================
     * password = password123
     */
    await queryRunner.query(`
      INSERT INTO users (email, password_hash, role)
      SELECT
        'user' || g || '@test.com',
        '$2b$10$KIXQ1zYkzYlqY0pGJ9pN1e5mZK6FqZl4CjQJY5Y5E5uE9ZK8G9M1C',
        CASE
          WHEN g = 1 THEN 'admin'::users_role_enum
          ELSE 'user'::users_role_enum
        END
      FROM generate_series(1,50) g;
    `);

    /**
     * =========================
     * USER PROFILE (50)
     * =========================
     */
    await queryRunner.query(`
      INSERT INTO user_profile ("firstName", "lastName", phone, user_id)
      SELECT
        'First' || row_number() OVER (),
        'Last' || row_number() OVER (),
        '9' || (random() * 1000000000)::bigint,
        id
      FROM users
      ORDER BY created_at;
    `);

    /**
     * =========================
     * CATEGORY (50)
     * =========================
     */
    await queryRunner.query(`
        WITH parent AS (
            INSERT INTO category (name, slug)
            SELECT
            'Category ' || g,
            'category-' || g
            FROM generate_series(1,10) g
            RETURNING id, slug
        )
        INSERT INTO category (name, slug, parent_id)
        SELECT
            'Sub Category ' || p.slug || '-' || g,
            p.slug || '-sub-' || g,
            p.id
        FROM parent p
        CROSS JOIN generate_series(1,4) g;
    `);

    /**
     * =========================
     * PRODUCT (50)
     * =========================
     */
    await queryRunner.query(`
      INSERT INTO product (
        name, slug, description, price,
        sale_price, sku, category_id
      )
      SELECT
        'Product ' || g,
        'product-' || g,
        'Description for product ' || g,
        (random() * 5000 + 500)::numeric(10,2),
        CASE
          WHEN g % 3 = 0
          THEN (random() * 3000 + 300)::numeric(10,2)
        END,
        'SKU-' || g,
        (SELECT id FROM category ORDER BY random() LIMIT 1)
      FROM generate_series(1,50) g;
    `);

    /**
     * =========================
     * INVENTORY (50)
     * =========================
     */
    await queryRunner.query(`
      INSERT INTO inventory (product_id, quantity, reserved)
      SELECT
        id,
        (random() * 100)::int,
        (random() * 10)::int
      FROM product;
    `);

    /**
     * =========================
     * PRODUCT IMAGE (100)
     * =========================
     */
    await queryRunner.query(`
      INSERT INTO product_image (url, is_primary, product_id)
      SELECT
        'https://picsum.photos/seed/' || id || '/400/400',
        true,
        id
      FROM product;

      INSERT INTO product_image (url, is_primary, product_id)
      SELECT
        'https://picsum.photos/seed/alt-' || id || '/400/400',
        false,
        id
      FROM product;
    `);

    /**
     * =========================
     * CART (50)
     * =========================
     */
    await queryRunner.query(`
      INSERT INTO cart (user_id)
      SELECT id FROM users;
    `);

    /**
     * =========================
     * CART ITEM (50)
     * =========================
     */
    await queryRunner.query(`
      INSERT INTO cart_item (
        cart_id, product_id, quantity, price_at_add
      )
      SELECT
        (SELECT id FROM cart ORDER BY random() LIMIT 1),
        p.id,
        (random() * 3 + 1)::int,
        p.price
      FROM product p
      ORDER BY random()
      LIMIT 50;
    `);

    /**
     * =========================
     * ADDRESSES (50)
     * =========================
     */
    await queryRunner.query(`
      INSERT INTO addresses (
        full_name, phone, line1, city,
        state, country, postal_code,
        is_default, user_id
      )
      SELECT
        up."firstName" || ' ' || up."lastName",
        up.phone,
        'Street ' || g,
        'City ' || g,
        'State ' || g,
        'India',
        (random() * 900000 + 100000)::int::text,
        g % 5 = 0,
        up.user_id
      FROM user_profile up
      CROSS JOIN generate_series(1,1) g
      LIMIT 50;
    `);

    /**
     * =========================
     * ORDERS (50)
     * =========================
     */
    await queryRunner.query(`
      INSERT INTO orders (
        user_id, address_snapshot, total_amount, status
      )
      SELECT
        user_id,
        json_build_object(
          'city', city,
          'postal_code', postal_code
        ),
        (random() * 8000 + 500)::numeric(10,2),
        '0'::orders_status_enum
      FROM addresses
      LIMIT 50;
    `);

    /**
     * =========================
     * ORDER ITEMS (~100)
     * =========================
     */
    await queryRunner.query(`
      INSERT INTO order_items (
        order_id, product_id, quantity, price
      )
      SELECT
        o.id,
        p.id,
        (random() * 3 + 1)::int,
        p.price
      FROM orders o
      JOIN product p ON random() < 0.3;
    `);

    /**
     * =========================
     * PRODUCT RATINGS (50)
     * =========================
     */
    await queryRunner.query(`
      INSERT INTO product_rating (
        rating, comment, "userId", "productId"
      )
      SELECT
        (random() * 4 + 1)::int,
        'Review ' || g,
        (SELECT id FROM users ORDER BY random() LIMIT 1),
        (SELECT id FROM product ORDER BY random() LIMIT 1)
      FROM generate_series(1,50) g;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    /**
     * FK-safe cleanup
     */
    await queryRunner.query(`DELETE FROM product_rating`);
    await queryRunner.query(`DELETE FROM order_items`);
    await queryRunner.query(`DELETE FROM orders`);
    await queryRunner.query(`DELETE FROM addresses`);
    await queryRunner.query(`DELETE FROM cart_item`);
    await queryRunner.query(`DELETE FROM cart`);
    await queryRunner.query(`DELETE FROM product_image`);
    await queryRunner.query(`DELETE FROM inventory`);
    await queryRunner.query(`DELETE FROM product`);
    await queryRunner.query(`DELETE FROM category`);
    await queryRunner.query(`DELETE FROM user_profile`);
    await queryRunner.query(`DELETE FROM users`);
  }
}
