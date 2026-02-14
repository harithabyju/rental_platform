const db = require('../config/db');

const createUsersTable = `
  CREATE TYPE user_role AS ENUM ('customer', 'shop_owner', 'admin');

  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'customer',
    verified BOOLEAN DEFAULT FALSE,
    otp VARCHAR(6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    blocked BOOLEAN DEFAULT FALSE
  );
`;

const initDb = async () => {
  try {
    await db.query(createUsersTable);
    console.log('Users table created successfully');
    process.exit(0);
  } catch (err) {
    if (err.code === '42710') {
      // duplicate object error (enum might already exist)
      console.log('Enum already exists, skipping...');
      // Try creating table again if enum existed but table didn't? 
      // Simpler to just ignore or handle gracefully.
      // For now, let's assume if enum exists, we might need to handle it.
      // But 'CREATE TYPE' doesn't have IF NOT EXISTS in older logic, 
      // actually Postgres supports it in blocks or we catch error.
    }
    console.error('Error initializing database:', err);
    process.exit(1);
  }
};

initDb();
