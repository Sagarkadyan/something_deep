import json
import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_TOKEN = os.getenv("API_TOKEN", "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")
API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "deepseek/deepseek-r1-0528-qwen3-8b:free"

def get_solution_from_api(question):
    prompt = f"Provide a Python solution for the following problem:\n{question}"
    try:
        response = requests.post(
            url=API_URL,
            headers={
                "Authorization": f"Bearer {API_TOKEN}",
                "Content-Type": "application/json",
            },
            data=json.dumps({
                "model": MODEL,
                "messages": [{"role": "user", "content": prompt}],
            })
        ).json()
        return response["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Error getting solution for question: {question[:50]}...")
        print(e)
        return "Solution could not be fetched."

def main():
    with open('coding_questions.json', 'r') as f:
        questions = json.load(f)

    for i, question_data in enumerate(questions):
        if question_data["answer"] == "Solution could not be fetched.":
            print(f"Fetching solution for question {i+1}...")
            solution = get_solution_from_api(question_data["question"])
            question_data["answer"] = solution

    with open('coding_questions.json', 'w') as f:
        json.dump(questions, f, indent=2)

    print("Finished fetching solutions.")

if __name__ == '__main__':
    main()
