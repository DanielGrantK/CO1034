//refresh the page with available treasure hunts
const refreshButton = document.getElementById("refresh");
refreshButton.addEventListener("click", function() {
    const list = document.getElementById("hunts_list");
    list.innerHTML = "";
    getChallenges();
});

//hide error message
document.getElementById("error-ok").addEventListener("click", () => {
    document.getElementById("error-alert").style.display = "none";
})

//variables for the START
let appName = "Lynx_Trail";
let playerName = "";
let playerEmail = "";

//variables for the game
let treasureHuntsArray = [];
let challengesList = document.getElementById("hunts_list");
let selectedChallengeID = "";

let session = "";
let numOfQuestions = 0;
let currentQuestionIndex = 0;

let questionType = "";
let questionText = "";

let playerScore = 0;
let correctScore = 0;
let wrongScore = 0;
let skipScore = 0;
let scoreDisplay = document.getElementById("score");

let canBeSkipped = false;
let requiresLocation = false;

let treasureHuntAnswer = "";

function getChallenges() {
    fetch("https://codecyprus.org/th/api/list")
        .then(response => response.json()) //Parse JSON text to JavaScript object
        .then(jsonObject => {
            console.log(jsonObject);
            treasureHuntsArray = jsonObject.treasureHunts;

            for (let i = 0; i < treasureHuntsArray.length; i++) {

                //create line in the list
                let listItem = document.createElement("li");

                //create the button in the list to select the treasure hunt
                let listButton = document.createElement("button");
                listButton.textContent = treasureHuntsArray[i].name;
                let treasureHuntID = treasureHuntsArray[i].uuid;

                //select the treasure hunt and then open the form
                listButton.addEventListener("click", () => {
                    document.getElementById("hunt-start").style.display = "block";
                    document.getElementById("hunt-list").style.display = "none";
                    document.getElementById("refresh").style.display = "none";

                    selectedChallengeID = treasureHuntID;
                })

                listItem.appendChild(listButton);
                challengesList.appendChild(listItem);
            }
        });
}

getChallenges();

//save the player name and email
let startForm = document.getElementById("start-form");
startForm.addEventListener("submit", (e) => {
    e.preventDefault();
    playerName = document.getElementById("player_name").value;
    playerEmail = document.getElementById("player_email").value;

    startChallenge(selectedChallengeID);
})

async function startChallenge(selectedChallengeID) {

    let url_start = "https://codecyprus.org/th/api/start?player=" + playerName + "&app=" +
        appName + "&treasure-hunt-id=" + selectedChallengeID;

    try {
        const response = await fetch(url_start);
        const treasureHuntGame = await response.json();

        if (treasureHuntGame.status === "OK") {

            session = treasureHuntGame.session;
            numOfQuestions = treasureHuntGame.numOfQuestions;

            await getQuestion();
        }
        else {
            console.log("Error: ", treasureHuntGame.errorMessages);
            document.getElementById("error-message-text").textContent = treasureHuntGame.errorMessages;
            document.getElementById("error-alert").style.display = "block";
        }

    }
    catch (error) {
        console.log("Error: ", error);
    }
}

async function getQuestion() {

    console.log("get question started");

    let url_question = "https://codecyprus.org/th/api/question?session=" + session;

    try {
        const response = await fetch(url_question);
        const treasureHuntQuestion = await response.json();

        console.log(treasureHuntQuestion);

        if (treasureHuntQuestion.status === "OK") {

            //display the question
            document.getElementById("question").style.display = "block";
            questionText = document.getElementById("question-text");
            questionText.innerHTML = treasureHuntQuestion.questionText;

            //hide all questions types
            document.getElementById("BOOLEAN").style.display = "none";
            document.getElementById("MCQ").style.display = "none";
            document.getElementById("INTEGER").style.display = "none";
            document.getElementById("NUMERIC").style.display = "none";
            document.getElementById("TEXT").style.display = "none";

            //display the HTML for current question type
            questionType = treasureHuntQuestion.questionType;
            document.getElementById(questionType).style.display = "block";

            //display the bottom block and hide the start form
            document.getElementById("bottom-block").style.display = "flex";
            document.getElementById("hunt-start").style.display = "none";

            //question number
            currentQuestionIndex = treasureHuntQuestion.currentQuestionIndex;
            let questionsLeft = document.getElementById("questions-left");
            questionsLeft.textContent = (currentQuestionIndex + 1) + " of " + numOfQuestions + " Questions";

            //display the player score
            await getScore();
            scoreDisplay.textContent = "Score: " + playerScore;
            document.getElementById("player-score").style.display = "block";

            correctScore = treasureHuntQuestion.correctScore;
            wrongScore = treasureHuntQuestion.wrongScore;
            skipScore = treasureHuntQuestion.skipScore;

            canBeSkipped = treasureHuntQuestion.canBeSkipped;
            requiresLocation = treasureHuntQuestion.requiresLocation;

            if (canBeSkipped === true) {
                document.getElementById("skip").style.display = "block";
            }
            else {
                document.getElementById("skip").style.display = "none";
            }

            if (requiresLocation === true) {
                //location
            }

        }
        else {
            console.log("Error: ", treasureHuntQuestion.errorMessages);
            document.getElementById("error-message-text").textContent = treasureHuntQuestion.errorMessages;
            document.getElementById("error-alert").style.display = "block";
        }

    }
    catch (error) {
        console.log("Error: ", error);
    }
}

