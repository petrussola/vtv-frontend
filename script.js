console.log(window.location);
const content = document.getElementById('content');
const button = document.getElementById('button');

// state
const state = {
	progress: 0,
};

// redirect to "/"
// https://stackoverflow.com/questions/588040/window-onload-vs-document-onload
window.onload = () => {
	window.history.pushState({}, '/', window.location.origin);
	content.innerHTML =
		'<h1>Ets un Vilafranqui de Tota la Vida? Prova el test!</h1>';
	button.textContent = 'Comencar el test';
};

// start survey
button.addEventListener('click', () => {
	window.history.pushState({}, '/test', window.location.origin + '/test/1');
	state.progress++;
	firstQuestion(window.location.pathname);
	console.log(window.location);
});

// display first question
function firstQuestion(pathname) {
	if (pathname === `/test/${state.progress}`) {
		content.innerHTML = '<h1>Què és "El Trànsit"?</h1>';
	}
}
