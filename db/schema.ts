import { mysqlTable, varchar, timestamp, int, decimal, text, mysqlEnum, boolean } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

export const users = mysqlTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: varchar('image', { length: 255 }),
  isAffiliate: boolean('is_affiliate').default(false).notNull(),
  affiliateCode: varchar('affiliate_code', { length: 50 }).unique(),
  referredBy: varchar('referred_by', { length: 255 }), // ID of the user who referred this user
  balance: decimal('balance', { precision: 12, scale: 2 }).default('0.00').notNull(),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).default('5.00').notNull(),
  role: mysqlEnum('role', ['USER', 'ADMIN']).default('USER').notNull(),
  bio: text('bio'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});



export const affiliateTransactions = mysqlTable('affiliate_transactions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  affiliateId: varchar('affiliate_id', { length: 255 })
    .notNull()
    .references(() => users.id),
  orderId: varchar('order_id', { length: 255 })
    .references(() => orders.id),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  type: mysqlEnum('type', ['COMMISSION', 'WITHDRAWAL']).notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const accounts = mysqlTable('accounts', {
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: int('expires_at'),
  token_type: varchar('token_type', { length: 255 }),
  scope: varchar('scope', { length: 255 }),
  id_token: text('id_token'),
  session_state: varchar('session_state', { length: 255 }),
});

export const sessions = mysqlTable('sessions', {
  sessionToken: varchar('session_token', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = mysqlTable(
  'verification_tokens',
  {
    identifier: varchar('identifier', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    compoundKey: {
      idAndToken: { columns: [vt.identifier, vt.token] }, // Define compound primary key index
    },
  })
);

export const categories = mysqlTable('categories', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const products = mysqlTable('products', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  category: varchar('category', { length: 255 }).notNull(), // Legacy field
  categoryId: varchar('category_id', { length: 255 }).references(() => categories.id),
  parentId: varchar('parent_id', { length: 255 }).references((): any => products.id, { onDelete: 'cascade' }), // Self-reference
  stock: int('stock').notNull().default(0),
  imageUrl: varchar('image_url', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const productRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  parent: one(products, {
    fields: [products.parentId],
    references: [products.id],
    relationName: 'subProducts',
  }),
  subProducts: many(products, {
    relationName: 'subProducts',
  }),
}));


export const categoryRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));


export const orders = mysqlTable('orders', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id),
  status: mysqlEnum('status', ['PENDING', 'PAID', 'CANCELLED']).notNull().default('PENDING'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  pixCode: text('pix_code'),
  stylepayPaymentId: varchar('stylepay_payment_id', { length: 255 }),
  pixQrcodeImage: text('pix_qrcode_image'), // Base64 image from Stylepay
  deliveryEmail: varchar('delivery_email', { length: 255 }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const orderItems = mysqlTable('order_items', {
  id: varchar('id', { length: 255 }).primaryKey(),
  orderId: varchar('order_id', { length: 255 })
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: varchar('product_id', { length: 255 })
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  quantity: int('quantity').notNull().default(1),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
});

export const orderRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const stockItems = mysqlTable('stock_items', {
  id: varchar('id', { length: 255 }).primaryKey(),
  productId: varchar('product_id', { length: 255 })
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  content: text('content').notNull(), // O código, link ou conta a ser entregue
  maxSlots: int('max_slots').default(1).notNull(), // 1 para privado, >1 para compartilhado
  usedSlots: int('used_slots').default(0).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const stockDeliveries = mysqlTable('stock_deliveries', {
  id: varchar('id', { length: 255 }).primaryKey(),
  stockItemId: varchar('stock_item_id', { length: 255 })
    .notNull()
    .references(() => stockItems.id, { onDelete: 'cascade' }),
  orderId: varchar('order_id', { length: 255 })
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const stockItemRelations = relations(stockItems, ({ one, many }) => ({
  product: one(products, {
    fields: [stockItems.productId],
    references: [products.id],
  }),
  deliveries: many(stockDeliveries),
}));

export const stockDeliveryRelations = relations(stockDeliveries, ({ one }) => ({
  stockItem: one(stockItems, {
    fields: [stockDeliveries.stockItemId],
    references: [stockItems.id],
  }),
  order: one(orders, {
    fields: [stockDeliveries.orderId],
    references: [orders.id],
  }),
  user: one(users, {
    fields: [stockDeliveries.userId],
    references: [users.id],
  }),
}));

export const siteVisits = mysqlTable('site_visits', {
  id: varchar('id', { length: 255 }).primaryKey(),
  ip: varchar('ip', { length: 255 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const coupons = mysqlTable('coupons', {
  id: varchar('id', { length: 255 }).primaryKey(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  type: mysqlEnum('type', ['PERCENTAGE', 'FIXED']).notNull().default('PERCENTAGE'),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(), // e.g. 20 = 20% or R$20
  minOrderAmount: decimal('min_order_amount', { precision: 10, scale: 2 }).default('0.00').notNull(),
  maxUses: int('max_uses'), // null = unlimited
  currentUses: int('current_uses').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  expiresAt: timestamp('expires_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const withdrawalRequests = mysqlTable('withdrawal_requests', {
  id: varchar('id', { length: 255 }).primaryKey(),
  affiliateId: varchar('affiliate_id', { length: 255 })
    .notNull()
    .references(() => users.id),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  pixKey: varchar('pix_key', { length: 255 }).notNull(),
  pixKeyType: mysqlEnum('pix_key_type', ['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM']).notNull(),
  status: mysqlEnum('status', ['PENDING', 'APPROVED', 'REJECTED']).notNull().default('PENDING'),
  adminNote: text('admin_note'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at', { mode: 'date' }),
});

export const paymentSettings = mysqlTable('payment_settings', {
  id: varchar('id', { length: 255 }).primaryKey(),
  provider: varchar('provider', { length: 50 }).notNull().default('stylepay'),
  clientId: text('client_id').notNull(),
  clientSecret: text('client_secret').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  webhookSecret: text('webhook_secret'),
  environment: mysqlEnum('environment', ['sandbox', 'production']).default('production').notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type StockItem = typeof stockItems.$inferSelect;
export type StockDelivery = typeof stockDeliveries.$inferSelect;
export type SiteVisit = typeof siteVisits.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type PaymentSettings = typeof paymentSettings.$inferSelect;

// ── Email Queue ──────────────────────────────────────────────────────────────

export const emailQueue = mysqlTable('email_queue', {
  id: varchar('id', { length: 255 }).primaryKey(),
  to: varchar('to', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 500 }),
  html: text('html'),
  text: text('text'),
  template: varchar('template', { length: 100 }),
  data: text('data'), // JSON serialized template data
  status: mysqlEnum('status', ['PENDING', 'PROCESSING', 'SENT', 'FAILED', 'DEAD_LETTER'])
    .notNull()
    .default('PENDING'),
  attempts: int('attempts').notNull().default(0),
  maxAttempts: int('max_attempts').notNull().default(5),
  nextRetryAt: timestamp('next_retry_at', { mode: 'date' }).defaultNow().notNull(),
  processingStartedAt: timestamp('processing_started_at', { mode: 'date' }),
  sentAt: timestamp('sent_at', { mode: 'date' }),
  error: text('error'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const deadLetterEmails = mysqlTable('dead_letter_emails', {
  id: varchar('id', { length: 255 }).primaryKey(),
  originalId: varchar('original_id', { length: 255 }).notNull(),
  to: varchar('to', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 500 }),
  html: text('html'),
  text: text('text'),
  template: varchar('template', { length: 100 }),
  data: text('data'),
  attempts: int('attempts').notNull(),
  lastError: text('last_error'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export type EmailQueue = typeof emailQueue.$inferSelect;
export type DeadLetterEmail = typeof deadLetterEmails.$inferSelect;
