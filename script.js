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
	questionCounter: 9,
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
	content.innerHTML = `<h1>${
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
			"Comparteix la teva puntuacio amb els teus amics i descarrega't la medalla";
		action = 'Comparteix la teva puntuació';
	} else if (state.score <= 8 && state.score >= 5) {
		congratulation = 'Hmm';
		explanation =
			"Si bé has demostrat un bon coneixement de la teva vila, no estàs encara a la altura per guanyar-te la medalla. Torna'ho a provar.";
		action = 'Torna-ho a provar';
	} else {
		congratulation = 'Em sap greu';
		explanation =
			"Has d'estudiar més! Quan estiguis preparat torna'ho a provar.";
		action = 'Torna-ho a provar';
	}
	content.innerHTML = `<h1>${congratulation}, has encertat ${state.score} preguntes. ${action}</h1>`;
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
	// pregunta.textContent = `${state.questions[state.questionCounter].pregunta}`;
	// button to start to be visible
	content.innerHTML = `<button id='start-button'>Començar el test</button>`;
	// startButton.style.visibility = 'visible';
	// startButton.textContent = 'Comencar el test';
	// hide next step section just in case user is retaking the quizz
	// nextStep.style.visibility = 'hidden';
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
	// clear error message when clicking on start button after test has been triggered
	// if (errorContainer.className.includes('activated')) {
	// 	errorContainer.classList.remove('activated');
	// 	errorContainer.textContent = '';
	// }
	// hide button start test first time we click on the button
	// if (state.questionCounter === 0) {
	// 	startButton.style.visibility = 'hidden';
	// }
	// increase count of question
	// state.questionCounter++;
	// displayNextQuestion();
});

// when a user clicks on the answer
// respostes.addEventListener('click', (e) => {
// 	const resposta = e.target.textContent;
// 	if (e.target.nodeName === 'BUTTON') {
// 		if (resposta === state.questions[state.questionCounter].correcte) {
// 			console.log('lool');
// 			state.score++;
// 			displayNextQuestion();
// 		}
// 		if (state.questionCounter === state.questions.length - 1) {
// 			displayResults();
// 		} else {
// 			// increase count of question
// 			state.questionCounter++;
// 			displayNextQuestion();
// 		}
// 	}
// });

// // click on action button at the end of the quizz
// nextStep.addEventListener('click', (e) => {
// 	console.log(e.target.textContent);
// 	switch (e.target.textContent) {
// 		case 'Torna-ho a provar':
// 			reset();
// 			break;
// 		case 'Comparteix a Twitter':
// 			console.log('twitter');
// 			break;
// 	}
// });
