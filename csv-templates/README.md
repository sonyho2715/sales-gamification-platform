# 📊 CSV Import Templates

Use these templates to bulk upload data into your Sales Gamification Platform.

---

## 📁 Available Templates

### 1. **Sales Import** (`sales-import-template.csv`)
Bulk import sales transactions with line items.

**Use Cases:**
- Import historical sales data
- Upload daily POS exports
- Migrate from another system
- Batch entry for offline sales

**Columns:**

| Column | Required | Format | Description | Example |
|--------|----------|--------|-------------|---------|
| `transaction_number` | ✅ Yes | Text | Unique transaction ID | TXN-2025-001 |
| `sale_date` | ✅ Yes | YYYY-MM-DD | Date of sale | 2025-01-15 |
| `sale_time` | ✅ Yes | HH:MM | Time of sale (24h) | 14:30 |
| `salesperson_email` | ✅ Yes | Email | Salesperson's email | john.smith@demo.com |
| `customer_first_name` | ✅ Yes | Text | Customer first name | Michael |
| `customer_last_name` | ✅ Yes | Text | Customer last name | Johnson |
| `customer_phone` | ✅ Yes | Text | Customer phone (any format) | 555-0123 |
| `customer_email` | No | Email | Customer email | michael.j@email.com |
| `product_name` | ✅ Yes | Text | Product name | Sectional Sofa |
| `product_category` | ✅ Yes | Text | Category name | Living Room |
| `quantity` | ✅ Yes | Number | Quantity sold | 1 |
| `unit_price` | ✅ Yes | Decimal | Price per unit | 2499.99 |
| `cost_price` | No | Decimal | Cost per unit (for margin) | 1200.00 |
| `fcp_amount` | No | Decimal | FCP/warranty amount | 299.99 |
| `hours_worked` | No | Decimal | Hours worked on sale | 8.0 |
| `notes` | No | Text | Sale notes | Special delivery instructions |

**Important Notes:**
- Multiple rows with same `transaction_number` = multiple items in one sale
- Customer info is matched/created automatically by phone number
- FCP amount is added to total sale amount
- Salesperson must exist in system (match by email)
- Product category must exist or will be created

**Example:**
```csv
transaction_number,sale_date,sale_time,salesperson_email,customer_first_name,customer_last_name,customer_phone,customer_email,product_name,product_category,quantity,unit_price,cost_price,fcp_amount,hours_worked,notes
TXN-2025-001,2025-01-15,14:30,john.smith@demo.com,Michael,Johnson,555-0123,michael.j@email.com,Sectional Sofa,Living Room,1,2499.99,1200.00,299.99,8.0,White glove delivery
TXN-2025-001,2025-01-15,14:30,john.smith@demo.com,Michael,Johnson,555-0123,michael.j@email.com,Coffee Table,Living Room,1,399.99,180.00,0,8.0,
```

---

### 2. **Customers Import** (`customers-import-template.csv`)
Bulk import customer records.

**Use Cases:**
- Import customer database
- Add customers before sales import
- Update customer information
- Migrate from CRM system

**Columns:**

| Column | Required | Format | Description | Example |
|--------|----------|--------|-------------|---------|
| `first_name` | ✅ Yes | Text | Customer first name | Michael |
| `last_name` | ✅ Yes | Text | Customer last name | Johnson |
| `phone` | ✅ Yes | Text | Phone number (any format) | 555-0123 |
| `email` | No | Email | Email address | michael.j@email.com |
| `address` | No | Text | Street address | 123 Main St |
| `city` | No | Text | City | Los Angeles |
| `state` | No | Text | State (2-letter) | CA |
| `zip_code` | No | Text | ZIP code | 90001 |
| `notes` | No | Text | Customer notes | Prefers morning delivery |

**Important Notes:**
- Duplicate detection by phone number
- Email is optional (not all customers provide)
- Existing customers updated if phone matches
- Notes are appended to existing notes

