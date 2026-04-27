ALTER TABLE `order_items` DROP FOREIGN KEY `order_items_product_id_products_id_fk`;
--> statement-breakpoint
ALTER TABLE `products` DROP FOREIGN KEY `products_parent_id_products_id_fk`;
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email_verified` timestamp;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_parent_id_products_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;