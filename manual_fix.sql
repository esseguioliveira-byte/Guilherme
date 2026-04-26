-- Manual Migration Fix
-- Fixes: Column 'email_verified' cannot be null
-- Fixes: Missing 'stock_deliveries' table

-- 1. Fix email_verified in users table
ALTER TABLE `users` MODIFY COLUMN `email_verified` timestamp NULL;

-- 2. Create missing tables if they don't exist
CREATE TABLE IF NOT EXISTS `stock_deliveries` (
	`id` varchar(255) NOT NULL,
	`stock_item_id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stock_deliveries_id` PRIMARY KEY(`id`)
);

-- 3. Add foreign keys for stock_deliveries if they don't exist
-- Note: These might fail if they already exist, but that's expected.

ALTER TABLE `stock_deliveries` ADD CONSTRAINT `stock_deliveries_stock_item_id_stock_items_id_fk` FOREIGN KEY (`stock_item_id`) REFERENCES `stock_items`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `stock_deliveries` ADD CONSTRAINT `stock_deliveries_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `stock_deliveries` ADD CONSTRAINT `stock_deliveries_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
