CREATE TABLE `days` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer,
	`deleted_at` integer,
	`date` integer NOT NULL,
	`target_billable_duration_ms` integer
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer,
	`deleted_at` integer,
	`display_name` text NOT NULL,
	`color` text,
	`is_billable` integer,
	`is_break` integer
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer,
	`deleted_at` integer,
	`display_name` text NOT NULL,
	`color` text
);
--> statement-breakpoint
CREATE TABLE `time_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer,
	`deleted_at` integer,
	`day_id` text NOT NULL,
	`project_id` text,
	`task_id` text,
	`description` text NOT NULL,
	`started_at` integer NOT NULL,
	`stopped_at` integer,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `days_date_unique` ON `days` (`date`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `days` (`date`) WHERE "days"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX `projects_display_name_unique` ON `projects` (`display_name`);--> statement-breakpoint
CREATE INDEX `display_name_idx` ON `projects` (`display_name`) WHERE "projects"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX `tasks_display_name_unique` ON `tasks` (`display_name`);--> statement-breakpoint
CREATE INDEX `display_name_idx` ON `tasks` (`display_name`) WHERE "tasks"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX `started_at_idx` ON `time_entries` (`started_at`) WHERE "time_entries"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX `stopped_at_idx` ON `time_entries` (`stopped_at`) WHERE "time_entries"."deleted_at" is null;