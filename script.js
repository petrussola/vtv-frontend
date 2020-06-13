const content = document.getElementById('content');
const startButton = document.getElementById('start-button');
const errorContainer = document.getElementById('error');
const pregunta = document.getElementById('pregunta');
const respostes = document.getElementById('respostes');
const score = document.getElementById('score');
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
	pregunta.textContent = `${state.questions[state.questionCounter].pregunta}`;
	// display available answers
	respostes.innerHTML = state.questions[state.questionCounter].respostes
		.map((item) => {
			return `<button>${item}</button>`;
		})
		.join('');
	// display up to date score
	score.textContent = `Puntuació: ${state.score} / ${
		state.questions.length - 1
	}`;
}

function displayResults() {
	let congratulation;
	let explanation;
	let action;
	if (state.score >= 9) {
		console.log('9 - 10');
		congratulation = 'Enhorabona';
		explanation =
			"Comparteix la teva puntuacio amb els teus amics i descarrega't la medalla";
		action = 'Comparteix la teva puntuació';
	} else if (state.score <= 8 && state.score >= 5) {
		console.log('5 - 8');
		congratulation = 'Hmm';
		explanation =
			"Si bé has demostrat un bon coneixement de la teva vila, no estàs encara a la altura per guanyar-te la medalla. Torna'ho a provar.";
		action = 'Torna-ho a provar';
	} else {
		console.log('suspes');
		congratulation = 'Em sap greu';
		explanation =
			"Has d'estudiar més! Quan estiguis preparat torna'ho a provar.";
		action = 'Torna-ho a provar';
	}
	respostes.innerHTML = '';
	pregunta.textContent = `${congratulation}, has encertat ${state.score} preguntes. ${action}`;
	score.innerHTML = '';
	nextStep.style.visibility = 'visible';
	if (action === 'Torna-ho a provar') {
		nextStep.innerHTML = `<button>${action}</button>`;
	} else {
		console.log('twitter');
		nextStep.innerHTML = `<div>
		<a class="twitter-share-button" href="https://twitter.com/intent/tweet?text=${state.socialMediaText} data-size="large">Comparteix a Twitter</a>
		
		</div>`;
	}
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
	startButton.style.visibility = 'visible';
	startButton.textContent = 'Comencar el test';
	// hide next step section just in case user is retaking the quizz
	nextStep.style.visibility = 'hidden';
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
startButton.addEventListener('click', () => {
	// clear error message when clicking on start button after test has been triggered
	if (errorContainer.className.includes('activated')) {
		errorContainer.classList.remove('activated');
		errorContainer.textContent = '';
	}
	// hide button start test first time we click on the button
	if (state.questionCounter === 0) {
		startButton.style.visibility = 'hidden';
	}
	// increase count of question
	state.questionCounter++;
	displayNextQuestion();
});

// when a user clicks on the answer
respostes.addEventListener('click', (e) => {
	const resposta = e.target.textContent;
	if (e.target.nodeName === 'BUTTON') {
		if (resposta === state.questions[state.questionCounter].correcte) {
			console.log('lool');
			state.score++;
			displayNextQuestion();
		}
		if (state.questionCounter === state.questions.length - 1) {
			displayResults();
		} else {
			// increase count of question
			state.questionCounter++;
			displayNextQuestion();
		}
	}
});

// click on action button at the end of the quizz
nextStep.addEventListener('click', (e) => {
	console.log(e.target.textContent);
	switch (e.target.textContent) {
		case 'Torna-ho a provar':
			reset();
			break;
		case 'Comparteix a Twitter':
			console.log('twitter');
			break;
	}
});
