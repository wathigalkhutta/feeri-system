CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`nameEn` varchar(255),
	`email` varchar(320),
	`phone` varchar(50),
	`company` varchar(255),
	`status` enum('lead','prospect','active','inactive') NOT NULL DEFAULT 'lead',
	`value` decimal(15,2) DEFAULT '0',
	`probability` int DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`nameEn` varchar(255),
	`type` varchar(100),
	`industry` varchar(100),
	`status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
	`revenue` decimal(15,2) DEFAULT '0',
	`expenses` decimal(15,2) DEFAULT '0',
	`phone` varchar(50),
	`email` varchar(320),
	`address` text,
	`logoUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`titleAr` varchar(255) NOT NULL,
	`titleEn` varchar(255),
	`clientName` varchar(255) NOT NULL,
	`type` varchar(100),
	`value` decimal(15,2) DEFAULT '0',
	`startDate` date,
	`endDate` date,
	`status` enum('draft','active','completed','cancelled','expired') NOT NULL DEFAULT 'draft',
	`progress` int DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int,
	`module` varchar(100),
	`type` enum('internal','external','general') NOT NULL DEFAULT 'internal',
	`fromName` varchar(255),
	`fromEmail` varchar(320),
	`toName` varchar(255),
	`toEmail` varchar(320),
	`subject` varchar(500) NOT NULL,
	`body` text NOT NULL,
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`nameEn` varchar(255),
	`email` varchar(320),
	`phone` varchar(50),
	`department` varchar(100),
	`position` varchar(100),
	`salary` decimal(12,2) DEFAULT '0',
	`status` enum('active','inactive','on_leave') NOT NULL DEFAULT 'active',
	`hireDate` date,
	`avatarUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoiceItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`description` text NOT NULL,
	`qty` int DEFAULT 1,
	`unitPrice` decimal(12,2) DEFAULT '0',
	`total` decimal(12,2) DEFAULT '0',
	CONSTRAINT `invoiceItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoiceTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`companyNameAr` varchar(255),
	`companyNameEn` varchar(255),
	`address` text,
	`phone` varchar(50),
	`email` varchar(320),
	`vatNumber` varchar(50),
	`crNumber` varchar(50),
	`bankName` varchar(100),
	`bankAccount` varchar(100),
	`footerNote` text,
	`primaryColor` varchar(20),
	`invoicePrefix` varchar(20),
	`paymentTerms` varchar(10),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoiceTemplates_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoiceTemplates_companyId_unique` UNIQUE(`companyId`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`number` varchar(50) NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`clientEmail` varchar(320),
	`clientAddress` text,
	`date` date NOT NULL,
	`dueDate` date,
	`subtotal` decimal(15,2) DEFAULT '0',
	`taxRate` decimal(5,2) DEFAULT '15',
	`taxAmount` decimal(15,2) DEFAULT '0',
	`discount` decimal(15,2) DEFAULT '0',
	`total` decimal(15,2) DEFAULT '0',
	`status` enum('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journalEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`date` date NOT NULL,
	`description` text NOT NULL,
	`debitAccount` varchar(255) NOT NULL,
	`creditAccount` varchar(255) NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`reference` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `journalEntries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leaveRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`companyId` int NOT NULL,
	`type` enum('annual','sick','emergency','unpaid') NOT NULL DEFAULT 'annual',
	`startDate` date NOT NULL,
	`endDate` date NOT NULL,
	`days` int DEFAULT 1,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leaveRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partnerships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`partnerName` varchar(255) NOT NULL,
	`partnerEmail` varchar(320),
	`sharePercent` decimal(5,2) DEFAULT '0',
	`investment` decimal(15,2) DEFAULT '0',
	`profit` decimal(15,2) DEFAULT '0',
	`status` enum('active','inactive','pending') NOT NULL DEFAULT 'active',
	`startDate` date,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partnerships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rentals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vehicleId` int NOT NULL,
	`companyId` int NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`clientPhone` varchar(50),
	`startDate` date NOT NULL,
	`endDate` date NOT NULL,
	`totalAmount` decimal(12,2) DEFAULT '0',
	`status` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rentals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`titleAr` varchar(255) NOT NULL,
	`titleEn` varchar(255),
	`description` text,
	`assignedTo` varchar(255),
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`status` enum('todo','in_progress','done','cancelled') NOT NULL DEFAULT 'todo',
	`dueDate` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`make` varchar(100) NOT NULL,
	`model` varchar(100) NOT NULL,
	`year` int,
	`plateNumber` varchar(50),
	`color` varchar(50),
	`dailyRate` decimal(10,2) DEFAULT '0',
	`status` enum('available','rented','maintenance') NOT NULL DEFAULT 'available',
	`mileage` int DEFAULT 0,
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`)
);
