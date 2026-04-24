import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

async function seed() {
  const connection = await mysql.createConnection({
    uri: 'mysql://root:@localhost:3306/digistore',
  });

  try {
    console.log('Seeding data...');

    // Inserir Usuário Teste
    const passwordHash = await bcrypt.hash('123456', 10);
    const userId = crypto.randomUUID();
    
    await connection.execute(
      'INSERT IGNORE INTO users (id, name, email, password, created_at) VALUES (?, ?, ?, ?, ?)',
      [userId, 'Administrador', 'admin@digistore.com', passwordHash, new Date()]
    );
    console.log('✅ Usuário de teste inserido: admin@digistore.com / 123456');

    // Inserir Produtos Mockados
    const products = [
      {
        id: crypto.randomUUID(),
        name: 'Netflix Premium 4K',
        description: 'Acesso completo a filmes e séries em 4K. Entrega imediata.',
        price: '39.90',
        category: 'Streaming',
        stock: 10,
        image_url: '',
      },
      {
        id: crypto.randomUUID(),
        name: 'NordVPN 1 Ano',
        description: 'Navegação segura e anônima. Conta exclusiva.',
        price: '89.90',
        category: 'VPN',
        stock: 5,
        image_url: '',
      }
    ];

    for (const p of products) {
      await connection.execute(
        'INSERT IGNORE INTO products (id, name, description, price, category, stock, image_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [p.id, p.name, p.description, p.price, p.category, p.stock, p.image_url, new Date()]
      );
    }
    console.log('✅ Produtos inseridos');

  } catch (err) {
    console.error('Erro ao seedar banco:', err);
  } finally {
    await connection.end();
  }
}

seed();
