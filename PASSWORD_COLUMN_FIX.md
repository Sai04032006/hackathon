# Password Column Length Fix

## Problem
The error `Data truncation: Data too long for column 'buyer_pwd' at row 1` occurs because:
- BCrypt encrypted passwords are ~60 characters long
- Your database columns were only 20 characters long
- When trying to save encrypted passwords, they get truncated

## Solution Applied

### 1. Updated Model Classes
- **Buyer.java**: Changed `buyer_pwd` column length from 20 to 255
- **Seller.java**: Changed `seller_pwd` column length from 20 to 255  
- **Admin.java**: Changed `password` column length from 50 to 255

### 2. Database Update Required

You need to update your database columns to match the model changes.

## Steps to Fix

### Option 1: Automatic Update (Recommended)
1. **Stop your Spring Boot application**
2. **Delete the existing tables** (if you don't have important data):
   ```sql
   DROP TABLE buyer_table;
   DROP TABLE seller_table; 
   DROP TABLE admin_table;
   ```
3. **Restart your application** - Hibernate will recreate the tables with correct column sizes

### Option 2: Manual Database Update
1. **Run the SQL script** (`DATABASE_UPDATE.sql`):
   ```sql
   ALTER TABLE buyer_table MODIFY COLUMN buyer_pwd VARCHAR(255) NOT NULL;
   ALTER TABLE seller_table MODIFY COLUMN seller_pwd VARCHAR(255) NOT NULL;
   ALTER TABLE admin_table MODIFY COLUMN password VARCHAR(255) NOT NULL;
   ```

### Option 3: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your database
3. Run each ALTER TABLE command from the SQL script
4. Verify the changes

## Test the Fix

1. **Start your application**:
   ```bash
   cd SPRINGBOOTWORKSPACE/SDPProject
   mvn spring-boot:run
   ```

2. **Test buyer registration**:
   - Go to buyer registration page
   - Fill in the form and submit
   - Should work without the "Data too long" error

3. **Test seller registration**:
   - Go to seller registration page  
   - Fill in the form and submit
   - Should work without errors

## Why 255 Characters?

- **BCrypt passwords**: ~60 characters
- **Future-proofing**: 255 is a safe buffer
- **Database standard**: VARCHAR(255) is commonly used for passwords
- **JPA compatibility**: Works well with all JPA providers

## Verification

After applying the fix, you can verify by:

1. **Check column sizes**:
   ```sql
   DESCRIBE buyer_table;
   DESCRIBE seller_table;
   DESCRIBE admin_table;
   ```

2. **Test registration**:
   - Create a new buyer account
   - Create a new seller account
   - Should work without truncation errors

## Success Indicators

✅ No "Data too long for column" errors
✅ User registration works successfully  
✅ Passwords are properly encrypted and stored
✅ Login functionality works with encrypted passwords

The password column length issue should now be completely resolved!
