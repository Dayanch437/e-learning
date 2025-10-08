# Django Faker for E-Center

This module provides a Django management command to generate realistic fake data for all models in the E-Center application.

## Usage

To generate fake data for testing or development purposes, use the following command:

```bash
python manage.py generate_fake_data
```

### Options:

- `--users N`: Create N fake users (default: 10)
- `--centers N`: Create N fake centers (default: 3)
- `--categories N`: Create N fake categories (default: 8)
- `--grammar N`: Create N fake grammar lessons (default: 15)
- `--videos N`: Create N fake video lessons (default: 20)
- `--vocabulary N`: Create N fake vocabulary words (default: 100)
- `--clear`: Clear existing data before creating new data

### Examples:

Generate default amount of fake data:
```bash
python manage.py generate_fake_data
```

Generate specific amounts of data:
```bash
python manage.py generate_fake_data --users 50 --vocabulary 500
```

Clear existing data and generate new data:
```bash
python manage.py generate_fake_data --clear
```

## Generated Data

The command will create:

1. **Users** - With different roles (student, teacher, admin)
2. **Centers** - Language learning centers with basic information
3. **Categories** - For organizing content
4. **Grammar Lessons** - Fake grammar content with examples and exercises
5. **Video Lessons** - Placeholder video lessons with metadata
6. **Vocabulary Words** - Turkmen-English word pairs with definitions and examples

Note: The command creates placeholder entries for files (like videos or images). In a production environment, you would need to add actual files.

## Extending

To add support for new models:
1. Import the model in the command file
2. Add a method to create instances of the model
3. Call the method from the `handle` method
4. Add appropriate command line arguments if needed