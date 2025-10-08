import requests
import json

def test_chat_api():
    url = "http://localhost:8000/api/v1/chat/sessions/test/"
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {response.headers}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_chat_api()