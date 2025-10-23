from flask import Flask, jsonify, request, send_from_directory
import json
import random
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

API_TOKEN = os.getenv("API_TOKEN", "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")

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/questions')
def get_questions():
    with open('questions.json', 'r') as f:
        all_questions = json.load(f)
    
    all_questions_flat = []
    for topic in all_questions:
        all_questions_flat.extend(topic['questions'])

    random.shuffle(all_questions_flat)
    return jsonify(all_questions_flat[:20])

@app.route('/highscore', methods=['GET', 'POST'])
def highscore():
    if request.method == 'GET':
        try:
            with open('highscore.txt', 'r') as f:
                score = int(f.read())
        except (FileNotFoundError, ValueError):
            score = 0
        return jsonify({'highscore': score})
    else: # POST
        data = request.get_json()
        score = data['score']
        with open('highscore.txt', 'w') as f:
            f.write(str(score))
        return jsonify({'message': 'High score updated'})


@app.route('/explain', methods=['POST'])
def explain():
    data = request.get_json()
    prompt = data['prompt']

    if not API_TOKEN:
        return jsonify({"error": "API key not configured"}), 500

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {API_TOKEN}",
                "Content-Type": "application/json",
            },
            data=json.dumps({
                "model": "deepseek/deepseek-r1-0528-qwen3-8b:free",
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
            })
        ).json()

        ai_response = response["choices"][0]["message"]["content"]
        return jsonify({"explanation": ai_response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/evaluate-code', methods=['POST'])
def evaluate_code():
    data = request.get_json()
    question = data.get('question')
    code = data.get('code')

    if not API_TOKEN:
        return jsonify({"error": "API key not configured"}), 500

    prompt = f'''
You are a Python code evaluation bot.
A user was given the following question:
---
{question}
---

The user submitted this code:
---
{code}
---

Evaluate the code. Is it a correct solution for the question?
Respond in a raw JSON format with two keys: "correct" (boolean) and "explanation" (a short string, max 2-3 sentences).
If the code is wrong, explain the primary error. If it's correct, the explanation can be a simple confirmation.
Example for incorrect: {{"correct": false, "explanation": "Your code fails for negative numbers."}}
Example for correct: {{"correct": true, "explanation": "Your solution is correct and handles all cases."}}
'''

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {API_TOKEN}",
                "Content-Type": "application/json",
            },
            data=json.dumps({
                "model": "deepseek/deepseek-r1-0528-qwen3-8b:free",
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"}, # Request JSON output
            })
        ).json()

        ai_response_str = response["choices"][0]["message"]["content"]
        # The AI response is a string containing JSON, so we parse it.
        ai_response_json = json.loads(ai_response_str)
        return jsonify(ai_response_json)

    except Exception as e:
        # If the AI fails to return valid JSON or another error occurs
        return jsonify({"correct": False, "explanation": f"An error occurred during evaluation: {str(e)}"})


@app.route('/get-solution', methods=['POST'])
def get_solution():
    data = request.get_json()
    question = data.get('question')

    if not API_TOKEN:
        return jsonify({"error": "API key not configured"}), 500

    prompt = f'''
A user was asked the following Python programming question:
---
{question}
---

Please provide a correct and well-explained Python solution for this question.
The code should be simple, easy to understand, and complete.
'''

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {API_TOKEN}",
                "Content-Type": "application/json",
            },
            data=json.dumps({
                "model": "deepseek/deepseek-r1-0528-qwen3-8b:free",
                "messages": [{"role": "user", "content": prompt}],
            })
        ).json()

        ai_response = response["choices"][0]["message"]["content"]
        return jsonify({"solution": ai_response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/<path:path>')
def send_static(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    app.run(debug=True)
