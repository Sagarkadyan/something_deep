const quizArea = document.getElementById('quiz-area');
const questionContainer = document.getElementById('question-container');
const questionEl = document.getElementById('question');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const resultContainer = document.getElementById('result-container');
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const restartBtn = document.getElementById('restart-btn');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('error-message');

const explainBtn = document.getElementById('explain-btn');
const explanationContainer = document.getElementById('explanation-container');
const explanationText = document.getElementById('explanation-text');

let questions = [];
let currentQuestionIndex = 0;
let score = 0;

function showError(message) {
    errorMessage.textContent = message;
    errorContainer.classList.remove('hidden');
    quizArea.classList.add('hidden');
}

function fetchQuestions() {
    fetch('/questions')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                showError('No questions received from the server.');
                return;
            }
            questions = data;
            currentQuestionIndex = 0;
            score = 0;
            quizArea.classList.remove('hidden');
            resultContainer.classList.add('hidden');
            errorContainer.classList.add('hidden');
            showQuestion();
        })
        .catch(error => {
            showError('There has been a problem with your fetch operation: ' + error.message);
        });
}

function showQuestion() {
  const currentQuestion = questions[currentQuestionIndex];
  questionEl.textContent = currentQuestion.question;
  optionsContainer.innerHTML = '';
  explainBtn.classList.add('hidden');
  explanationContainer.classList.add('hidden');
  explanationText.textContent = '';

  currentQuestion.options.forEach(option => {
    const button = document.createElement('button');
    button.textContent = option;
    button.addEventListener('click', () => selectAnswer(button, option, currentQuestion.answer));
    optionsContainer.appendChild(button);
  });
}

function selectAnswer(button, selectedOption, correctAnswer) {
  if (selectedOption === correctAnswer) {
    button.classList.add('correct');
    score++;
  } else {
    button.classList.add('incorrect');
    Array.from(optionsContainer.children).forEach(btn => {
      if (btn.textContent === correctAnswer) {
        btn.classList.add('correct');
      }
    });
  }

  // Disable all buttons after an answer is selected
  Array.from(optionsContainer.children).forEach(btn => {
    btn.disabled = true;
  });

  nextBtn.classList.remove('hidden');
  explainBtn.classList.remove('hidden');
}

function showNextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
    nextBtn.classList.add('hidden');
  } else {
    showResult();
  }
}

function showResult() {
  quizArea.classList.add('hidden');
  resultContainer.classList.remove('hidden');
  scoreEl.textContent = `${score} / ${questions.length}`;

  fetch('/highscore')
    .then(response => response.json())
    .then(data => {
      let highscore = data.highscore;
      if (score > highscore) {
        highscore = score;
        fetch('/highscore', {
          method: 'POST', 
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ score: score })
        });
      }
      highscoreEl.textContent = highscore;
    });
}

restartBtn.addEventListener('click', fetchQuestions);
nextBtn.addEventListener('click', showNextQuestion);

explainBtn.addEventListener('click', () => {
  const currentQuestion = questions[currentQuestionIndex];
  const prompt = `Explain why the answer to the question "${currentQuestion.question}" is "${currentQuestion.answer}".`;

  explanationText.textContent = 'Loading explanation...';
  explanationContainer.classList.remove('hidden');

  fetch('/explain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt: prompt })
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      explanationText.textContent = `Error: ${data.error}`;
    } else {
      explanationText.textContent = data.explanation;
    }
  })
  .catch(error => {
      explanationText.textContent = `Error: ${error.message}`;
  });
});

// Initial fetch for the quiz
fetchQuestions();

// --- Appended JS for Coding Practice ---

const codingContainer = document.getElementById('coding-container');
const quizContainer = document.querySelector('.quiz-container');
const showQuizBtn = document.getElementById('show-quiz-btn');
const showCodingBtn = document.getElementById('show-coding-btn');

const codingQuestionEl = document.getElementById('coding-question');
const codeAnswerEl = document.getElementById('code-answer');
const submitCodeBtn = document.getElementById('submit-code-btn');
const nextCodingBtn = document.getElementById('next-coding-btn');

const feedbackContainer = document.getElementById('feedback-container');
const feedbackTitleEl = document.getElementById('feedback-title');
const feedbackTextEl = document.getElementById('feedback-text');
const getSolutionBtn = document.getElementById('get-solution-btn');
const solutionContainer = document.getElementById('solution-container');

