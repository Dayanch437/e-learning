# Django Import-Export Setup

## Overview
Django import-export functionality has been successfully added to all models in the project. This allows administrators to easily import and export data in various formats (CSV, Excel, JSON, etc.) directly from the Django admin interface.

## Installed Package
- **django-import-export==4.1.1**

## Configuration

### Settings
The `import_export` app has been added to `INSTALLED_APPS` in `/config/settings/base.py`:

```python
THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    'django_extensions',
    'import_export',  # Added for import/export functionality
]
```

## Models with Import-Export Support

### 1. Users App (`apps/users/admin.py`)
- **User Model**
  - Resource: `UserResource`
  - Admin: `UserAdmin` (extends both `BaseUserAdmin` and `ImportExportModelAdmin`)
  - Exportable fields: id, username, email, first_name, last_name, role, phone_number, date_of_birth, is_verified, is_staff, is_active, created_at, updated_at

### 2. Center App (`apps/center/admin.py`)
- **Center Model**
  - Resource: `CenterResource`
  - Admin: `CenterAdmin`
  - Exportable fields: id, name, description, address, phone, email, is_active, created_at, updated_at

- **Category Model**
  - Resource: `CategoryResource`
  - Admin: `CategoryAdmin`
  - Exportable fields: id, name, created_at, updated_at

- **Grammar Model**
  - Resource: `GrammarResource`
  - Admin: `GrammarAdmin`
  - Exportable fields: id, created_by, category, title, content, examples, exercises, status, order, estimated_duration, created_at, updated_at

- **VideoLesson Model**
  - Resource: `VideoLessonResource`
  - Admin: `VideoLessonAdmin`
  - Exportable fields: id, created_by, title, description, level, duration, status, order, views_count, created_at, updated_at

- **TurkmenEnglishWord Model**
  - Resource: `TurkmenEnglishWordResource`
  - Admin: `TurkmenEnglishWordAdmin`
  - Exportable fields: id, created_by, turkmen_word, english_word, definition, example_sentence, pronunciation, level, category, status, created_at, updated_at

### 3. Chatbot App (`apps/chatbot/admin.py`)
- **ChatSession Model**
  - Resource: `ChatSessionResource`
  - Admin: `ChatSessionAdmin`
  - Exportable fields: id, user, title, proficiency_level, learning_focus, created_at, updated_at

- **ChatMessage Model**
  - Resource: `ChatMessageResource`
  - Admin: `ChatMessageAdmin`
  - Exportable fields: id, session, role, content, created_at

### 4. Core App (`apps/core/admin.py`)
- No concrete models (only abstract base models)
- No import-export needed

## Features Added

### Import Functionality
- **CSV Import**: Upload CSV files to bulk create/update records
- **Excel Import**: Support for .xlsx and .xls files
- **JSON Import**: Import data from JSON format
- **Data validation**: Automatic validation during import process
- **Error reporting**: Detailed error messages for invalid data
- **Preview mode**: Preview changes before applying them

### Export Functionality
- **Multiple formats**: Export to CSV, Excel, JSON, TSV, ODS, YAML, HTML
- **Filtered exports**: Export only filtered/searched results
- **Custom field selection**: Choose which fields to include in export
- **Formatted data**: Proper formatting for dates, foreign keys, etc.

## Usage Instructions

### For Administrators

1. **Access Django Admin**: Navigate to `/admin/` and log in with admin credentials

2. **Export Data**:
   - Go to any model list view (e.g., Users, Grammar lessons, etc.)
   - Click the "Export" button at the top of the page
   - Select desired format (CSV, Excel, etc.)
   - Choose fields to export (optional)
   - Click "Export" to download the file

3. **Import Data**:
   - Go to any model list view
   - Click the "Import" button at the top of the page
   - Upload your file (CSV, Excel, JSON)
   - Map columns to model fields
   - Preview the import to check for errors
   - Confirm import to apply changes

### Supported File Formats
- **CSV** (.csv)
- **Excel** (.xlsx, .xls)
- **JSON** (.json)
- **TSV** (.tsv)
- **ODS** (.ods)
- **YAML** (.yaml, .yml)
- **HTML** (.html)

## Benefits

1. **Data Migration**: Easy migration of data between environments
2. **Backup/Restore**: Quick backup and restore of model data
3. **Bulk Operations**: Efficient bulk create/update operations
4. **Data Analysis**: Export data for external analysis tools
5. **Integration**: Easy integration with external systems
6. **User-Friendly**: No technical knowledge required for basic operations

## Security Considerations

- Only staff users with appropriate permissions can access import/export functionality
- File uploads are validated for format and content
- Large imports are processed efficiently to prevent timeouts
- Error handling prevents data corruption during failed imports

## Next Steps

1. Test import/export functionality in development environment
2. Train administrators on how to use the new features
3. Set up regular data backup procedures using export functionality
4. Consider adding custom export templates for specific business needs

## Troubleshooting

### Common Issues
1. **Import errors**: Check file format and column headers match expected fields
2. **Foreign key errors**: Ensure referenced objects exist before importing
3. **Permission errors**: Verify user has appropriate admin permissions
4. **Large file timeouts**: Consider splitting large imports into smaller batches

### Support
For technical support or custom import/export requirements, contact the development team.