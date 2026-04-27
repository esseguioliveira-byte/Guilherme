import { mysqlTable, mysqlSchema, AnyMySqlColumn, foreignKey, varchar, text, int, index, decimal, mysqlEnum, timestamp, unique, longtext } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const accounts = mysqlTable("accounts", {
	userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	type: varchar({ length: 255 }).notNull(),
	provider: varchar({ length: 255 }).notNull(),
	providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: int("expires_at"),
	tokenType: varchar("token_type", { length: 255 }),
	scope: varchar({ length: 255 }),
	idToken: text("id_token"),
	sessionState: varchar("session_state", { length: 255 }),
});

export const affiliateTransactions = mysqlTable("affiliate_transactions", {
	id: varchar({ length: 255 }).notNull(),
	affiliateId: varchar("affiliate_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	orderId: varchar("order_id", { length: 255 }).references(() => orders.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	amount: decimal({ precision: 12, scale: 2 }).notNull(),
	type: mysqlEnum(['COMMISSION','WITHDRAWAL']).notNull(),
	description: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
},
(table) => [
	index("affiliate_id").on(table.affiliateId),
	index("order_id").on(table.orderId),
]);

export const categories = mysqlTable("categories", {
	id: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
},
(table) => [
	unique("slug").on(table.slug),
]);

export const coupons = mysqlTable("coupons", {
	id: varchar({ length: 255 }).notNull(),
	code: varchar({ length: 50 }).notNull(),
	type: mysqlEnum(['PERCENTAGE','FIXED']).default('\'PERCENTAGE\'').notNull(),
	value: decimal({ precision: 10, scale: 2 }).notNull(),
	minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }).default('0.00').notNull(),
	maxUses: int("max_uses"),
	currentUses: int("current_uses").default(0).notNull(),
	isActive: tinyint("is_active").default(1).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
},
(table) => [
	unique("code").on(table.code),
]);

export const orders = mysqlTable("orders", {
	id: varchar({ length: 255 }).notNull(),
	userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
	status: mysqlEnum(['PENDING','PAID','CANCELLED']).default('\'PENDING\'').notNull(),
	totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
	pixCode: text("pix_code"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	stylepayPaymentId: varchar("stylepay_payment_id", { length: 255 }),
	pixQrcodeImage: longtext("pix_qrcode_image"),
	deliveryEmail: varchar("delivery_email", { length: 255 }),
});

export const orderItems = mysqlTable("order_items", {
	id: varchar({ length: 255 }).notNull(),
	orderId: varchar("order_id", { length: 255 }).notNull().references(() => orders.id, { onDelete: "cascade" } ),
	productId: varchar("product_id", { length: 255 }).notNull().references(() => products.id),
	quantity: int().default(1).notNull(),
	price: decimal({ precision: 10, scale: 2 }).notNull(),
});

export const paymentSettings = mysqlTable("payment_settings", {
	id: varchar({ length: 255 }).notNull(),
	provider: varchar({ length: 50 }).default('\'stylepay\'').notNull(),
	clientId: text("client_id").notNull(),
	clientSecret: text("client_secret").notNull(),
	isActive: tinyint("is_active").default(1).notNull(),
	webhookSecret: text("webhook_secret"),
	environment: mysqlEnum(['sandbox','production']).default('\'production\'').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('current_timestamp()').notNull(),
});

export const products = mysqlTable("products", {
	id: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	price: decimal({ precision: 10, scale: 2 }).notNull(),
	category: varchar({ length: 255 }).notNull(),
	stock: int().default(0).notNull(),
	imageUrl: varchar("image_url", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	categoryId: varchar("category_id", { length: 255 }),
	parentId: varchar("parent_id", { length: 255 }),
});

export const sessions = mysqlTable("sessions", {
	sessionToken: varchar("session_token", { length: 255 }).notNull(),
	userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	expires: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
});

export const siteVisits = mysqlTable("site_visits", {
	id: varchar({ length: 255 }).notNull(),
	ip: varchar({ length: 255 }),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
});

export const stockDeliveries = mysqlTable("stock_deliveries", {
	id: varchar({ length: 255 }).notNull(),
	stockItemId: varchar("stock_item_id", { length: 255 }).notNull().references(() => stockItems.id, { onDelete: "cascade", onUpdate: "restrict" } ),
	orderId: varchar("order_id", { length: 255 }).notNull().references(() => orders.id, { onDelete: "cascade", onUpdate: "restrict" } ),
	userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "restrict" } ),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
},
(table) => [
	index("stock_item_id").on(table.stockItemId),
	index("order_id").on(table.orderId),
	index("user_id").on(table.userId),
]);

export const stockItems = mysqlTable("stock_items", {
	id: varchar({ length: 255 }).notNull(),
	productId: varchar("product_id", { length: 255 }).notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	maxSlots: int("max_slots").default(1).notNull(),
	usedSlots: int("used_slots").default(0).notNull(),
});

export const users = mysqlTable("users", {
	id: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }),
	emailVerified: timestamp("email_verified", { mode: 'string' }).default('current_timestamp()').notNull(),
	image: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	referredBy: varchar("referred_by", { length: 255 }),
	balance: decimal({ precision: 12, scale: 2 }).default('0.00').notNull(),
	commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default('5.00').notNull(),
	isAffiliate: tinyint("is_affiliate").default(0).notNull(),
	affiliateCode: varchar("affiliate_code", { length: 50 }),
	role: mysqlEnum(['USER','ADMIN']).default('\'USER\'').notNull(),
	bio: text(),
},
(table) => [
	unique("users_email_unique").on(table.email),
	unique("affiliate_code").on(table.affiliateCode),
]);

export const verificationTokens = mysqlTable("verification_tokens", {
	identifier: varchar({ length: 255 }).notNull(),
	token: varchar({ length: 255 }).notNull(),
	expires: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
});

export const withdrawalRequests = mysqlTable("withdrawal_requests", {
	id: varchar({ length: 255 }).notNull(),
	affiliateId: varchar("affiliate_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	amount: decimal({ precision: 12, scale: 2 }).notNull(),
	pixKey: varchar("pix_key", { length: 255 }).notNull(),
	pixKeyType: mysqlEnum("pix_key_type", ['CPF','CNPJ','EMAIL','PHONE','RANDOM']).notNull(),
	status: mysqlEnum(['PENDING','APPROVED','REJECTED']).default('\'PENDING\'').notNull(),
	adminNote: text("admin_note"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
},
(table) => [
	index("affiliate_id").on(table.affiliateId),
]);
