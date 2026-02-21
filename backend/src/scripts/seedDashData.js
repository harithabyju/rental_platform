const db = require('../config/db');
const bcrypt = require('bcrypt');

const seedData = async () => {
  try {
    console.log('Starting seeding...');

    // Clean up existing data to avoid conflicts on rerun
    await db.query('TRUNCATE users, categories, shops, items, bookings, payments, fines RESTART IDENTITY CASCADE');

    // 1. Create Users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await db.query(`
      INSERT INTO users (fullname, email, password, role, verified) VALUES
      ('Admin User', 'admin@grabngo.com', $1, 'admin', true),
      ('John Customer', 'john@gmail.com', $1, 'customer', true),
      ('Jane Customer', 'jane@gmail.com', $1, 'customer', true),
      ('Bob Customer', 'bob@gmail.com', $1, 'customer', true),
      ('Alice Owner', 'alice@shop.com', $1, 'shop_owner', true),
      ('Charlie Owner', 'charlie@shop.com', $1, 'shop_owner', true)
      RETURNING id, role, fullname
    `, [hashedPassword]);

    const customers = users.rows.filter(u => u.role === 'customer');
    const owners = users.rows.filter(u => u.role === 'shop_owner');

    console.log('Users seeded');

    // 2. Create Categories
    const categories = await db.query(`
      INSERT INTO categories (name, description) VALUES
      ('Electronics', 'Gadgets, laptops, and more'),
      ('Tools', 'Power tools and construction equipment'),
      ('Appliances', 'Kitchen and home appliances'),
      ('Cameras', 'DSLRs, lenses, and accessories')
      RETURNING id, name
    `);
    console.log('Categories seeded');

    // 3. Create Shops
    const shops = await db.query(`
      INSERT INTO shops (owner_id, name, location, rating) VALUES
      ($1, 'Alice Tech Rentals', 'New York, NY', 4.5),
      ($2, 'Charlie Tool Shed', 'Brooklyn, NY', 4.2)
      RETURNING id, name
    `, [owners[0].id, owners[1].id]);
    console.log('Shops seeded');

    // 4. Create Items
    const items = await db.query(`
      INSERT INTO items (shop_id, category_id, name, description, price_per_day) VALUES
      ($1, $2, 'MacBook Pro 2023', 'High performance laptop', 50.00),
      ($1, $3, 'Sony A7IV', 'Professional mirrorless camera', 40.00),
      ($4, $5, 'Drill Machine', 'Heavy duty power drill', 15.00),
      ($4, $6, 'Concrete Mixer', 'Industrial mixer', 100.00)
      RETURNING id, name
    `, [
      shops.rows[0].id, categories.rows[0].id, categories.rows[3].id,
      shops.rows[1].id, categories.rows[1].id, categories.rows[1].id
    ]);
    console.log('Items seeded');

    // 5. Create Bookings
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(today.getMonth() - 2);

    const bookings = await db.query(`
      INSERT INTO bookings (customer_id, item_id, start_date, end_date, total_price, status, created_at) VALUES
      ($1, $2, $3, $4, 150.00, 'completed', $13),
      ($5, $6, $3, $4, 200.00, 'completed', $13),
      ($7, $8, $9, $10, 45.00, 'active', $14),
      ($1, $2, $11, $12, 100.00, 'completed', $15),
      ($5, $6, $11, $12, 120.00, 'completed', $15)
      RETURNING id, total_price
    `, [
      customers[0].id, items.rows[0].id, lastMonth, new Date(lastMonth.getTime() + 86400000 * 3),
      customers[1].id, items.rows[1].id,
      customers[2].id, items.rows[2].id, today, new Date(today.getTime() + 86400000 * 3),
      twoMonthsAgo, new Date(twoMonthsAgo.getTime() + 86400000 * 2),
      lastMonth, today, twoMonthsAgo // Separate parameters for created_at (Timestamps)
    ]);
    console.log('Bookings seeded');

    // 6. Create Payments
    for (const booking of bookings.rows) {
      await db.query(`
          INSERT INTO payments (booking_id, amount, status, transaction_id) VALUES
          ($1, $2, 'completed', $3)
        `, [booking.id, booking.total_price, 'txn_' + Math.random().toString(36).substr(2, 9)]);
    }
    console.log('Payments seeded');

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedData();
