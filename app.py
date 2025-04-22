from flask import Flask, render_template, request, redirect, url_for
import json
from datetime import datetime

app = Flask(__name__)

# Load data from JSON files
def load_data():
    with open('data/learning.json') as f:
        learning_data = json.load(f)
    with open('data/quiz.json') as f:
        quiz_data = json.load(f)
    return learning_data, quiz_data

learning_data, quiz_data = load_data()

# Store user progress
user_data = {
    'current_page': 0,
    'quiz_answers': [],
    'start_time': None,
    'page_times': {}
}

@app.route('/')
def home():
    user_data['start_time'] = datetime.now().isoformat()
    return render_template('home.html')

@app.route('/learn/<int:page_num>')
def learn(page_num):
    if page_num < 1 or page_num > len(learning_data):
        return redirect(url_for('home'))
    
    # Record page visit time
    user_data['page_times'][f'learn_{page_num}'] = datetime.now().isoformat()
    user_data['current_page'] = page_num
    
    page_data = learning_data[page_num - 1]
    return render_template('learn.html', 
                         page_data=page_data,
                         page_num=page_num,
                         total_pages=len(learning_data))

@app.route('/quiz/<int:question_num>', methods=['GET', 'POST'])
def quiz(question_num):
    if question_num < 1 or question_num > len(quiz_data):
        return redirect(url_for('home'))
    
    # Record page visit time
    user_data['page_times'][f'quiz_{question_num}'] = datetime.now().isoformat()
    
    if request.method == 'POST':
        # Store the answer
        answer = request.form.get('answer')
        if not answer:
            # If no answer was selected, show the same question again
            return render_template('quiz.html',
                                question_data=quiz_data[question_num - 1],
                                question_num=question_num,
                                total_questions=len(quiz_data))
        
        user_data['quiz_answers'].append({
            'question': question_num,
            'answer': answer,
            'timestamp': datetime.now().isoformat()
        })
        
        # Redirect to next question or results
        if question_num < len(quiz_data):
            return redirect(url_for('quiz', question_num=question_num + 1))
        else:
            return redirect(url_for('results'))
    
    # For GET requests, show the current question
    question_data = quiz_data[question_num - 1]
    return render_template('quiz.html',
                         question_data=question_data,
                         question_num=question_num,
                         total_questions=len(quiz_data))


@app.route('/results')
def results():

    # Calculate score
    score = 0
    explanations = []
    
    for i, answer in enumerate(user_data['quiz_answers']):
        if answer['answer'] == quiz_data[i]['correct_answer']:
            score += 1
        explanations.append({
            'question': quiz_data[i]['question'],
            'user_answer': answer['answer'],
            'correct_answer': quiz_data[i]['correct_answer'],
            'explanation': quiz_data[i]['explanation']
        })
    
    # Reset user data for new session
    user_data['quiz_answers'] = []
    user_data['page_times'] = {}
    
    return render_template('results.html',
                         score=score,
                         total=len(quiz_data),
                         explanations=explanations)

if __name__ == '__main__':
    app.run(debug=True)