let codingQuestions = [];
let currentCodingQuestionIndex = 0;

// Navigation
showQuizBtn.addEventListener('click', () => {
  quizContainer.classList.remove('hidden');
  codingContainer.classList.add('hidden');
  // Reset quiz state if needed
  fetchQuestions(); 
});

showCodingBtn.addEventListener('click', () => {
  quizContainer.classList.add('hidden');
  resultContainer.classList.add('hidden'); // Also hide quiz result container
  codingContainer.classList.remove('hidden');
  loadCodingQuestions();
});

async function loadCodingQuestions() {
  // Only fetch if not already loaded
  if (codingQuestions.length === 0) {
    try {
      const res = await fetch('coding_questions.json');
      if (!res.ok) {
        throw new Error(`Failed to load coding questions. Status: ${res.status}`);
      }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No coding questions found in the file.');
      }
      codingQuestions = data;
      currentCodingQuestionIndex = 0;
      showCodingQuestion();
    } catch (error) {
      console.error(error);
      codingQuestionEl.textContent = `Error loading questions: ${error.message}`;
    }
  }
}

function showCodingQuestion() {
  resetCodingState();
  const question = codingQuestions[currentCodingQuestionIndex];
  codingQuestionEl.textContent = question.question;
  submitCodeBtn.disabled = false;
}

function resetCodingState() {
  codeAnswerEl.value = '';
  feedbackContainer.classList.add('hidden');
  feedbackContainer.classList.remove('correct', 'incorrect');
  getSolutionBtn.classList.add('hidden');
  solutionContainer.classList.add('hidden');
  solutionContainer.textContent = '';
}

submitCodeBtn.addEventListener('click', async () => {
  const question = codingQuestions[currentCodingQuestionIndex].question;
  const code = codeAnswerEl.value;

  if (!code.trim()) {
    alert('Please write some code before submitting.');
    return;
  }

  submitCodeBtn.disabled = true;
  feedbackContainer.classList.remove('hidden');
  feedbackContainer.classList.remove('correct', 'incorrect');
  feedbackTitleEl.textContent = 'Evaluating...';
  feedbackTextEl.textContent = 'Please wait while your code is being checked.';

  try {
    const res = await fetch('/evaluate-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, code }),
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.statusText}`);
    }

    const feedback = await res.json();
    
    if (feedback.correct) {
      feedbackContainer.classList.add('correct');
      feedbackTitleEl.textContent = 'Correct!';
      feedbackTextEl.textContent = feedback.explanation || 'Well done!';
      getSolutionBtn.classList.add('hidden');
    } else {
      feedbackContainer.classList.add('incorrect');
      feedbackTitleEl.textContent = 'Incorrect';
      feedbackTextEl.textContent = feedback.explanation || 'Try again!';
      getSolutionBtn.classList.remove('hidden');
    }

  } catch (error) {
    console.error('Submission failed:', error);
    feedbackContainer.classList.add('incorrect');
    feedbackTitleEl.textContent = 'Error';
    feedbackTextEl.textContent = `Could not submit your answer. Is the backend server running? (${error.message})`;
  }
});

getSolutionBtn.addEventListener('click', async () => {
    const question = codingQuestions[currentCodingQuestionIndex].question;
    getSolutionBtn.disabled = true;
    solutionContainer.textContent = 'Loading solution...';
    solutionContainer.classList.remove('hidden');

    try {
        const res = await fetch('/get-solution', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question }),
        });

        if (!res.ok) {
            throw new Error(`API Error: ${res.statusText}`);
        }

        const result = await res.json();
        solutionContainer.textContent = result.solution;

    } catch (error) {
        console.error('Failed to get solution:', error);
        solutionContainer.textContent = `Could not retrieve the solution at this time. (${error.message})`;
    } finally {
        getSolutionBtn.disabled = false;
    }
});

nextCodingBtn.addEventListener('click', () => {
  currentCodingQuestionIndex++;
  if (currentCodingQuestionIndex < codingQuestions.length) {
    showCodingQuestion();
  } else {
    codingContainer.innerHTML = '<h2>You have completed all the coding challenges!</h2>';
  }
});

// Initial state: show quiz, hide coding
quizContainer.classList.remove('hidden');
codingContainer.classList.add('hidden');