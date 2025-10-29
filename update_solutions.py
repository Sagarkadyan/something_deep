import json
import requests
import os

# Load API_TOKEN from environment variables or use a default
API_TOKEN = os.getenv("API_TOKEN", "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")

if not API_TOKEN:
    print("API_TOKEN not configured. Please set the API_TOKEN environment variable.")
    exit()

def get_ai_solution(question_text):
    url = "http://127.0.0.1:5000/get-solution" # Assuming Flask server runs on 5000
    headers = {
        "Content-Type": "application/json",
    }
    data = {
        "question": question_text
    }
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status() # Raise an exception for HTTP errors
        return response.json().get("solution")
    except requests.exceptions.RequestException as e:
        print(f"Error fetching solution for question: {question_text[:50]}...")
        print(f"Error: {e}")
        return None

def update_coding_questions_with_solutions(file_path):
    with open(file_path, 'r') as f:
        coding_questions = json.load(f)

    updated_questions = []
    for i, q in enumerate(coding_questions):
        if "answer" not in q or not q["answer"].strip(): # Only fetch if answer is missing or empty
            print(f"Fetching solution for Q{i+1}...")
            solution = get_ai_solution(q["question"])
            if solution:
                q["answer"] = solution
            else:
                q["answer"] = "Solution could not be fetched."
        updated_questions.append(q)

    with open(file_path, 'w') as f:
        json.dump(updated_questions, f, indent=2)
    print(f"Updated {file_path} with solutions.")

# Path to your coding_questions.json file
json_file_path = "/home/sagar/Downloads/FireShot/coding_questions.json"
update_coding_questions_with_solutions(json_file_path)
