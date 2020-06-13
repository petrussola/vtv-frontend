const content = document.getElementById('content');
const button = document.getElementById('button');
const errorContainer = document.getElementById('error');
const pregunta = document.getElementById('pregunta');
const respostes = document.getElementById('respostes');


// state
const state = {
	counter: 0,
	questions: {
		0: {
			pregunta: 'Ets un Vilafranqui de Tota la Vida? Prova el test!',
			respostes: [],
			correcte: null,
		},
	},
	fetchedQuestions: false,
	questionCounter: 0,
	score: 0,
};

// display first question
const fetchQuestions = async () => {
	try {
		const data = await fetch('http://localhost:5000/test/');
		const questions = await data.json();
		state.questions = { ...state.questions, ...questions.data };
		state.counter++;
		state.fetchedQuestions = true;

		if (state.counter === 2) {
			throw new Error('this is an error');
		}
	} catch (error) {
		errorContainer.className = 'activated';
		errorContainer.textContent = error.message;
	}
};

const displayText = (text, node) => {
	console.log('heh');
};

// redirect to "/"
// https://stackoverflow.com/questions/588040/window-onload-vs-document-onload
window.onload = () => {
	window.history.pushState({}, '/', window.location.origin);
	pregunta.textContent = `${state.questions[state.questionCounter].pregunta}`;
	button.textContent = 'Comencar el test';
	fetchQuestions();
};

// start survey
button.addEventListener('click', (e) => {
	// hide button start test first time we click on the button
	if (state.questionCounter === 0) {
		button.style.visibility = 'hidden';
	}
	state.questionCounter++;
	console.log(state.questions[state.questionCounter]);
	console.log(state.counter);
	pregunta.textContent = `${state.questions[state.questionCounter].pregunta}`;
	respostes.innerHTML = state.questions[state.questionCounter].respostes
		.map((item) => {
			return `<button>${item}</button>`;
		})
		.join('');

	// clear error message when clicking on start button after test has been triggered
	if (errorContainer.className.includes('activated')) {
		console.log('yess');
		errorContainer.classList.remove('activated');
		errorContainer.textContent = '';
	}
});

respostes.addEventListener('click', (e) => {
	const resposta = e.target.textContent;
	if (resposta == state.questions[state.questionCounter].correcte) {
		state.score++;
	}
});
