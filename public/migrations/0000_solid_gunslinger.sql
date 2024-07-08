CREATE TABLE `days` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer,
	`deleted_at` integer,
	`date` integer NOT NULL,
	`target_billable_duration` integer
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer,
	`deleted_at` integer,
	`display_name` text NOT NULL,
	`color` text,
	`is_billable` integer DEFAULT true NOT NULL,
	`is_break` integer DEFAULT false NOT NULL
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
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `day_date_idx` ON `days` (`date`) WHERE "days"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX `project_display_name_idx` ON `projects` (`display_name`) WHERE "projects"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX `task_display_name_idx` ON `tasks` (`display_name`) WHERE "tasks"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX `time_entry_started_at_idx` ON `time_entries` (`started_at`) WHERE "time_entries"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX `time_entry_stopped_at_idx` ON `time_entries` (`stopped_at`) WHERE "time_entries"."deleted_at" is null;