const header = document.querySelector('header');
const content = document.getElementById('content');
const startButton = document.getElementById('start-button');
const errorContainer = document.getElementById('error');
// const pregunta = document.getElementById('pregunta');
// const respostes = document.getElementById('respostes');
const nextStep = document.getElementById('next-step');

const endpoint = 'https://vtv-vila-server.herokuapp.com/test';
console.log(window.location.href);
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
	socialMediaTextSucces: `Soc un VTV (Vilafranqui de Tota la Vida)! Vols saber si tu també ho ets? Ves a ${window.location.href} i respon a les preguntes! Preguntes per a totes les edats.`,
	socialMediaTextFail: `Vols saber si ets un VTV (Vilafranqui de Tota la Vida)? Ves a ${window.location.href} i respon a les preguntes! Preguntes per a totes les edats.`,
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
	const aux = document.createElement('h2');
	aux.id = 'auxiliary';
	aux.textContent = `Pregunta ${state.questionCounter}/${
		state.questions.length - 1
	}`;
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
	content.innerHTML = `<h1 id="pregunta">${congratulation}, ${
		state.score < 5 ? ' només ' : ''
	} has encertat <span>${state.score} ${
		state.score === 1 ? 'pregunta' : 'preguntes'
	}</span>.</h1><h2 id="explanation">${explanation}</h2>`;
	if (action === 'Torna-ho a provar') {
		const aux = document.createElement('button');
		aux.id = 'tryAgain';
		content.appendChild(aux);
		aux.textContent = `${action}`;
	} else {
		const aux = document.createElement('div');
		aux.id = 'auxiliary';
		aux.innerHTML = `
		<a href="https://t.me/share/url?url=${window.location.href}&text=${state.socialMediaText}"><button class="shareButton"><img src="media/telegram.png"/></button></a>
		<a href="https://api.whatsapp.com/send?text=${state.socialMediaText}" data-action="share/whatsapp/share"><button class="shareButton"><img src="media/whatsapp.png"/></button></a>
		
		`;
		// <a class="twitter-share-button" href="https://twitter.com/intent/tweet?text=${state.socialMediaText} data-size="large"><button class="shareButton">Comparteix a Twitter</button></a>
		// <a href="https://api.whatsapp.com/send?text=${state.socialMediaText}" data-action="share/whatsapp/share"><button class="shareButton">Comparteix a Whatsapp</button></a>
		content.appendChild(aux);
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
	content.innerHTML = `<h1>Vols saber si ets un VTV (Vilafranquí de Tota la Vida)?</h1><h2>Fes el test (resultats immediats)!</h2><button id='start-button'>Començar</button>`;
}

function isLastQuestion() {
	if (state.questionCounter === state.questions.length) {
		return true;
	}
	return false;
}

// display header
function displayHeader() {
	header.innerHTML = `<h1 id="title">VTVs</h1><ul id="navbar"><li>ABOUT</li><li>SUGGERIMENTS</li></ul>  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
    <polygon fill="white" points="0,100 100,0 100,100"/>
  </svg>`;
}

////////////
// events //
////////////

// redirect to "/"
// https://stackoverflow.com/questions/588040/window-onload-vs-document-onload
window.onload = () => {
	window.history.pushState({}, '/', window.location.origin);
	fetchQuestions();
	displayInitialQuestion();
	displayHeader();
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