//submit answer for different question types
// ========= BOOLEAN ========= //
document.getElementById("bool-option-true").addEventListener("click", () => {
    treasureHuntAnswer = true;
    getAnswer();
})
document.getElementById("bool-option-false").addEventListener("click", () => {
    treasureHuntAnswer = false;
    getAnswer();
})

// ========= MCQ ========= //
document.getElementById("mcq-option-a").addEventListener("click", () => {
    treasureHuntAnswer = "A";
    getAnswer();
})
document.getElementById("mcq-option-b").addEventListener("click", () => {
    treasureHuntAnswer = "B";
    getAnswer();
})
document.getElementById("mcq-option-c").addEventListener("click", () => {
    treasureHuntAnswer = "C";
    getAnswer();
})
document.getElementById("mcq-option-d").addEventListener("click", () => {
    treasureHuntAnswer = "D";
    getAnswer();
})

// ========= INTEGER, NUMERIC & TEXT ========= //
document.getElementById("submitINTEGER").addEventListener("click", (e) => {
    e.preventDefault();
    treasureHuntAnswer = document.getElementById("answerINTEGER").value;
    getAnswer();
})
document.getElementById("submitNUMERIC").addEventListener("click", (e) => {
    e.preventDefault();
    treasureHuntAnswer = document.getElementById("answerNUMERIC").value;
    getAnswer();
})
document.getElementById("submitTEXT").addEventListener("click", (e) => {
    e.preventDefault();
    treasureHuntAnswer = document.getElementById("answerTEXT").value.toLowerCase();
    getAnswer();
})

//answer from API
async function getAnswer() {

    console.log("get answer started");

    let url_answer = "https://codecyprus.org/th/api/answer?session=" + session +
        "&answer=" + treasureHuntAnswer;

    try {
        const response = await fetch(url_answer);
        const treasureHuntAnswer = await response.json();

        if (treasureHuntAnswer.status === "OK") {

            if (treasureHuntAnswer.correct === true) {
                //correct answer
            }
            else {
                //wrong answer
            }

            await getQuestion();
        }
        else {
            console.log("Error: ", treasureHuntAnswer.errorMessages);
            document.getElementById("error-message-text").textContent = treasureHuntAnswer.errorMessages;
            document.getElementById("error-alert").style.display = "block";
        }
    }
    catch (error) {
        console.log("Error: ", error);
    }
}

//skip the question
document.getElementById("skip-button").addEventListener("click", () => {
    skipQuestion();
})

async function skipQuestion() {

    let url_skip = "https://codecyprus.org/th/api/skip?session=" + session;

    try {
        const response = await fetch(url_skip);
        const treasureHuntSkip = await response.json();

        if (treasureHuntSkip.status === "OK") {

            await getScore();

            if (treasureHuntSkip.completed === false) {
               await getQuestion();
            }
            else {
                //go to leaderboards
            }
        }
        else {
            console.log("Error: ", treasureHuntSkip.errorMessages);
            document.getElementById("error-message-text").textContent = treasureHuntSkip.errorMessages;
            document.getElementById("error-alert").style.display = "block";
        }
    }
    catch (error) {
        console.log("Error: ", error);
    }
}

//player score
async function getScore() {

    let url_score = "https://codecyprus.org/th/api/score?session=" + session;

    try {
        const response = await fetch(url_score);
        const treasureHuntScore = await response.json();

        if (treasureHuntScore.status === "OK") {

            playerScore = treasureHuntScore.score;
            scoreDisplay.textContent = "Score: " + playerScore;
        }
        else {
            console.log("Error: ", treasureHuntScore.errorMessages);
        }
    }
    catch (error) {
        console.log("Error: ", error);
    }
}


