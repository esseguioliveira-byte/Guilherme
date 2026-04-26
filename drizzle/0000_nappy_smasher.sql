CREATE TABLE `accounts` (
	`user_id` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`provider_account_id` varchar(255) NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` int,
	`token_type` varchar(255),
	`scope` varchar(255),
	`id_token` text,
	`session_state` varchar(255)
);
--> statement-breakpoint
CREATE TABLE `affiliate_transactions` (
	`id` varchar(255) NOT NULL,
	`affiliate_id` varchar(255) NOT NULL,
	`order_id` varchar(255),
	`amount` decimal(12,2) NOT NULL,
	`type` enum('COMMISSION','WITHDRAWAL') NOT NULL,
	`description` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `affiliate_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` varchar(255) NOT NULL,
	`code` varchar(50) NOT NULL,
	`type` enum('PERCENTAGE','FIXED') NOT NULL DEFAULT 'PERCENTAGE',
	`value` decimal(10,2) NOT NULL,
	`min_order_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
	`max_uses` int,
	`current_uses` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`expires_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`price` decimal(10,2) NOT NULL,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`status` enum('PENDING','PAID','CANCELLED') NOT NULL DEFAULT 'PENDING',
	`total_amount` decimal(10,2) NOT NULL,
	`pix_code` text,
	`stylepay_payment_id` varchar(255),
	`pix_qrcode_image` text,
	`delivery_email` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_settings` (
	`id` varchar(255) NOT NULL,
	`provider` varchar(50) NOT NULL DEFAULT 'stylepay',
	`client_id` text NOT NULL,
	`client_secret` text NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`webhook_secret` text,
	`environment` enum('sandbox','production') NOT NULL DEFAULT 'production',
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`category` varchar(255) NOT NULL,
	`category_id` varchar(255),
	`parent_id` varchar(255),
	`stock` int NOT NULL DEFAULT 0,
	`image_url` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`session_token` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `sessions_session_token` PRIMARY KEY(`session_token`)
);
--> statement-breakpoint
CREATE TABLE `site_visits` (
	`id` varchar(255) NOT NULL,
	`ip` varchar(255),
	`user_agent` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `site_visits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_deliveries` (
	`id` varchar(255) NOT NULL,
	`stock_item_id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stock_deliveries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_items` (
	`id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`max_slots` int NOT NULL DEFAULT 1,
	`used_slots` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stock_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(255) NOT NULL,
	`password` varchar(255),
	`email_verified` timestamp,
	`image` varchar(255),
	`is_affiliate` boolean NOT NULL DEFAULT false,
	`affiliate_code` varchar(50),
	`referred_by` varchar(255),
	`balance` decimal(12,2) NOT NULL DEFAULT '0.00',
	`commission_rate` decimal(5,2) NOT NULL DEFAULT '5.00',
	`role` enum('USER','ADMIN') NOT NULL DEFAULT 'USER',
	`bio` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_affiliate_code_unique` UNIQUE(`affiliate_code`)
);
--> statement-breakpoint
CREATE TABLE `verification_tokens` (
	`identifier` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE `withdrawal_requests` (
	`id` varchar(255) NOT NULL,
	`affiliate_id` varchar(255) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`pix_key` varchar(255) NOT NULL,
	`pix_key_type` enum('CPF','CNPJ','EMAIL','PHONE','RANDOM') NOT NULL,
	`status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
	`admin_note` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`resolved_at` timestamp,
	CONSTRAINT `withdrawal_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `affiliate_transactions` ADD CONSTRAINT `affiliate_transactions_affiliate_id_users_id_fk` FOREIGN KEY (`affiliate_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `affiliate_transactions` ADD CONSTRAINT `affiliate_transactions_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_parent_id_products_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stock_deliveries` ADD CONSTRAINT `stock_deliveries_stock_item_id_stock_items_id_fk` FOREIGN KEY (`stock_item_id`) REFERENCES `stock_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stock_deliveries` ADD CONSTRAINT `stock_deliveries_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stock_deliveries` ADD CONSTRAINT `stock_deliveries_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stock_items` ADD CONSTRAINT `stock_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `withdrawal_requests` ADD CONSTRAINT `withdrawal_requests_affiliate_id_users_id_fk` FOREIGN KEY (`affiliate_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;