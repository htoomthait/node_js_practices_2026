-- AlterTable
ALTER TABLE `tbl_users` ADD COLUMN `hashedRefreshToken` VARCHAR(191) NULL,
    ADD COLUMN `password` VARCHAR(191) NULL,
    ADD COLUMN `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER';
