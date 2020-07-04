const header = document.querySelector('header');
const title = document.getElementById('title');
const page = document.querySelectorAll('.page');
const icons = document.getElementById('icons');
const burguer = document.getElementById('burguer');
const close = document.getElementById('close');
const navbar = document.getElementById('navbar');
const content = document.getElementById('content');
const startButton = document.getElementById('start-button');
const errorContainer = document.getElementById('error');
const nextStep = document.getElementById('next-step');
const ageSelector = document.getElementById('age-selector');
const geganta = document.getElementById('image');
const refuse = document.getElementById('refuse');
const tracking = document.getElementById('tracking');

const endpoint = 'https://vtv-vila-server.herokuapp.com/test';
// const endpoint = 'http://localhost:5000/test/';

///////////
// state //
///////////

const state = {
	questions: [
		{
			id: 0,
			pregunta: 'Ets un/a Vilafranquí/ina de Tota la Vida? Prova el test!',
			respostes: [],
			correcte: null,
		},
	],
	fetchedQuestions: false,
	questionCounter: 9,
	score: 0,
	socialMediaTextSucces: `Soc un/a VTV (Vilafranquí/ina de Tota la Vida)! Vols saber si tu també ho ets? Ves a ${window.location.href} i fes el test.`,
	socialMediaTextFail: `Vols saber si ets un/a VTV (Vilafranquí/ina de Tota la Vida)? Ves a ${window.location.href} i fes el test.`,
	age: null,
	analyticsConsent: false,
};

///////////////
// functions //
////////////////

// display initial question to start the test
function displayInitialQuestion() {
	gtag('config', 'UA-170700693-3', {
		page_title: 'home',
		page_path: '/',
	});
	content.innerHTML = `<h1>Vols saber si ets un/a VTV (Vilafranquí/ina de Tota la Vida)? <span class="outline">Fes el test.</span></h1>`;
	const actionItems = document.createElement('div');
	actionItems.id = 'actionItems';
	content.appendChild(actionItems);
	const slider = document.createElement('div');
	slider.id = 'age-selector';
	slider.innerHTML = `
	<input type="radio" id="no-gent-gran" name="age" value="no-gent-gran">
	<label for="no-gent-gran">Nivell fàcil</label>
	<input type="radio" id="gent-gran" name="age" value="gent-gran">
	<label for="gent-gran">Nivell difícil</label>
	`;
	// start button
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
	actionItems.appendChild(slider);
	actionItems.appendChild(button);
	actionItems.appendChild(selectAge);
	actionItems.appendChild(stamp);
}

// fetch questions after user clicks on start test
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
	gtag('config', 'UA-170700693-3', {
		page_title: state.questionCounter,
		page_path: `/question-${state.questionCounter}`,
	});
	// change text of pregunta to whatever pregunta we are asking, which is determined by the questioncounter
	content.innerHTML = `<h1 id="pregunta">${
		state.questions[state.questionCounter].pregunta
	}</h1>`;
	const actionItems = document.createElement('div');
	actionItems.id = 'actionItems';
	content.appendChild(actionItems);
	// display available answers
	const respostes = document.createElement('div');
	respostes.id = 'respostes';
	respostes.innerHTML = state.questions[state.questionCounter].respostes
		.map((item) => {
			return `<button id="answer-option">${item}</button>`;
		})
		.join('');
	actionItems.appendChild(respostes);
	// display up to date score
	const aux = document.createElement('h2');
	aux.id = 'auxiliary';
	aux.textContent = `Pregunta ${state.questionCounter}/${
		state.questions.length - 1
	}`;
	actionItems.appendChild(aux);
}

