from django.contrib import admin
from .models import Category, Grammar, VideoLesson, TurkmenEnglishWord

admin.site.register(Grammar)
admin.site.register(VideoLesson)
admin.site.register(TurkmenEnglishWord)
admin.site.register(Category)

