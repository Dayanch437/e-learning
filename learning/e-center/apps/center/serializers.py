from rest_framework import serializers
from .models import Center, Grammar, VideoLesson, TurkmenEnglishWord, Category
from apps.users.serializers import UserSerializer
from apps.users.enums import LessonStatus


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class CenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Center
        fields = '__all__'


class GrammarSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    
    class Meta:
        model = Grammar
        fields = "__all__"
  

class VideoLessonSerializer(serializers.ModelSerializer):
    

    class Meta:
        model = VideoLesson
        fields = "__all__"
    


class TurkmenEnglishWordSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = TurkmenEnglishWord
        fields = "__all__"
        