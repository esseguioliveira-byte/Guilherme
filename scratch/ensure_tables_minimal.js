const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    console.log('Verificando tabelas...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS stock_items (
        id VARCHAR(255) PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        order_id VARCHAR(255),
        content TEXT NOT NULL,
        is_sold BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (order_id) REFERENCES orders(id)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS withdrawal_requests (
        id VARCHAR(255) PRIMARY KEY,
        affiliate_id VARCHAR(255) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        pix_key VARCHAR(255) NOT NULL,
        pix_key_type ENUM('CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM') NOT NULL,
        status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING' NOT NULL,
        admin_note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        resolved_at TIMESTAMP,
        FOREIGN KEY (affiliate_id) REFERENCES users(id)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS coupons (
        id VARCHAR(255) PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        type ENUM('PERCENTAGE', 'FIXED') DEFAULT 'PERCENTAGE' NOT NULL,
        value DECIMAL(10, 2) NOT NULL,
        min_order_amount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
        max_uses INT,
        current_uses INT DEFAULT 0 NOT NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    console.log('Tabelas verificadas com sucesso!');
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

run();
