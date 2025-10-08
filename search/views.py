from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from dictionary.models import TurkmenEnglishWord

class SearchView(APIView):
    """
    API endpoint for searching Turkmen-English words.
    """
    
    def get(self, request):
        query = request.query_params.get('q', '')
        
        if not query or len(query) < 2:
            return Response(
                {"error": "Search query must be at least 2 characters long"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Perform the search
        results = TurkmenEnglishWord.objects.filter(
            Q(turkmen_word__icontains=query) | 
            Q(english_word__icontains=query)
        ).values('id', 'turkmen_word', 'english_word', 'part_of_speech')[:50]  # Limit to 50 results
        
        return Response({
            "count": len(results),
            "results": list(results)
        })
