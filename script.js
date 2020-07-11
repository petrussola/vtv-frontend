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
const cookieLink = document.querySelectorAll('#cookie-link');

let endpoint;

if (window.location.hostname === '127.0.0.1') {
	endpoint = 'http://localhost:5000/';
} else if (window.location.hostname === 'vtv-dev.netlify.app') {
	endpoint = 'https://vtv-vila-server.herokuapp.com/';
} else if (window.location.hostname === 'www.socvtv.fun') {
	endpoint = 'https://vtv-vila-server-prod.herokuapp.com/';
}

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
	questionCounter: 0,
	score: 0,
	socialMediaTextSucces: `Soc un/a VTV (Vilafranquí/ina de Tota la Vida)! Vols saber si tu també ho ets? Ves a ${window.location.href} i fes el test. NOVETAT: ara tens 3 comodins del Whatsapp - més possibilitats de ser VTV!`,
	socialMediaTextFail: `Vols saber si ets un/a VTV (Vilafranquí/ina de Tota la Vida)? Ves a ${window.location.href} i fes el test. NOVETAT: ara tens 3 comodins del Whatsapp - més possibilitats de ser VTV!`,
	age: null,
	collectedAnswers: [],
	analyticsConsent: false,
	comodinsInitial: 3,
	comodinsLeft: 3,
	comodiUsedInQuestion: false,
};

///////////////
// functions //
////////////////

