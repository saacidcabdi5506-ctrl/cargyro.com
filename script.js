const startBtn = document.querySelector(".start-btn");
const popupInfo = document.querySelector(".popup-info");
const exitBtn = document.querySelector(".exit-btn");
const main = document.querySelector(".main");
const continueBtn = document.querySelector(".continue-btn");
const QuizSection = document.querySelector(".quiz-section");
const quizBox = document.querySelector(".quiz-box");
let nextBtn = document.querySelector(".next-btn");
let optionList = document.querySelector(".option-list");
let questionText = document.querySelector(".question-text");
let questionTotal = document.querySelector(".question-total");
let headerScore = document.querySelector(".header-score");
let timerText = document.querySelector(".timer-text");
let timerRing = document.querySelector(".timer-ring-fg");

const TIME_PER_QUESTION = 15;
const RING_CIRCUMFERENCE = 100.5; // 2 * PI * r(16), matches the SVG circle

let questionCount = 0;
let score = 0;
let answered = false; // stops double-clicking / clicking after picking
let timeLeft = TIME_PER_QUESTION;
let timerInterval = null;

startBtn.onclick = () => {
    popupInfo.classList.add('active');
    main.classList.add('active');
};

exitBtn.onclick = () => {
    popupInfo.classList.remove('active');
    main.classList.remove('active');
};

continueBtn.onclick = () => {
    popupInfo.classList.remove('active');
    QuizSection.classList.add('active');
    main.classList.add('active');
    quizBox.classList.add('active');

    questionCount = 0;
    score = 0;
    updateScoreDisplay();
    showQuestions(questionCount);
};

nextBtn.onclick = () => {
    questionCount++;
    if (questionCount < questions.length) {
        showQuestions(questionCount);
    } else {
        showResult();
    }
};

// builds the question + options on screen from the questions array
function showQuestions(index) {
    answered = false;
    nextBtn.disabled = false; // re-enable in case it was locked

    const current = questions[index];
    questionText.textContent = `${current.numb}. ${current.question}`;
    questionTotal.textContent = `${current.numb} of ${questions.length} Questions`;

    // clear old options, then rebuild from the array
    optionList.innerHTML = "";

    current.options.forEach((optionText) => {
        const div = document.createElement("div");
        div.classList.add("option");
        div.innerHTML = `<span>${optionText}</span>`;

        div.onclick = () => selectOption(div, optionText, current.answer);
        optionList.appendChild(div);
    });

    // change button label to "Finish" on last question
    nextBtn.textContent = (index === questions.length - 1) ? "Finish" : "Next";

    startTimer();
}

// ===== 15 second countdown per question =====
function startTimer() {
    clearInterval(timerInterval);
    timeLeft = TIME_PER_QUESTION;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeUp();
        }
    }, 1000);
}

function updateTimerDisplay() {
    timerText.textContent = timeLeft;

    const offset = RING_CIRCUMFERENCE - (timeLeft / TIME_PER_QUESTION) * RING_CIRCUMFERENCE;
    timerRing.style.strokeDashoffset = offset;

    // turn red once 5 seconds or less remain, for urgency
    if (timeLeft <= 5) {
        timerRing.classList.add("warning");
        timerText.classList.add("warning");
    } else {
        timerRing.classList.remove("warning");
        timerText.classList.remove("warning");
    }
}

// time runs out before the user picks an option
function handleTimeUp() {
    if (answered) return;
    answered = true;

    const current = questions[questionCount];
    const allOptions = optionList.querySelectorAll(".option");

    allOptions.forEach((opt) => {
        opt.style.pointerEvents = "none";
        if (opt.textContent.substring(3) === current.answer) {
            opt.style.background = "rgba(0, 200, 0, 0.4)";
            opt.style.borderColor = "rgb(0, 200, 0)";
        }
    });

    // brief pause so the user can see the correct answer, then move on
    setTimeout(() => {
        nextBtn.click();
    }, 1200);
}

// handles what happens when a user clicks an option
function selectOption(selectedDiv, optionText, correctAnswer) {
    if (answered) return; // ignore extra clicks after first answer
    answered = true;
    clearInterval(timerInterval);

    // the option text starts with "A: ", "B: " etc, strip that prefix to compare
    const cleanOption = optionText.substring(3);

    const allOptions = optionList.querySelectorAll(".option");

    allOptions.forEach((opt) => {
        opt.style.pointerEvents = "none"; // lock all options after answering
    });

    if (cleanOption === correctAnswer) {
        selectedDiv.style.background = "rgba(0, 200, 0, 0.4)";
        selectedDiv.style.borderColor = "rgb(0, 200, 0)";
        score++;
        updateScoreDisplay();
    } else {
        selectedDiv.style.background = "rgba(200, 0, 0, 0.4)";
        selectedDiv.style.borderColor = "rgb(200, 0, 0)";

        // also highlight the correct one in green so the user sees it
        allOptions.forEach((opt) => {
            if (opt.textContent.substring(3) === correctAnswer) {
                opt.style.background = "rgba(0, 200, 0, 0.4)";
                opt.style.borderColor = "rgb(0, 200, 0)";
            }
        });
    }
}

function updateScoreDisplay() {
    headerScore.textContent = `Score: ${score} / ${questions.length}`;
}

// shown after the last question instead of crashing on questions[5]
function showResult() {
    clearInterval(timerInterval);

    quizBox.innerHTML = `
        <h1>Quiz Completed!</h1>
        <div class="result-score">
            <h2>${score} / ${questions.length}</h2>
            <p>You scored ${score} out of ${questions.length}</p>
        </div>
        <div class="result-actions">
            <button class="result-btn return-btn" id="return-btn">Return to Quiz</button>
            <button class="result-btn exit-result-btn" id="exit-result-btn">Exit</button>
        </div>
    `;

    document.getElementById("return-btn").onclick = () => {
        questionCount = 0;
        score = 0;
        rebuildQuizBox();
        updateScoreDisplay();
        showQuestions(questionCount);
    };

    document.getElementById("exit-result-btn").onclick = () => {
        clearInterval(timerInterval);
        QuizSection.classList.remove('active');
        quizBox.classList.remove('active');
        main.classList.remove('active');
    };
}

// rebuilds the quiz box's original inner HTML after showResult() wiped it out
function rebuildQuizBox() {
    quizBox.innerHTML = `
        <h1>Logistic Question</h1>
        <div class="quiz-header">
            <span>Electronic Cargo Tracking</span>
            <span class="header-score">Score: 0 / 5</span>
        </div>

        <div class="timer-wrap">
            <svg class="timer-ring" viewBox="0 0 36 36">
                <circle class="timer-ring-bg" cx="18" cy="18" r="16"></circle>
                <circle class="timer-ring-fg" cx="18" cy="18" r="16"></circle>
            </svg>
            <span class="timer-text">15</span>
        </div>

        <h2 class="question-text"></h2>

        <div class="option-list"></div>

        <div class="quiz-footer">
            <span class="question-total"></span>
            <button class="next-btn">Next</button>
        </div>
    `;

    // re-grab references since the old elements were destroyed by innerHTML reset
    questionText = document.querySelector(".question-text");
    questionTotal = document.querySelector(".question-total");
    headerScore = document.querySelector(".header-score");
    optionList = document.querySelector(".option-list");
    nextBtn = document.querySelector(".next-btn");
    timerText = document.querySelector(".timer-text");
    timerRing = document.querySelector(".timer-ring-fg");

    nextBtn.onclick = () => {
        questionCount++;
        if (questionCount < questions.length) {
            showQuestions(questionCount);
        } else {
            showResult();
        }
    };
}