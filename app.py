from flask import Flask, render_template, request, redirect, url_for, session
import json
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'mykey' # only for vercel

# Load data from JSON files
def load_data():
    with open('data/learning.json') as f:
        learning_data = json.load(f)
    with open('data/quiz.json') as f:
        quiz_data = json.load(f)
    return learning_data, quiz_data

learning_data, quiz_data = load_data()

def init_session():
    """Initialize session variables if they don't exist"""
    if 'start_time' not in session:
        session['start_time'] = datetime.now().isoformat()
    if 'current_page' not in session:
        session['current_page'] = 0
    if 'quiz_answers' not in session:
        session['quiz_answers'] = []
    if 'page_times' not in session:
        session['page_times'] = {}

@app.route('/')
def home():
    """Home page - initialize session and start tracking"""
    init_session()
    session['start_time'] = datetime.now().isoformat()
    session.modified = True
    return render_template('home.html')

@app.route('/learn/<int:page_num>')
def learn(page_num):
    """Learning content pages"""
    if page_num < 1 or page_num > len(learning_data):
        return redirect(url_for('home'))
    
    init_session()
    session['page_times'][f'learn_{page_num}'] = datetime.now().isoformat()
    session['current_page'] = page_num
    session.modified = True
    
    page_data = learning_data[page_num - 1]
    return render_template(f'lesson{page_num}.html', 
                         page_data=page_data,
                         page_num=page_num,
                         total_pages=len(learning_data))

@app.route('/quiz/<int:question_num>', methods=['GET', 'POST'])
def quiz(question_num):
    """Quiz questions - handles both displaying and processing answers"""
    if question_num < 1 or question_num > len(quiz_data):
        return redirect(url_for('home'))
    
    init_session()
    session['page_times'][f'quiz_{question_num}'] = datetime.now().isoformat()
    session.modified = True

    if request.method == 'POST':
        answer = request.form.get('answer')
        if not answer:
            # No answer selected - show same question again with error
            return render_template('quiz.html',
                                question_data=quiz_data[question_num - 1],
                                question_num=question_num,
                                total_questions=len(quiz_data),
                                error="Please select an answer!")
        
        # Find existing answer or create new one
        existing_answer = next((a for a in session['quiz_answers'] if a['question'] == question_num), None)
        
        if existing_answer:
            existing_answer['answer'] = answer
            existing_answer['timestamp'] = datetime.now().isoformat()
        else:
            session['quiz_answers'].append({
                'question': question_num,
                'answer': answer,
                'timestamp': datetime.now().isoformat()
            })
        
        session.modified = True
        
        # Proceed to next question or results
        if question_num < len(quiz_data):
            return redirect(url_for('quiz', question_num=question_num + 1))
        else:
            return redirect(url_for('results'))
    
    # GET request - show the question
    question_data = quiz_data[question_num - 1]
    
    # Check if user already answered this question
    user_answer = next((a for a in session['quiz_answers'] if a['question'] == question_num), None)
    
    return render_template('quiz.html',
                         question_data=question_data,
                         question_num=question_num,
                         total_questions=len(quiz_data),
                         user_answer=user_answer['answer'] if user_answer else None)

@app.route('/results')
def results():
    """Display quiz results"""
    init_session()
    total_questions = len(quiz_data)
    
    # Verify all questions were answered
    if len(session['quiz_answers']) != total_questions:
        return redirect(url_for('quiz', question_num=1))
    
    # Calculate score and prepare explanations
    score = 0
    explanations = []
    sorted_answers = sorted(session['quiz_answers'], key=lambda x: x['question'])
    
    for answer in sorted_answers:
        question_idx = answer['question'] - 1
        if question_idx < 0 or question_idx >= total_questions:
            continue
            
        is_correct = answer['answer'] == quiz_data[question_idx]['correct_answer']
        if is_correct:
            score += 1
            
        explanations.append({
            'question': quiz_data[question_idx]['question'],
            'user_answer': answer['answer'],
            'correct_answer': quiz_data[question_idx]['correct_answer'],
            'explanation': quiz_data[question_idx]['explanation'],
            'is_correct': is_correct
        })
    
    # Ensure score is valid
    score = min(max(score, 0), total_questions)
    
    # Clear quiz answers for new attempt (keep other session data)
    session['quiz_answers'] = []
    session.modified = True
    
    return render_template('results.html',
                         score=score,
                         total=total_questions,
                         explanations=explanations)

if __name__ == '__main__':
    app.run(debug=True)