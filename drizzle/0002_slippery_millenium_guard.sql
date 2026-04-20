CREATE TABLE `bankAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`bankName` varchar(255) NOT NULL,
	`accountName` varchar(255) NOT NULL,
	`accountNumber` varchar(50) NOT NULL,
	`iban` varchar(50),
	`currency` varchar(10) DEFAULT 'SAR',
	`balance` decimal(15,2) DEFAULT '0',
	`type` enum('current','savings','investment') NOT NULL DEFAULT 'current',
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bankAccounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chartOfAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`code` varchar(20) NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`nameEn` varchar(255),
	`type` enum('asset','liability','equity','revenue','expense') NOT NULL,
	`parentId` int,
	`level` int DEFAULT 1,
	`isActive` boolean DEFAULT true,
	`balance` decimal(15,2) DEFAULT '0',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chartOfAccounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fixedAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`nameEn` varchar(255),
	`category` varchar(100) NOT NULL,
	`purchaseDate` date NOT NULL,
	`purchaseCost` decimal(15,2) NOT NULL,
	`usefulLife` int DEFAULT 5,
	`depreciationMethod` enum('straight_line','declining_balance') NOT NULL DEFAULT 'straight_line',
	`depreciationRate` decimal(5,2) DEFAULT '20',
	`accumulatedDepreciation` decimal(15,2) DEFAULT '0',
	`bookValue` decimal(15,2) DEFAULT '0',
	`location` varchar(255),
	`serialNumber` varchar(100),
	`status` enum('active','disposed','under_maintenance') NOT NULL DEFAULT 'active',
	`disposalDate` date,
	`disposalValue` decimal(15,2),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fixedAssets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pettyCash` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeId` int,
	`employeeName` varchar(255) NOT NULL,
	`type` enum('petty_cash','advance','expense') NOT NULL DEFAULT 'petty_cash',
	`amount` decimal(15,2) NOT NULL,
	`purpose` text NOT NULL,
	`date` date NOT NULL,
	`returnDate` date,
	`returnedAmount` decimal(15,2) DEFAULT '0',
	`status` enum('pending','approved','settled','cancelled') NOT NULL DEFAULT 'pending',
	`approvedBy` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pettyCash_id` PRIMARY KEY(`id`)
);
