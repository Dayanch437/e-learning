# Django Import-Export Setup Guide

## ✅ Installation Complete

Django import-export has been successfully added to all admin panels in your Django backend.

## 📦 Package Information

- **Package**: `django-import-export==4.3.3`
- **Status**: ✅ Installed
- **Configuration**: ✅ Added to `INSTALLED_APPS` in `config/settings/base.py`

## 🎯 Enhanced Admin Models

### 1. Users App (`apps/users/admin.py`)

**UserResource** - Exports user data with the following fields:
- id, username, email, first_name, last_name
- role, phone_number, date_of_birth
- is_verified, is_staff, is_active
- created_at, updated_at

**Admin Class**: `UserAdmin` now extends `ImportExportModelAdmin`

---

### 2. Center App (`apps/center/admin.py`)

#### a) **CategoryResource**
Exports category data:
- id, name
- created_at, updated_at

**Admin Class**: `CategoryAdmin`
- List Display: name, created_at, updated_at
- Search: name
- Filters: created_at, updated_at

#### b) **GrammarResource**
Exports grammar lessons with related fields:
- id, title, content, difficulty_level
- **category__name** (readable category name)
- **created_by__username** (creator's username)
- video_url, image, order
- created_at, updated_at

**Admin Class**: `GrammarAdmin`
- List Display: title, category, difficulty_level, created_by, order, created_at
- List Filter: difficulty_level, category, created_at
- Search: title, content
- Raw ID Fields: category, created_by (for better performance)

#### c) **VideoLessonResource**
Exports video lessons with related fields:
- id, title, description, difficulty_level
- **category__name**
- **created_by__username**
- video_file, thumbnail, duration
- order, view_count
- created_at, updated_at

**Admin Class**: `VideoLessonAdmin`
- List Display: title, category, difficulty_level, duration, view_count, created_by, order
- List Filter: difficulty_level, category, created_at
- Search: title, description
- Raw ID Fields: category, created_by

#### d) **TurkmenEnglishWordResource**
Exports vocabulary with related fields:
- id, english_word, turkmen_translation, english_definition
- **category__name**
- **created_by__username**
- part_of_speech, difficulty_level
- pronunciation, example_sentence
- order, created_at, updated_at

**Admin Class**: `TurkmenEnglishWordAdmin`
- List Display: english_word, turkmen_translation, category, part_of_speech, difficulty_level, order
- List Filter: part_of_speech, difficulty_level, category, created_at
- Search: english_word, turkmen_translation, english_definition, example_sentence
- Raw ID Fields: category, created_by

---

### 3. Chatbot App (`apps/chatbot/admin.py`)

#### a) **ChatSessionResource**
Exports chat session data with user information:
- id, **user__username**, **user__email**
- created_at, updated_at, is_active

**Admin Class**: `ChatSessionAdmin`
- List Display: id, user, created_at, updated_at, is_active, message_count
- List Filter: is_active, created_at
- Search: user__username, user__email
- Inline: ChatMessageInline (for editing messages within session)
- Custom Methods: message_count()

#### b) **ChatMessageResource**
Exports chat messages with session relationships:
- id, **session__id**, **session__user__username**
- sender, content
- created_at, updated_at

**Admin Class**: `ChatMessageAdmin`
- List Display: id, session, sender, content_preview, created_at
- List Filter: sender, created_at
- Search: content, session__user__username
- Custom Methods: content_preview()

---

## 🚀 How to Use Import/Export in Django Admin

### Accessing Admin Panel
1. Start the Django server: `python manage.py runserver`
2. Navigate to: `http://localhost:8000/admin/`
3. Login with your superuser credentials

### Exporting Data

1. Navigate to any model's list view (e.g., Users, Grammar Lessons, etc.)
2. Click the **"Export"** button in the top right
3. Select your desired format:
   - **CSV** (Comma-separated values)
   - **XLS** (Excel 97-2003)
   - **XLSX** (Excel 2007+)
   - **TSV** (Tab-separated values)
   - **ODS** (OpenDocument Spreadsheet)
   - **JSON**
   - **YAML**
   - **HTML**
4. The file will be downloaded with all configured fields

### Importing Data

1. Navigate to any model's list view
2. Click the **"Import"** button in the top right
3. Select your file (CSV, XLS, XLSX, etc.)
4. Click **"Submit"** to preview changes
5. Review the preview:
   - ✅ Green rows: Will be added/updated successfully
   - ❌ Red rows: Have validation errors (with details)
6. Click **"Confirm import"** if everything looks good

### Import Features
- ✅ **Validation**: Checks all data before importing
- ✅ **Preview**: Shows exactly what will change
- ✅ **Error Handling**: Clear error messages for invalid data
- ✅ **Update or Create**: Can update existing records or create new ones
- ✅ **Rollback**: If errors occur, no data is imported

---

## 📊 Export Field Details

### Related Fields (ForeignKeys)
When exporting, related fields are shown as readable names:
- `category__name` instead of just category ID
- `created_by__username` instead of user ID
- `session__user__username` for nested relationships

### Example Export Structure

**Grammar Export (CSV)**:
```csv
id,title,content,difficulty_level,category__name,created_by__username,video_url,image,order,created_at,updated_at
1,"Present Tense","Content here...",beginner,"Grammar Basics","admin","https://...","/media/grammar/...",1,2024-01-15 10:30:00,2024-01-15 10:30:00
```

**Video Export (CSV)**:
```csv
id,title,description,difficulty_level,category__name,created_by__username,video_file,thumbnail,duration,order,view_count,created_at,updated_at
1,"Introduction","Welcome video",beginner,"Video Lessons","admin","/media/videos/intro.mp4","/media/thumbnails/intro.jpg","00:05:30",1,150,2024-01-15,2024-01-15
```

---

## 🔧 Configuration Details

### Resource Classes
Each model has a corresponding `Resource` class that defines:
- **fields**: Which model fields to include in export/import
- **export_order**: The order of columns in exported files
- **Meta**: Model reference and configuration

### Admin Classes
All admin classes now inherit from `ImportExportModelAdmin`:
```python
class GrammarAdmin(ImportExportModelAdmin):
    resource_class = GrammarResource
    list_display = (...)
    list_filter = (...)
    search_fields = (...)
```

This mixin adds the import/export functionality while preserving all existing admin features.

---

## 📝 Testing Checklist

### ✅ Tasks Completed:
- [x] Added `django-import-export==4.3.3` to `requirements.txt`
- [x] Installed package: `pip install django-import-export==4.3.3`
- [x] Added `'import_export'` to `INSTALLED_APPS` in `config/settings/base.py`
- [x] Created Resource classes for all models (7 total)
- [x] Updated all admin classes with `ImportExportModelAdmin`
- [x] Configured export field ordering
- [x] Added related field exports (ForeignKey relationships)
- [x] Verified no syntax errors in admin files

### 🧪 Recommended Testing:

1. **Start Django Server**:
   ```bash
   cd /home/hack-me-if-you-can/project_DIPLOM/e-center
   python manage.py runserver
   ```

2. **Access Admin Panel**:
   - URL: http://localhost:8000/admin/
   - Login with superuser credentials

3. **Test Export**:
   - Go to Users → Click "Export" → Select CSV → Verify all fields are present
   - Go to Grammar Lessons → Export → Check that `category__name` and `created_by__username` appear
   - Go to Video Lessons → Export → Verify all 13 fields
   - Go to Chat Sessions → Export → Check user relationships

4. **Test Import**:
   - Export existing data as CSV
   - Modify a few rows (change names, add new rows)
   - Click "Import" → Upload modified CSV
   - Review preview → Confirm import
   - Verify changes in admin list view

5. **Test Related Fields**:
   - Export Grammar lessons
   - Verify category appears as name (not just ID)
   - Verify created_by appears as username

---

## 🎨 Additional Features

### Custom Export Orders
All exports have consistent column ordering defined in `export_order`:
- ID fields first
- Main content fields next
- Related fields after that
- Metadata fields (created_at, updated_at) last

### Performance Optimizations
- `raw_id_fields` used for ForeignKey fields to improve admin performance
- Related fields exported with `__` notation for readability
- List filters and search fields configured for fast data access

---

## 📚 Advanced Usage

### Customizing Export Formats
You can customize how fields are exported by adding methods to Resource classes:

```python
from import_export import fields

class GrammarResource(resources.ModelResource):
    custom_field = fields.Field(attribute='field_name', column_name='Display Name')
```

### Import Validation
Add custom validation in Resource classes:

```python
def before_import_row(self, row, **kwargs):
    # Custom validation logic
    if row['difficulty_level'] not in ['beginner', 'intermediate', 'advanced']:
        raise ValidationError('Invalid difficulty level')
```

### Bulk Operations
Use import to perform bulk operations:
- Bulk create: Upload CSV with new records
- Bulk update: Upload CSV with existing IDs and new values
- Bulk activate/deactivate: Change is_active field for multiple records

---

## 🐛 Troubleshooting

### Import/Export Buttons Not Showing
- Verify `'import_export'` is in `INSTALLED_APPS`
- Restart Django server after adding to settings
- Check that admin class extends `ImportExportModelAdmin`

### Related Field Export Issues
- Use `__` notation: `category__name` (not `category.name`)
- Ensure ForeignKey relationships exist in models
- Check that related objects aren't None

### Import Validation Errors
- Check CSV column names match `export_order` fields
- Ensure ForeignKey values exist in database
- Verify data types match model field types
- Check required fields are not empty

---

## 📖 Documentation

Official documentation: https://django-import-export.readthedocs.io/

---

## ✨ Summary

Your Django admin now has professional-grade import/export capabilities across all 7 models:

1. **Users** - Export/import user accounts with full profile data
2. **Categories** - Manage learning content categories
3. **Grammar Lessons** - Export with category and creator names
4. **Video Lessons** - Full video metadata with relationships
5. **Vocabulary (TurkmenEnglishWord)** - Bilingual word database
6. **Chat Sessions** - User chat history with metadata
7. **Chat Messages** - Individual message data

All exports include related field names (not just IDs) for better readability and easier data management.

**Next Step**: Test the functionality in your Django admin panel!
