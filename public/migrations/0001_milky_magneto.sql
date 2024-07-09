DROP INDEX IF EXISTS `day_date_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `project_display_name_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `task_display_name_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `time_entry_started_at_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `time_entry_stopped_at_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `day_date_idx` ON `days` (`date`);--> statement-breakpoint
CREATE UNIQUE INDEX `project_display_name_idx` ON `projects` (`display_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `task_display_name_idx` ON `tasks` (`display_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `time_entry_started_at_idx` ON `time_entries` (`started_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `time_entry_stopped_at_idx` ON `time_entries` (`stopped_at`);--> statement-breakpoint
ALTER TABLE `days` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `projects` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `tasks` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `time_entries` DROP COLUMN `deleted_at`;