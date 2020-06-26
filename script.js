const header = document.querySelector('header');
const title = document.getElementById('title');
const about = document.getElementById('about-page');
const suggeriments = document.getElementById('suggeriments-page');
const content = document.getElementById('content');
const startButton = document.getElementById('start-button');
const errorContainer = document.getElementById('error');
const nextStep = document.getElementById('next-step');
const ageSelector = document.getElementById('age-selector');
const geganta = document.getElementById('image');

// const endpoint = 'https://vtv-vila-server.herokuapp.com/test';
const endpoint = 'http://localhost:5000/test/';

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
	questionCounter: 0,
	score: 0,
	socialMediaTextSucces: `Soc un VTV (Vilafranqui de Tota la Vida)! Vols saber si tu també ho ets? Ves a ${window.location.href} i fes el test.`,
	socialMediaTextFail: `Vols saber si ets un VTV (Vilafranqui de Tota la Vida)? Ves a ${window.location.href} i fes el test.`,
	age: null,
};

///////////////
// functions //
////////////////

// display initial question to start the test
function displayInitialQuestion() {
	content.innerHTML = `<h1>Vols saber si ets un VTV (Vilafranquí de Tota la Vida)?</h1>`;
	const slider = document.createElement('div');
	slider.id = 'age-selector';
	slider.innerHTML = `
	<input type="radio" id="no-gent-gran" name="age" value="no-gent-gran">
	<label for="no-gent-gran">Nivell fàcil</label>
	<input type="radio" id="gent-gran" name="age" value="gent-gran">
	<label for="gent-gran">Nivell difícil</label>
	`;
	const button = document.createElement('button');
	button.id = 'start-button';
	button.disabled = true;
	button.textContent = 'Començar';
	const selectAge = document.createElement('h3');
	selectAge.textContent = 'Tria el nivell: fàcil o difícil';
	selectAge.id = 'ageDisclaimer';
	const stamp = document.createElement('h2');
	stamp.id = 'stamp';
	stamp.textContent = 'RESULTATS IMMEDIATS';
	content.appendChild(slider);
	content.appendChild(button);
	content.appendChild(selectAge);
	content.appendChild(stamp);
}

// display first question
const fetchQuestions = async () => {
	try {
		// display spinner while promise resolves
		const spinner = document.createElement('div');
		spinner.classList = 'loading';
		errorContainer.appendChild(spinner);
		// fetch data from backend
		const data = await fetch(`${endpoint}`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ age: state.age }),
		});
		const questions = await data.json();
		// hide spinner after promise has resolved
		errorContainer.innerHTML = '';
		// errorContainer.classList.remove('loading');
		state.questions = [...state.questions, ...questions.data];
		state.fetchedQuestions = true;
		displayNextQuestion();
	} catch (error) {
		// hide spinner after promise has resolved
		errorContainer.innerHTML = '';
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
		congratulation = 'Casi ho tens!';
		explanation =
			"T'has esforçat molt pero encara no ets un VTV del tot. Et recomano llegir el 3d8 i La Fura. I quan et sentis llest torna-ho a intentar!";
		action = 'Torna-ho a provar';
	} else {
		congratulation = 'Em sap greu';
		explanation =
			"Hi ha feina per fer - has d'estudiar més. Pero no et preocupis, tot té solució: et recomano llegir el 3d8 i La Fura. I quan et sentis llest torna-ho a intentar!";
		action = 'Torna-ho a provar';
	}
	content.innerHTML = `<h1 id="pregunta">${congratulation}, ${
		state.score < 5 ? ' només ' : ''
	} has encertat <span>${state.score} ${
		state.score === 1 ? 'pregunta' : 'preguntes'
	}</span>.</h1><h2 id="explanation">${explanation}</h2>`;
	if (action === 'Torna-ho a provar') {
		const aux = document.createElement('div');
		aux.id = 'auxiliary';
		const auxButton = document.createElement('button');
		auxButton.id = 'tryAgain';
		auxButton.textContent = `${action}`;
		// render social media share buttons
		aux.innerHTML = `<a href="https://t.me/share/url?url=${window.location.href}&text=${state.socialMediaTextSucces}"><i class="fab fa-telegram fa-5x shareButton" id="telegram-logo"></i></a><a href="https://api.whatsapp.com/send?text=${state.socialMediaTextSucces}" data-action="share/whatsapp/share"><i class="fab fa-whatsapp-square fa-5x shareButton" id="whatsapp-logo"></i></a><a 
		href="https://twitter.com/intent/tweet?text=${state.socialMediaTextSucces}"><i class="fab fa-twitter fa-5x shareButton" id="twitter-logo"></i></a>`;
		content.appendChild(auxButton);
		content.appendChild(aux);
	} else {
		const aux = document.createElement('div');
		aux.id = 'auxiliary';
		// render social media share buttons
		aux.innerHTML = `<a href="https://t.me/share/url?url=${window.location.href}&text=${state.socialMediaTextSucces}"><i class="fab fa-telegram fa-5x shareButton" id="telegram-logo"></i></a><a href="https://api.whatsapp.com/send?text=${state.socialMediaTextSucces}" data-action="share/whatsapp/share"><i class="fab fa-whatsapp-square fa-5x shareButton" id="whatsapp-logo"></i></a><a 
		href="https://twitter.com/intent/tweet?text=${state.socialMediaTextSucces}"><i class="fab fa-twitter fa-5x shareButton" id="twitter-logo"></i></a>`;
		content.appendChild(aux);
	}
}

