import { relations } from "drizzle-orm/relations";
import { users, accounts, affiliateTransactions, orders, orderItems, products, sessions, withdrawalRequests } from "./schema";

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	accounts: many(accounts),
	affiliateTransactions: many(affiliateTransactions),
	orders: many(orders),
	sessions: many(sessions),
	withdrawalRequests: many(withdrawalRequests),
}));

export const affiliateTransactionsRelations = relations(affiliateTransactions, ({one}) => ({
	user: one(users, {
		fields: [affiliateTransactions.affiliateId],
		references: [users.id]
	}),
	order: one(orders, {
		fields: [affiliateTransactions.orderId],
		references: [orders.id]
	}),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	affiliateTransactions: many(affiliateTransactions),
	user: one(users, {
		fields: [orders.userId],
		references: [users.id]
	}),
	orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.id]
	}),
}));

export const productsRelations = relations(products, ({many}) => ({
	orderItems: many(orderItems),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const withdrawalRequestsRelations = relations(withdrawalRequests, ({one}) => ({
	user: one(users, {
		fields: [withdrawalRequests.affiliateId],
		references: [users.id]
	}),
}));