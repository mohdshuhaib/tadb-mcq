// This event listener ensures that the script runs only after the
// full HTML page (DOM) has been loaded.
document.addEventListener('DOMContentLoaded', () => {

    // --- Global Variables ---
    let currentQuestions = []; // This will hold the shuffled list of questions
    let currentQuestionIndex = 0; // The index of the question we are currently on
    let score = 0; // The user's score
    
    // This Map stores which questions have been answered and what the user picked
    // Key: questionIndex, Value: { selected: user's_choice, correct: correct_answer_index }
    const answeredQuestions = new Map();

    // --- DOM Element References ---
    // We get all the HTML elements we need to interact with
    const progressText = document.getElementById('progress-text');
    const scoreText = document.getElementById('score-text');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const feedbackText = document.getElementById('feedback-text');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const jumpBtn = document.getElementById('jump-btn');
    const jumpInput = document.getElementById('jump-input');

    /**
     * Shuffles an array in place using the Fisher-Yates algorithm.
     * @param {Array} array The array to be shuffled.
     */
    function shuffleArray(array) {
        // We go backwards from the last element
        for (let i = array.length - 1; i > 0; i--) {
            // Pick a random index before the current one
            const j = Math.floor(Math.random() * (i + 1));
            // Swap elements
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Initializes or restarts the quiz.
     */
    function startQuiz() {
        // Create a new shuffled copy of the questions from questions.js
        // We use [...allQuestions] to make a copy, so the original array isn't changed
        currentQuestions = shuffleArray([...allQuestions]);
        
        // Reset all quiz state variables
        currentQuestionIndex = 0;
        score = 0;
        answeredQuestions.clear();
        
        // Set the max value for the jump input
        jumpInput.max = currentQuestions.length;
        
        updateScore();
        loadQuestion(currentQuestionIndex);
    }

    /**
     * Loads a specific question onto the page.
     * @param {number} index The index of the question to load from currentQuestions.
     */
    function loadQuestion(index) {
        if (index < 0 || index >= currentQuestions.length) return; // Safety check

        const question = currentQuestions[index];
        const questionData = answeredQuestions.get(index); // Check if this question was already answered

        // 1. Update text elements
        questionText.textContent = question.q;
        progressText.textContent = `سؤال ${index + 1} من ${currentQuestions.length}`;
        
        // 2. Clear old options and feedback
        optionsContainer.innerHTML = '';
        feedbackText.textContent = '\u00A0'; // Non-breaking space for height
        feedbackText.className = ''; // Reset feedback class

        // 3. Create and display new option buttons
        question.o.forEach((option, i) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.classList.add('option-btn');
            button.dataset.index = i; // Store the option index (0-3)

            if (questionData) {
                // This question has been answered, show the results
                button.disabled = true;
                if (i === question.a) {
                    // This is the correct answer
                    button.classList.add('correct');
                }
                if (i === questionData.selected && i !== question.a) {
                    // This is the wrong answer the user selected
                    button.classList.add('incorrect');
                }
            } else {
                // This question is new, add the click event
                button.addEventListener('click', () => handleOptionClick(button, i, question.a));
            }
            optionsContainer.appendChild(button);
        });

        // 4. Update navigation button states
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === currentQuestions.length - 1;
        
        // 5. Show feedback if question was already answered
        if (questionData) {
            const isCorrect = questionData.selected === questionData.correct;
            feedbackText.textContent = isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة';
            feedbackText.classList.add(isCorrect ? 'feedback-correct' : 'feedback-incorrect');
        }
    }

    /**
     * Handles the logic when a user clicks an option.
     * @param {HTMLButtonElement} button The button that was clicked.
     * @param {number} selectedIndex The index of the selected option.
     * @param {number} correctIndex The index of the correct answer.
     */
    function handleOptionClick(button, selectedIndex, correctIndex) {
        // 1. Store the answer
        answeredQuestions.set(currentQuestionIndex, { selected: selectedIndex, correct: correctIndex });

        const isCorrect = selectedIndex === correctIndex;

        // 2. Provide visual feedback
        if (isCorrect) {
            score++;
            feedbackText.textContent = 'إجابة صحيحة!';
            feedbackText.classList.add('feedback-correct');
            button.classList.add('correct');
        } else {
            feedbackText.textContent = 'إجابة خاطئة';
            feedbackText.classList.add('feedback-incorrect');
            button.classList.add('incorrect');
        }

        // 3. Disable all buttons and show the correct answer
        Array.from(optionsContainer.children).forEach(btn => {
            btn.disabled = true;
            const btnIndex = parseInt(btn.dataset.index);
            if (btnIndex === correctIndex) {
                // Always highlight the correct answer
                btn.classList.add('show-correct'); 
            }
        });

        // 4. Update score
        updateScore();
    }

    /**
     * Updates the score display.
     */
    function updateScore() {
        scoreText.textContent = `النتيجة: ${score}`;
    }

    /**
     * Loads the next question.
     */
    function nextQuestion() {
        if (currentQuestionIndex < currentQuestions.length - 1) {
            currentQuestionIndex++;
            loadQuestion(currentQuestionIndex);
        }
    }

    /**
     * Loads the previous question.
     */
    function prevQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            loadQuestion(currentQuestionIndex);
        }
    }

    /**
     * Jumps to a specific question number.
     */
    function jumpToQuestion() {
        const num = parseInt(jumpInput.value);
        if (num >= 1 && num <= currentQuestions.length) {
            currentQuestionIndex = num - 1;
            loadQuestion(currentQuestionIndex);
            jumpInput.value = ''; // Clear input
        } else {
            // Use a simple alert for invalid number
            alert(`الرجاء إدخال رقم بين 1 و ${currentQuestions.length}`);
        }
    }

    // --- Event Listeners ---
    // Assign functions to buttons
    shuffleBtn.addEventListener('click', startQuiz);
    nextBtn.addEventListener('click', nextQuestion);
    prevBtn.addEventListener('click', prevQuestion);
    jumpBtn.addEventListener('click', jumpToQuestion);
    
    // Allow pressing Enter in the jump input
    jumpInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            jumpToQuestion();
        }
    });

    // --- Start the Quiz ---
    // This is the first function that runs when the script loads
    startQuiz();
});