function displayResults() {
	// send page view to Analytics
	gtag('config', 'UA-170700693-3', {
		page_title: 'resultat',
		page_path: '/resultat',
	});
	// send event to analytics
	gtag('event', 'completed-test', {
		event_category: state.age,
		event_label: `score: ${state.score}`,
	});

	// initialize variables that will be used for text depending on the score
	let congratulation;
	let explanation;
	let action;
	// score === 9 or 10
	if (state.score === 10) {
		congratulation = 'Enhorabona';
		explanation =
			'Ets un/a VTV de soca-arrel. Ara ves i comparteix la teva puntuació per fardar del teu status!';
		action = 'Comparteix el teu status!';
	} else if (state.score <= 9 && state.score >= 5) {
		congratulation = "T'ha faltat poc";
		explanation =
			"T'has esforçat molt pero encara no ets un/a VTV del tot. Et recomano llegir el 3d8 i La Fura. I quan et sentis llest torna-ho a intentar!";
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
	// container where User action takes place
	const actionItems = document.createElement('div');
	actionItems.id = 'actionItems';

	// share action container
	const actionContainer = document.createElement('div');
	actionContainer.id = 'auxiliary';
	// CTA to share
	const shareMessage = document.createElement('h2');
	shareMessage.textContent = "Si t'ha agradat, comparteix aquest test:";
	actionContainer.appendChild(shareMessage);
	// render social media share buttons
	const shareButtons = document.createElement('div');
	shareButtons.id = 'socialButtons';
	shareButtons.innerHTML = `<a href="https://t.me/share/url?url=${window.location.href}&text=${state.socialMediaTextSucces}"><i class="fab fa-telegram fa-5x shareButton" id="telegram-logo"></i></a><a href="https://api.whatsapp.com/send?text=${state.socialMediaTextSucces}" data-action="share/whatsapp/share"><i class="fab fa-whatsapp-square fa-5x shareButton" id="whatsapp-logo"></i></a><a 
	href="https://twitter.com/intent/tweet?text=${state.socialMediaTextSucces}"><i class="fab fa-twitter fa-5x shareButton" id="twitter-logo"></i></a>`;
	actionContainer.appendChild(shareButtons);
	actionItems.appendChild(actionContainer);
	if (action === 'Torna-ho a provar') {
		// CTA button
		const ctaButton = document.createElement('button');
		ctaButton.id = 'tryAgain';
		ctaButton.textContent = `${action}`;
		actionItems.insertBefore(ctaButton, actionItems.firstChild);
	}
	content.appendChild(actionItems);
}

// reset state for those who have to restart the quizz
function reset() {
	state.questionCounter = 0;
	state.score = 0;
	state.questions = [
		{
			id: 0,
			pregunta: 'Ets un/a Vilafranquí/ina de Tota la Vida? Prova el test!',
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

function hideConsentPolicy() {
	tracking.classList.add('hide');
}

function acceptConsentAnalytics(value) {
	state.analyticsConsent = value;
	localStorage.setItem('analyticsConsent', state.analyticsConsent);
}

function displayConsent() {
	console.log(localStorage.getItem('analyticsConsent'));
	if (!localStorage.getItem('analyticsConsent')) {
		tracking.classList.remove('hide');
	}
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
	displayConsent();
};

// click button to start test
content.addEventListener('click', (e) => {
	const targetId = e.target.id;
	const startButton = document.getElementById('start-button');
	const ageSelector = document.getElementById('ageDisclaimer');
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

// when a page in header is clicked
page.forEach((item) => {
	item.addEventListener('click', (e) => {
		// create text container
		const textContainer = document.createElement('div');
		textContainer.id = 'text-page';
		// create context
		const whyMade = document.createElement('h2');
		if (e.target.id === 'about-page') {
			// create first line
			const madeBy = document.createElement('h2');
			madeBy.textContent = 'Fet per en www.peresola.com';
			textContainer.appendChild(madeBy);
			whyMade.textContent =
				'Soc un VTV que ha pujat als castells, ha ballat un ball de la Festa Major i tantes altres coses que fan els VTVs. No somio en ser administrador ni pregoner. No us prengueu aquesta web seriosament, tothom hi és benvingut a Vilafranca!';
		} else if (e.target.id === 'suggeriments-page') {
			whyMade.textContent =
				'Si voleu afegir preguntes al test, o teniu qualsevol suggeriment o comentari, envieu-me un email a socunvtv [arroba] gmail [punt] com. Salut!';
		} else {
			console.log("page doesn't exist");
		}
		textContainer.appendChild(whyMade);
		content.innerHTML = '';
		content.appendChild(textContainer);
	});
});

title.addEventListener('click', () => {
	reset();
	displayInitialQuestion();
});

icons.addEventListener('click', (e) => {
	if (e.target.id === 'burguer') {
		navbar.setAttribute(
			'style',
			'display: flex; flex-direction: column; align-items: flex-start;'
		);
	} else {
		navbar.style.display = 'none';
	}
	burguer.classList.toggle('show');
	close.classList.toggle('show');
	title.classList.toggle('show');
});

tracking.addEventListener('click', (e) => {
	if (e.target.id === 'not-ok-analytics') {
		acceptConsentAnalytics(false);
		window['ga-disable-UA-170700693-3'] = true;
	} else {
		acceptConsentAnalytics(true);
	}
	hideConsentPolicy();
});