**Example:**
```csv
first_name,last_name,phone,email,address,city,state,zip_code,notes
Michael,Johnson,555-0123,michael.j@email.com,123 Main St,Los Angeles,CA,90001,VIP customer
```

---

### 3. **Users Import** (`users-import-template.csv`)
Bulk add salespeople, managers, and admins.

**Use Cases:**
- Onboard new salespeople
- Set up new locations
- Bulk user creation
- Reset passwords

**Columns:**

| Column | Required | Format | Description | Example |
|--------|----------|--------|-------------|---------|
| `email` | ✅ Yes | Email | User email (login) | james.wilson@store.com |
| `first_name` | ✅ Yes | Text | First name | James |
| `last_name` | ✅ Yes | Text | Last name | Wilson |
| `role` | ✅ Yes | Enum | ADMIN, MANAGER, or SALESPERSON | SALESPERSON |
| `location_code` | ✅ Yes | Text | Location code | MAIN |
| `hire_date` | No | YYYY-MM-DD | Hire date | 2024-06-15 |
| `password` | ✅ Yes | Text | Initial password (min 6 chars) | Welcome123! |

**Important Notes:**
- Email must be unique
- Location code must exist (MAIN, NORTH, SOUTH, etc.)
- Valid roles: `ADMIN`, `MANAGER`, `SALESPERSON`
- Users should change password after first login
- Duplicate emails will be skipped with error

**Example:**
```csv
email,first_name,last_name,role,location_code,hire_date,password
james.wilson@store.com,James,Wilson,SALESPERSON,MAIN,2024-06-15,Welcome123!
```

---

## 🚀 How to Use

### Step 1: Download Template
1. Download the appropriate template file
2. Open in Excel, Google Sheets, or Numbers
3. Keep the header row (first row) - DO NOT DELETE

### Step 2: Fill in Data
1. Fill in your data starting from row 2
2. Follow the format examples
3. Mark required fields (✅ Yes columns)
4. Optional fields can be left empty

### Step 3: Save as CSV
**Excel:**
- File → Save As
- Format: CSV UTF-8 (Comma delimited) (.csv)

**Google Sheets:**
- File → Download → Comma Separated Values (.csv)

**Numbers:**
- File → Export To → CSV

### Step 4: Upload
1. Log into the platform
2. Go to Admin → Bulk Upload
3. Select upload type (Sales, Customers, or Users)
4. Choose your CSV file
5. Click "Validate & Preview"
6. Review any errors
7. Click "Import" to complete

---

## ✅ Validation Rules

