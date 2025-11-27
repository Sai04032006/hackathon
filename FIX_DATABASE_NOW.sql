-- URGENT: Run this SQL script to fix the password column length issue
-- Copy and paste these commands in MySQL Command Line or MySQL Workbench

USE sdpproject;

-- Fix buyer table password column
ALTER TABLE buyer_table MODIFY COLUMN buyer_pwd VARCHAR(255) NOT NULL;

-- Fix seller table password column  
ALTER TABLE seller_table MODIFY COLUMN seller_pwd VARCHAR(255) NOT NULL;

-- Fix admin table password column
ALTER TABLE admin_table MODIFY COLUMN password VARCHAR(255) NOT NULL;

-- Verify the changes
DESCRIBE buyer_table;
DESCRIBE seller_table;
DESCRIBE admin_table;
