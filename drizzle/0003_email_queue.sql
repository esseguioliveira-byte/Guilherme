CREATE TABLE `email_queue` (
	`id` varchar(255) NOT NULL,
	`to` varchar(255) NOT NULL,
	`subject` varchar(500),
	`html` text,
	`text` text,
	`template` varchar(100),
	`data` text,
	`status` enum('PENDING','PROCESSING','SENT','FAILED','DEAD_LETTER') NOT NULL DEFAULT 'PENDING',
	`attempts` int NOT NULL DEFAULT 0,
	`max_attempts` int NOT NULL DEFAULT 5,
	`next_retry_at` timestamp NOT NULL DEFAULT (now()),
	`processing_started_at` timestamp NULL DEFAULT NULL,
	`sent_at` timestamp NULL DEFAULT NULL,
	`error` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_queue_id` PRIMARY KEY(`id`)
);

CREATE TABLE `dead_letter_emails` (
	`id` varchar(255) NOT NULL,
	`original_id` varchar(255) NOT NULL,
	`to` varchar(255) NOT NULL,
	`subject` varchar(500),
	`html` text,
	`text` text,
	`template` varchar(100),
	`data` text,
	`attempts` int NOT NULL,
	`last_error` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dead_letter_emails_id` PRIMARY KEY(`id`)
);

CREATE INDEX `email_queue_status_retry_idx` ON `email_queue` (`status`, `next_retry_at`);

CREATE INDEX `email_queue_created_idx` ON `email_queue` (`created_at`);
