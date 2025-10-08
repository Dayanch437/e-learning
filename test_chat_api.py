import requests
import json
import time

def test_chat_api():
    url = "http://localhost:8000/api/v1/chat/sessions/chat/"
    headers = {"Content-Type": "application/json"}
    data = {
        "message": "Hello, can you help me learn English?", 
        "proficiency_level": "intermediate",
        "learning_focus": "grammar"
    }
    
    try:
        print("Sending request to chat API...")
        start_time = time.time()
        response = requests.post(url, headers=headers, json=data)
        elapsed_time = time.time() - start_time
        
        print(f"Request completed in {elapsed_time:.2f} seconds")
        print(f"Status Code: {response.status_code}")
        print(f"Content Type: {response.headers.get('Content-Type', 'Unknown')}")
        
        if 'application/json' in response.headers.get('Content-Type', ''):
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        elif response.status_code == 200:
            print("Success, but response was not JSON")
            print(response.text[:500] + ("..." if len(response.text) > 500 else ""))
        else:
            print("Error response (first 500 chars):")
            print(response.text[:500] + ("..." if len(response.text) > 500 else ""))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Starting chat API test...")
    test_chat_api()
    print("Test completed.")


if __name__ == "__main__":
    test_chat_api()