// display initial question to start the test
function displayInitialQuestion() {
	gtag('config', 'UA-170700693-2', {
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
	stamp.textContent =
		'ARA AMB 3 COMODINS DEL WHATSAPP! AFEGIM NOVES PREGUNTES CADA SETMANA';
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
		console.log(error);
		// hide spinner after promise has resolved
		errorContainer.innerHTML = '';
		errorContainer.className = 'activated';
		errorContainer.textContent =
			'Hem tingut un problema al servidor. Sorry! Prova-ho més tard.';
	}
};

// display question in #content node
function displayNextQuestion() {
	gtag('config', 'UA-170700693-2', {
		page_title: `${state.age}-${state.questionCounter}`,
		page_path: `/question-${state.age}-${state.questionCounter}`,
	});
	// set used comodi to false in case user used comodi in the previous question
	state.comodiUsedInQuestion = false;
	const pregunta = state.questions[state.questionCounter].pregunta;
	const respostes = state.questions[state.questionCounter].respostes;
	// change text of pregunta to whatever pregunta we are asking, which is determined by the questioncounter
	content.innerHTML = `<h1 id="pregunta">${pregunta}</h1>`;
	const actionItems = document.createElement('div');
	actionItems.id = 'actionItems';
	content.appendChild(actionItems);
	// display available answers
	const respostesSpace = document.createElement('div');
	respostesSpace.id = 'respostes';
	respostesSpace.innerHTML = respostes
		.map((item) => {
			return `<button id="answer-option">${item}</button>`;
		})
		.join('');
	actionItems.appendChild(respostesSpace);
	// display progress in the format XX/XX
	const aux = document.createElement('h2');
	aux.id = 'auxiliary';
	aux.textContent = `Pregunta ${state.questionCounter}/${
		state.questions.length - 1
	}`;
	actionItems.appendChild(aux);
	// display Left left
	const comodiSpace = document.createElement('div');
	actionItems.appendChild(comodiSpace);
	const comodi = document.createElement('h3');
	comodi.id = 'comodi';
	comodi.classList.add('comodi-button');
	if (state.comodinsLeft > 0) {
		comodi.textContent = `Et ${
			state.comodinsLeft > 1
				? `queden ${state.comodinsLeft} comodins`
				: `queda ${state.comodinsLeft} comodi`
		} del Whatsapp. Fes click aquí per utilitzar-${
			state.comodinsLeft > 1 ? 'los' : 'lo'
		}!`;
		clickComodi(comodi, pregunta, respostes);
	} else {
		comodi.textContent = `Has exhaurit els comodins`;
	}
	comodiSpace.appendChild(comodi);
}

function displayResults() {
	// send page view to Analytics
	gtag('config', 'UA-170700693-2', {
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
			'Ets un/a VTV de soca-arrel. Aviat seràs Administrador/a. Ara ves i comparteix la teva puntuació per fardar del teu status!';
		action = 'Comparteix el teu status!';
	} else if (state.score <= 9 && state.score >= 8) {
		congratulation = "T'ha faltat poc";
		explanation =
			"Tens potencial, pero encara no estàs llest. Segueix estudiant l'article de Wikipedia sobre Vilafranca.";
		action = 'Torna-ho a provar';
	} else if (state.score <= 7 && state.score >= 5) {
		congratulation = 'Has de millorar bastant';
		explanation =
			"Encara hi ha feina per fer. Et recomanem llegir senceres les pàgines web de l'Ajuntament de Vilafranca i l'article de Wikipedia. 5 vegades.";
		action = 'Torna-ho a provar';
	} else if (state.score <= 4 && state.score >= 3) {
		congratulation = 'Molt malament';
		explanation =
			"Sintonitza Radio Vilafranca i Vilafranca TV ara mateix! I no canviis d'emisora i canal durant dues setmanes.";
		action = 'Torna-ho a provar';
	} else {
		congratulation = 'Fatal';
		explanation =
			'Demana una subscripció al 3 de 8 als Reis i aprèn la secció local de memòria, cada setmana.';
		action = 'Torna-ho a provar';
	}
	content.innerHTML = `<h1 id="pregunta">${congratulation}, ${
		state.score < 5 ? ' només ' : ''
	} has encertat <span>${state.score} ${
		state.score === 1 ? 'pregunta' : 'preguntes'
	}</span>.</h1><h2 id="display-results-text">Veure els <span class="outline" id="display-results">resultats</span></h2><h2 id="explanation">${explanation}</h2>`;
	// listen to click on the results link
	listenResultsClick();
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
	// call function to track clicks on social media
	clickSocialMediaButton();
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
	state.collectedAnswers = [];
	state.comodinsLeft = state.comodinsInitial;
	state.comodiUsedInQuestion = false;
	// display initial question
	displayInitialQuestion();
}

function isLastQuestion() {
	if (state.questionCounter === state.questions.length) {
		return true;
	}
	return false;
}

// listen to click on the results link
function listenResultsClick() {
	const resultsLink = document.getElementById('display-results');
	resultsLink.addEventListener('click', () => {
		// send page view to Analytics
		gtag('config', 'UA-170700693-2', {
			page_title: 'resultat-detall',
			page_path: '/resultat-detall',
		});
		// send Analytics event
		gtag('event', 'display-results', {
			event_category: state.age,
			event_label: `score: ${state.score}`,
		});
		// clean HTML
		content.innerHTML = '';
		// create Results title
		const resultsTitle = document.createElement('h1');
		resultsTitle.textContent = 'Resultats';
		content.appendChild(resultsTitle);
		// create list of answers
		const answers = document.createElement('ul');
		state.collectedAnswers.map((item) => {
			const uniqueAnswer = document.createElement('li');
			uniqueAnswer.id = 'answer-item';
			uniqueAnswer.innerHTML = `${
				item.correct
					? '<i class="fas fa-check-circle answer-summary" id="correct-answer"></i>'
					: '<i class="fas fa-times-circle answer-summary" id="wrong-answer"></i>'
			}<p>Pregunta: ${item.question} | Resposta: ${item.answer}</p>`;
			// uniqueAnswer.textContent = `Pregunta: ${item.question} | Resposta: ${
			// 	item.answer
			// } | ${item.correct ? 'Correcte' : 'Equivocada'}`;
			answers.appendChild(uniqueAnswer);
		});
		content.appendChild(answers);

		// CTA button
		const ctaButton = document.createElement('button');
		ctaButton.id = 'tryAgain';
		ctaButton.textContent = `Torna-ho a provar`;
		content.appendChild(ctaButton);
		// social media buttons
		displaySocialMediaButtons(content);
	});
}

function displaySocialMediaButtons(content) {
	// render social media share buttons
	const shareButtons = document.createElement('div');
	shareButtons.id = 'socialButtons';
	shareButtons.innerHTML = `<a href="https://t.me/share/url?url=${window.location.href}&text=${state.socialMediaTextSucces}"><i class="fab fa-telegram fa-5x shareButton" id="telegram-logo"></i></a><a href="https://api.whatsapp.com/send?text=${state.socialMediaTextSucces}" data-action="share/whatsapp/share"><i class="fab fa-whatsapp-square fa-5x shareButton" id="whatsapp-logo"></i></a><a 
	href="https://twitter.com/intent/tweet?text=${state.socialMediaTextSucces}"><i class="fab fa-twitter fa-5x shareButton" id="twitter-logo"></i></a>`;
	content.appendChild(shareButtons);
}

// fetch novetats from backend
const fetchNovetats = async () => {
	try {
		const data = await fetch(`${endpoint}novetats`);
		const questions = await data.json();
		return questions.data;
	} catch (error) {
		console.log(error);
	}
};

function hideConsentPolicy() {
	tracking.classList.add('hide');
}

function acceptConsentAnalytics(value) {
	// send Analytics event
	gtag('event', 'select_content', {
		content_type: `accept-cookies: ${value}`,
	});
	state.analyticsConsent = value;
	localStorage.setItem('analyticsConsent', state.analyticsConsent);
}

function displayConsent() {
	console.log(localStorage.getItem('analyticsConsent'));
	if (!localStorage.getItem('analyticsConsent')) {
		tracking.classList.remove('hide');
	}
}

function clickSocialMediaButton() {
	const shareButtons = document.getElementById('socialButtons');
	shareButtons.addEventListener('click', (e) => {
		// send event to analytics
		gtag('event', 'share', {
			method: e.target.id,
		});
		console.log(e.target.id);
	});
}

function clickComodi(node, pregunta, respostes) {
	node.addEventListener('click', () => {
		// remove button and class that gives style
		// node.textContent = `Demana ajuda a través de les xarxes. Et ${
		// 	state.comodinsLeft > 1
		// 		? `queden ${state.comodinsLeft} comodins`
		// 		: `queda ${state.comodinsLeft} comodí`
		// }.`;
		// node.classList.toggle('comodi-button');
		// add social media buttons
		const socialMediaTextComodi = `Ei, estic fent el test per saber si soc un/a Vilafranquí/ina de Tota la Vida (VTV) a ${
			window.location.href
		} i estic utilitzant el comodí de les xarxes socials. Necessito ajuda amb la següent pregunta: '${pregunta}'. Possibles respostes: ${respostes.map(
			(item, index) => ` ${index + 1}) ${item}`
		)}. Quina creus que és la correcta? Gràcies!`;
		// create div to host social media buttons
		const comodiShareButtons = document.createElement('div');
		comodiShareButtons.id = 'comodi-socialmedia';
		comodiShareButtons.innerHTML = `<a href="https://t.me/share/url?url=${window.location.href}&text=${socialMediaTextComodi}" target="_blank"><i class="fab fa-telegram fa-5x shareButtonComodi" id="telegram-logo"></i></a><a href="https://api.whatsapp.com/send?text=${socialMediaTextComodi}" data-action="share/whatsapp/share" target="_blank"><i class="fab fa-whatsapp-square fa-5x shareButtonComodi" id="whatsapp-logo"></i></a>`;
		node.parentNode.appendChild(comodiShareButtons);
		comodiShareButtons.addEventListener('click', (e) => {
			if (e.target.id === 'telegram-logo' || e.target.id === 'whatsapp-logo') {
				if (state.comodiUsedInQuestion === false && state.comodinsLeft > 1) {
					state.comodiUsedInQuestion = true;
					state.comodinsLeft--;
					node.textContent = `Has utilitzat ${
						state.comodinsInitial - state.comodinsLeft > 1
							? `${state.comodinsInitial - state.comodinsLeft} comodins`
							: `${state.comodinsInitial - state.comodinsLeft} comodí`
					}, t'en ${
						state.comodinsLeft > 1
							? `queden ${state.comodinsLeft}`
							: `queda ${state.comodinsLeft}`
					}.`;
				} else if (
					state.comodiUsedInQuestion === false &&
					state.comodinsLeft === 1
				) {
					state.comodinsLeft--;
					node.textContent = `Has exhaurits els comodins`;
				}
			}
		});
	});
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
			// selected answer
			const selectedAnswer = e.target.textContent;
			// the question. we need to climb up in the dom to find it :)
			const selectedQuestion =
				e.target.parentNode.parentNode.previousSibling.textContent;
			// add answer to state array with collected answers
			state.collectedAnswers.push({
				numQuestion: state.questionCounter,
				question: selectedQuestion,
				answer: selectedAnswer,
				correct: false,
			});
			// is selected answer the right one?
			if (selectedAnswer === state.questions[state.questionCounter].correcte) {
				// increase score
				state.score++;
				// mark question in collected answers array as true
				state.collectedAnswers[state.questionCounter - 1].correct = true;
			}
			// increase count of questions
			state.questionCounter++;
			// check if it is the last question
			const isLast = isLastQuestion();
			// if it is the last question
			if (isLast) {
				// display results
				displayResults();
			} else {
				// display next questions
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
	item.addEventListener('click', async (e) => {
		// create text container
		const textContainer = document.createElement('div');
		textContainer.id = 'text-page';
		// create context
		const whyMade = document.createElement('h2');
		if (e.target.id === 'about-page') {
			// send page view to Analytics
			gtag('config', 'UA-170700693-2', {
				page_title: 'about',
				page_path: '/about',
			});
			// send Analytics event
			gtag('event', 'click-page', {
				event_category: 'about',
			});
			// create first line
			const madeBy = document.createElement('h2');
			madeBy.textContent = 'Fet per en www.peresola.com';
			textContainer.appendChild(madeBy);
			whyMade.textContent =
				'Soc un VTV que ha pujat als castells, ha ballat un ball de la Festa Major i tantes altres coses que fan els VTVs. No somio en ser administrador ni pregoner. No us prengueu aquesta web seriosament, tothom hi és benvingut a Vilafranca!';
		} else if (e.target.id === 'suggeriments-page') {
			// send page view to Analytics
			gtag('config', 'UA-170700693-2', {
				page_title: 'suggeriments',
				page_path: '/suggeriments',
			});
			// send Analytics event
			gtag('event', 'click-page', {
				event_category: 'suggeriments',
			});
			whyMade.textContent =
				'Si voleu afegir preguntes al test, o teniu qualsevol suggeriment o comentari, envieu-me un email a socunvtv [arroba] gmail [punt] com. Salut!';
		} else if (e.target.id === 'novetats-page') {
			// send page view to Analytics
			gtag('config', 'UA-170700693-2', {
				page_title: 'novetats',
				page_path: '/novetats',
			});
			// send Analytics event
			gtag('event', 'click-page', {
				event_category: 'novetats',
			});
			const novetats = await fetchNovetats();
			const listNovetats = document.createElement('ul');
			novetats.map((item) => {
				const novetatItem = document.createElement('li');
				novetatItem.textContent = `${item.dia}: ${item.novetat}`;
				listNovetats.appendChild(novetatItem);
			});
			textContainer.appendChild(listNovetats);
		} else {
			// send page view to Analytics
			gtag('config', 'UA-170700693-2', {
				page_title: 'not-exist',
				page_path: '/not-exist',
			});
			// send Analytics event
			gtag('event', 'click-page', {
				event_category: 'error-not-exist',
			});
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
		window['ga-disable-UA-170700693-2'] = true;
		hideConsentPolicy();
	} else if (e.target.id === 'ok-analytics') {
		acceptConsentAnalytics(true);
		hideConsentPolicy();
	}
});

cookieLink.forEach((item) => {
	item.addEventListener('click', () => {
		// send page view to Analytics
		gtag('config', 'UA-170700693-2', {
			page_title: 'cookie-policy',
			page_path: '/cookie-policy',
		});
		// send Analytics event
		gtag('event', 'select_content', {
			content_type: 'view-cookie-page',
		});
		content.innerHTML = '';
		const whatAreCookies = document.createElement('div');
		whatAreCookies.id = 'cookie-explanation';
		const backButtonTop = document.createElement('button');
		backButtonTop.textContent = 'Tornar';
		backButtonTop.classList.add('back-button');
		whatAreCookies.appendChild(backButtonTop);
		const whatAreCookiesTitle = document.createElement('h2');
		whatAreCookiesTitle.textContent = '1. Què son les galetes?';
		const whatAreCookiesExplanation = document.createElement('p');
		whatAreCookiesExplanation.innerHTML = `<ul><li>· Les galetes o cookies són fitxers de text que es descarreguen a l’equip terminal de l’usuari (ordinador, tauleta, telèfon mòbil...) i que es guarden a la memòria del seu navegador.</li>
	<li>· Les dades de navegació recuperades per les galetes són anònimes i no s’associen a cap persona. La informació personal ha de ser facilitada a socvtv.fun de manera explícita per l’usuari. </li>
	<li>· L’usuari pot esborrar o desactivar les galetes des de la configuració dels navegadors. En aquest cas, la pàgina web continua essent operativa, però sense els avantatges de la personalització. Per a més detalls sobre l’ús, la gestió i la configuració de les galetes des dels navegadors, es recomana que es consulti el web http://www.aboutcookies.org.</li></ul>`;
		whatAreCookies.appendChild(whatAreCookiesTitle);
		whatAreCookies.appendChild(whatAreCookiesExplanation);
		const typeOfCookiesTitle = document.createElement('h2');
		typeOfCookiesTitle.textContent =
			"2. Quin tipus de galetes s'utilitzen a socvtv.fun?";
		const typeOfCookiesExplanation = document.createElement('p');
		typeOfCookiesExplanation.innerHTML = `Segons l’entitat que les gestiona
	<ul>
	<li>· De tercers. Són galetes que s’envien al terminal de l’usuari des d’un equip o domini no gestionat ni controlat per socvtv.fun. En aquest cas s’inclouen també les galetes que, instal·lades per socvtv.fun, recullen informació gestionada per tercers. Les galetes de tercers es poden utilitzar per al mesurament i l’anàlisi del comportament dels usuaris amb l’objectiu de millorar la seva experiència al web socvtv.fun.</li></ul>
	
	Segons el termini de temps que romanguin activades:<ul>
	<li>· Persistents. Es desen al terminal de l’usuari. Caduquen en un període llarg o mitjà de temps o no ho fan mai.</li></ul>
	Segons la finalitat:<ul><li>
	· D’anàlisi. Permeten a socvtv.fun l’anàlisi vinculada a la navegació duta a terme per l’usuari amb la finalitat de fer un seguiment de l’ús de la pàgina web, i també de fer estadístiques dels continguts més visitats, del nombre de visitants, etc.</li></ul>`;
		whatAreCookies.appendChild(typeOfCookiesTitle);
		whatAreCookies.appendChild(typeOfCookiesExplanation);
		const cookiesUsedTitle = document.createElement('h2');
		cookiesUsedTitle.textContent =
			'3. Quines són les finalitats de les galetes que es fan servir a socvtv.fun?';
		const cookiesUsedExplanation = document.createElement('p');
		cookiesUsedExplanation.innerHTML = `Les finalitats de les galetes que es fan servir a socvtv.fun són:
	<ul><li>
	· Analítiques. Les dades anònimes contingudes en aquestes galetes permeten el mesurament, el seguiment i l’estudi de l’activitat dels usuaris per tal d’incorporar millores a socvtv.fun.</li></ul>`;
		whatAreCookies.appendChild(cookiesUsedTitle);
		whatAreCookies.appendChild(cookiesUsedExplanation);
		const backButtonBottom = document.createElement('button');
		backButtonBottom.textContent = 'Tornar';
		backButtonBottom.classList.add('back-button');
		whatAreCookies.appendChild(backButtonBottom);
		content.appendChild(whatAreCookies);
		const backButtons = document.querySelectorAll('.back-button');
		backButtons.forEach((item) => {
			item.addEventListener('click', () => {
				displayInitialQuestion();
				history.pushState({}, '/', window.location.origin);
			});
		});
	});
});
