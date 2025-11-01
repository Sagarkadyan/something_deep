const flashcard = document.querySelector('.flashcard');
const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const flipBtn = document.getElementById('flip-btn');
const nextBtn = document.getElementById('next-btn');
const progressText = document.getElementById('progress-text');

let flashcards = [];
let currentCardIndex = 0;

async function loadFlashcards() {
    try {
        const response = await fetch('flashcards.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let data = await response.json();
        if (typeof data === 'string') {
            flashcards = JSON.parse(data);
        } else {
            flashcards = data;
        }
        console.log('Loaded flashcards:', flashcards);
        console.log('Number of flashcards:', flashcards.length);
    } catch (error) {
        console.error('Error loading flashcards:', error);
        questionEl.textContent = 'Error loading flashcards. See console for details.';
        flashcards = [];
    }
    showCard();
}

function showCard() {
    if (currentCardIndex < flashcards.length) {
        const card = flashcards[currentCardIndex];
        questionEl.textContent = card.question;
        answerEl.textContent = card.answer;
        progressText.textContent = `Card ${currentCardIndex + 1} of ${flashcards.length}`;
        flashcard.classList.remove('flipped');
    } else {
        questionEl.textContent = "You've completed all the flashcards!";
        answerEl.textContent = "";
        progressText.textContent = "";
        flipBtn.disabled = true;
        nextBtn.disabled = true;
    }
}

function flipCard() {
    flashcard.classList.toggle('flipped');
}

function nextCard() {
    currentCardIndex++;
    showCard();
}

flipBtn.addEventListener('click', flipCard);
nextBtn.addEventListener('click', nextCard);
flashcard.addEventListener('click', flipCard);

loadFlashcards();