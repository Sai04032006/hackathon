-- Fresh JWT setup script
-- Run this in your MySQL database to ensure proper column sizes

USE sdpproject;

-- Drop existing constraints if any (to avoid errors)
SET FOREIGN_KEY_CHECKS = 0;

-- Update buyer table
ALTER TABLE buyer_table MODIFY COLUMN buyer_pwd VARCHAR(255) NOT NULL;

-- Add reset_token column to buyer_table if it doesn't exist
-- Using a safer approach that works in MySQL
SET @buyer_reset_exists = (
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_name = 'buyer_table' 
    AND column_name = 'reset_token'
    AND table_schema = 'sdpproject'
);

SET @buyer_sql = IF(@buyer_reset_exists = 0, 
    'ALTER TABLE buyer_table ADD COLUMN reset_token VARCHAR(255) NULL', 
    'SELECT "reset_token column already exists in buyer_table"');
PREPARE buyer_stmt FROM @buyer_sql;
EXECUTE buyer_stmt;
DEALLOCATE PREPARE buyer_stmt;

-- Update seller table
ALTER TABLE seller_table MODIFY COLUMN seller_pwd VARCHAR(255) NOT NULL;

-- Add reset_token column to seller_table if it doesn't exist
SET @seller_reset_exists = (
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_name = 'seller_table' 
    AND column_name = 'reset_token'
    AND table_schema = 'sdpproject'
);

SET @seller_sql = IF(@seller_reset_exists = 0, 
    'ALTER TABLE seller_table ADD COLUMN reset_token VARCHAR(255) NULL', 
    'SELECT "reset_token column already exists in seller_table"');
PREPARE seller_stmt FROM @seller_sql;
EXECUTE seller_stmt;
DEALLOCATE PREPARE seller_stmt;

-- Update admin table
ALTER TABLE admin_table MODIFY COLUMN password VARCHAR(255) NOT NULL;

-- Re-enable constraints
SET FOREIGN_KEY_CHECKS = 1;

-- Verify changes
DESCRIBE buyer_table;
DESCRIBE seller_table;
DESCRIBE admin_table;