### Sales Import
- ✅ Transaction number format: Any text (TXN-001, #12345, etc.)
- ✅ Date: Must be valid date in YYYY-MM-DD format
- ✅ Time: Must be valid time in HH:MM format (24-hour)
- ✅ Salesperson email: Must exist in system
- ✅ Phone: Any format (cleaned automatically: (555) 123-4567 → 5551234567)
- ✅ Prices: Must be positive numbers
- ✅ Quantity: Must be positive integer
- ⚠️ Warning if sale date is > 90 days old
- ⚠️ Warning if cost_price > unit_price (negative margin)

### Customers Import
- ✅ Phone: Required, any format
- ✅ Email: Must be valid email if provided
- ✅ Duplicate check: Phone number
- ⚠️ Warning if customer already exists (will update)

### Users Import
- ✅ Email: Must be unique, valid email format
- ✅ Role: Must be ADMIN, MANAGER, or SALESPERSON
- ✅ Location: Must exist in system
- ✅ Password: Minimum 6 characters
- ❌ Error if email already exists

---

## 🔧 Advanced Features

### Sales Import Features
**Auto Customer Creation:**
- If customer doesn't exist (by phone), automatically created
- Customer info from first occurrence used
- Customer linked to all sales with that phone

**Auto Category Creation:**
- Product categories created if they don't exist
- Categories can be managed later in admin panel

**Margin Calculation:**
- If `cost_price` provided, margin auto-calculated
- Margin % = ((unit_price - cost_price) / unit_price) × 100
- Margin amount = unit_price - cost_price

**Multi-Item Sales:**
- Group items by `transaction_number`
- FCP added to total sale amount
- Hours worked only counted once per transaction

### Preview Mode
Before importing, you'll see:
- ✅ Total rows to import
- ✅ Estimated customers to create
- ✅ Estimated sales to create
- ⚠️ Warnings (old dates, negative margins, etc.)
- ❌ Errors (missing required fields, invalid formats)
- 📊 Summary by salesperson
- 💰 Total sales amount

---

## ❌ Common Errors

### Error: "Salesperson not found"
**Problem:** Email doesn't match any user in system
**Solution:**
- Check spelling of email
- Ensure user exists in Admin → User Management
- Import users first if needed

### Error: "Invalid date format"
**Problem:** Date not in YYYY-MM-DD format
**Solution:**
- Use 2025-01-15 (not 01/15/2025 or 15-Jan-2025)
- Check for extra spaces
- Ensure leading zeros (01, not 1)

### Error: "Missing required field"
**Problem:** Required column is empty
**Solution:**
- Fill in all columns marked ✅ Yes
- Cannot leave blank
- Use "0" for numeric fields if truly zero

### Error: "Invalid phone number"
**Problem:** Phone is completely invalid (less than 10 digits)
**Solution:**
- Phone needs at least 10 digits
- Format doesn't matter: (555) 123-4567 or 5551234567 both work
- Remove extensions: 555-1234 x123 → 555-1234

### Warning: "Duplicate customer phone"
**Problem:** Multiple rows in CSV have different names for same phone
**Solution:**
- Check for typos in phone number
- Ensure same customer has same name throughout CSV
- First occurrence of name is used

### Warning: "Old sale date"
**Problem:** Sale date is more than 90 days ago
**Solution:**
- Verify date is correct
- This is just a warning - import will still work
- Historical data imports are fine

---

## 💡 Best Practices

### Data Preparation
1. ✅ **Clean data first** - Remove duplicates, fix typos
2. ✅ **Test with 5-10 rows** - Upload small file first
3. ✅ **Backup data** - Keep original file before editing
4. ✅ **One sale type per file** - Don't mix different date ranges
5. ✅ **Consistent formatting** - Use same date/time format throughout

### Import Strategy
1. **Import in order:**
   - Locations (via admin panel)
   - Users
   - Customers
   - Sales (with line items)

2. **For large files (>1000 rows):**
   - Split into smaller files (500 rows each)
   - Import one at a time
   - Allows easier error fixing

3. **Verify after import:**
   - Check dashboard for new sales
   - Verify salesperson totals
   - Check customer count
   - Review any error log

---

## 📞 Need Help?

### Sample Data
All templates include sample data - keep first 2-3 rows as reference.

### Validation Errors
The system will show specific row numbers with errors:
```
Row 5: Invalid email format in 'customer_email'
Row 12: Missing required field 'product_name'
Row 18: Salesperson 'invalid@email.com' not found
```

### Contact Support
If you encounter issues:
1. Save the error message
2. Keep the CSV file
3. Note which rows have errors
4. Contact your system administrator

---

## 🎯 Quick Reference

### Required Columns Only (Minimal CSV)

**Sales:**
```csv
transaction_number,sale_date,sale_time,salesperson_email,customer_first_name,customer_last_name,customer_phone,product_name,product_category,quantity,unit_price
TXN-001,2025-01-15,14:30,john@demo.com,Mike,Smith,555-0123,Sofa,Living Room,1,1999.99
```

**Customers:**
```csv
first_name,last_name,phone
Mike,Smith,555-0123
```

**Users:**
```csv
email,first_name,last_name,role,location_code,password
john@store.com,John,Doe,SALESPERSON,MAIN,Welcome123!
```

---

**Last Updated:** 2025-11-09
**Version:** 1.0