// reset state for those who have to restart the quizz
function reset() {
	state.questionCounter = 0;
	state.score = 0;
	state.questions = [
		{
			id: 0,
			pregunta: 'Ets un Vilafranqui de Tota la Vida? Prova el test!',
			respostes: [],
			correcte: null,
		},
	];
	// display initial question
	displayInitialQuestion();
}

function isLastQuestion() {
	if (state.questionCounter === state.questions.length) {
		return true;
	}
	return false;
}

// display geganta
function displayGeganta() {
	const imageGeganta = document.createElement('div');
	imageGeganta.id = geganta;
	imageGeganta.innerHTML = `<img src="./assets/geganta.png"/>`;
	geganta.appendChild(imageGeganta);
}

////////////
// events //
////////////

// redirect to "/"
// https://stackoverflow.com/questions/588040/window-onload-vs-document-onload
window.onload = () => {
	window.history.pushState({}, '/', window.location.origin);
	// fetchQuestions();
	displayInitialQuestion();
	displayGeganta();
};

// click button to start test
content.addEventListener('click', (e) => {
	const targetId = e.target.id;
	const startButton = document.getElementById('start-button');
	const ageSelector = document.getElementById('ageDisclaimer');
	console.log(`fired ${targetId}`);
	switch (targetId) {
		// user has clicked on start button
		case 'start-button':
			// only fetch data and proceed if age has been selected
			if (state.age) {
				state.questionCounter++;
				fetchQuestions();
			}
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
		case 'gent-gran':
			startButton.disabled = false;
			ageSelector.classList.add('hidden');
			state.age = 'gent-gran';
			break;
		case 'no-gent-gran':
			startButton.disabled = false;
			ageSelector.classList.add('hidden');
			state.age = 'no-gent-gran';
			break;
	}
});

// when about page in header is clicked
about.addEventListener('click', (e) => {
	const text = document.createElement('h2');
	text.id = 'text-page';
	text.textContent =
		'Fet per un VTV que ha pujat als castells, ha ballat un ball de la Festa Major i tantes altres coses que fan els VTVs. No sommio en ser administrador ni pregoner. No us prengueu aquesta web massa en serio, tothom hi és benvingut a Vilafranca!';
	content.innerHTML = '';
	content.appendChild(text);
});

// when suggeriments page in header is clicked
suggeriments.addEventListener('click', () => {
	const text = document.createElement('h2');
	text.id = 'text-page';
	text.textContent =
		'Si voleu afegir preguntes al test, o teniu qualsevol suggeriment o comentari, envieu-me un email a socunvtv [at] gmail [dot] com. Salut!';
	content.innerHTML = '';
	content.appendChild(text);
});

title.addEventListener('click', () => {
	reset();
	displayInitialQuestion();
});
