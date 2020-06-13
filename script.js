const content = document.getElementById('content');
const startButton = document.getElementById('start-button');
const errorContainer = document.getElementById('error');
const pregunta = document.getElementById('pregunta');
const respostes = document.getElementById('respostes');
// const aux = document.getElementById('aux');
const nextStep = document.getElementById('next-step');

const endpoint = 'https://vtv-vila-server.herokuapp.com/test';

///////////
// state //
///////////

const state = {
	questions: [
		{
			id: 0,
			pregunta: 'Ets un Vilafranqui de Tota la Vida? Prova el test!',
			respostes: [],
			correcte: null,
		},
	],
	fetchedQuestions: false,
	questionCounter: 0,
	score: 0,
	socialMediaText:
		'Soc un VTV (Vilafranqui de Tota la Vida)! Vols saber si ho ets? Ves a www.xyz.com i respon el questionari i, qui sap, potser guanyes una medalla!',
};

///////////////
// functions //
////////////////

// display first question
const fetchQuestions = async () => {
	try {
		// fetch data from backend
		const data = await fetch(`${endpoint}`);
		const questions = await data.json();
		state.questions = [...state.questions, ...questions.data];
		state.fetchedQuestions = true;
	} catch (error) {
		errorContainer.className = 'activated';
		errorContainer.textContent = error.message;
	}
};

// display question in #content node
function displayNextQuestion() {
	// change text of pregunta to whatever pregunta we are asking, which is determined by the questioncounter
	content.innerHTML = `<h1 id="pregunta">${
		state.questions[state.questionCounter].pregunta
	}</h1>`;
	// pregunta.textContent = `${state.questions[state.questionCounter].pregunta}`;
	// display available answers
	const respostes = document.createElement('div');
	respostes.id = 'respostes';
	respostes.innerHTML = state.questions[state.questionCounter].respostes
		.map((item) => {
			return `<button id="answer-option">${item}</button>`;
		})
		.join('');
	content.appendChild(respostes);
	// display up to date score
	const aux = document.createElement('div');
	aux.id = 'aux';
	const questionsLeft = state.questions.length - state.questionCounter;
	aux.textContent = `${questionsLeft === 1 ? 'Falta' : 'Falten'} ${
		state.questions.length - state.questionCounter
	} ${questionsLeft === 1 ? 'pregunta' : 'preguntes'}.`;
	content.appendChild(aux);
}

function displayResults() {
	let congratulation;
	let explanation;
	let action;
	// score === 9 or 10
	if (state.score >= 9) {
		congratulation = 'Enhorabona';
		explanation =
			'Ets un VTV de soca-arrel. Ara ves i comparteix la teva puntuació per fardar del teu status!';
		action = 'Comparteix la teva puntuació';
	} else if (state.score <= 8 && state.score >= 5) {
		congratulation = 'Hmm';
		explanation =
			"T'has esforçat força pero no ets un VTV. Torna'ho a provar i segur que aviat ho ets.";
		action = 'Torna-ho a provar';
	} else {
		congratulation = 'Em sap greu';
		explanation =
			"Hi ha feina per fer - has d'estudiar més. No et preocupis, de ben segur que amb una mica d'esforç ho pots aconseguir. Et recomanem llegir el 3d8 i La Fura. I quan et sentis llest torna'ho a intentar.";
		action = 'Torna-ho a provar';
	}
	content.innerHTML = `<h1>${congratulation}, has encertat ${state.score} ${
		state.score === 1 ? 'pregunta' : 'preguntes'
	}. ${explanation}</h1>`;
	const aux = document.createElement('button');
	if (action === 'Torna-ho a provar') {
		aux.id = 'tryAgain';
		aux.textContent = `${action}`;
	} else {
		aux.innerHTML = `<a class="twitter-share-button" href="https://twitter.com/intent/tweet?text=${state.socialMediaText} data-size="large">Comparteix a Twitter</a>`;
	}
	content.appendChild(aux);
}

// reset state for those who have to restart the quizz
function reset() {
	state.questionCounter = 0;
	state.score = 0;
	// display initial question
	displayInitialQuestion();
}

// display initial question to start the test
function displayInitialQuestion() {
	content.innerHTML = `<button id='start-button'>Començar el test</button>`;
}

function isLastQuestion() {
	if (state.questionCounter === state.questions.length) {
		return true;
	}
	return false;
}

////////////
// events //
////////////

// redirect to "/"
// https://stackoverflow.com/questions/588040/window-onload-vs-document-onload
window.onload = () => {
	window.history.pushState({}, '/', window.location.origin);
	displayInitialQuestion();
	fetchQuestions();
};

// click button to start test
content.addEventListener('click', (e) => {
	const targetId = e.target.id;
	console.log(`fired ${targetId}`);
	switch (targetId) {
		// user has clicked on start button
		case 'start-button':
			state.questionCounter++;
			displayNextQuestion();
			break;
		// user has clicked on answer
		case 'answer-option':
			const selectedAnswer = e.target.textContent;
			if (selectedAnswer === state.questions[state.questionCounter].correcte) {
				state.score++;
			}
			state.questionCounter++;
			const isLast = isLastQuestion();
			if (isLast) {
				displayResults();
			} else {
				displayNextQuestion();
			}
			break;
		case 'tryAgain':
			console.log('aux');
			reset();
			break;
	}
});
