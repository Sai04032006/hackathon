-- Database Update Script for Password Column Length
-- Run this script in your MySQL database to fix the password column length issues

-- Update buyer_table password column
ALTER TABLE buyer_table MODIFY COLUMN buyer_pwd VARCHAR(255) NOT NULL;

-- Update seller_table password column  
ALTER TABLE seller_table MODIFY COLUMN seller_pwd VARCHAR(255) NOT NULL;

-- Update admin_table password column
ALTER TABLE admin_table MODIFY COLUMN password VARCHAR(255) NOT NULL;

-- Verify the changes
DESCRIBE buyer_table;
DESCRIBE seller_table;
DESCRIBE admin_table;
