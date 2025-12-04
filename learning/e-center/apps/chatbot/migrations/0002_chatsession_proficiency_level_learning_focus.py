from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chatbot', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='chatsession',
            name='proficiency_level',
            field=models.CharField(choices=[('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')], default='intermediate', max_length=20),
        ),
        migrations.AddField(
            model_name='chatsession',
            name='learning_focus',
            field=models.CharField(choices=[('general', 'General English'), ('grammar', 'Grammar'), ('vocabulary', 'Vocabulary'), ('conversation', 'Conversation'), ('reading', 'Reading'), ('writing', 'Writing'), ('pronunciation', 'Pronunciation'), ('exam', 'Exam Preparation')], default='general', max_length=20),
        ),
    ]