$(function () {

	let FADE_TIME = 150;
	let TYPING_TIMER_LENGTH = 400;
	let COLORS = [
		'#e21400', '#91580f', '#f8a700', '#f78b00',
		'#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
		'#3b88eb', '#3824aa', '#a700ff', '#d300e7'
	];

	// Initialize variables
	let $window = $(window);
	let $usernameInput = $('.usrnameInput');
	let $messages = $('.messages');
	let $inputMessage = $('.inputMessage');

	let $loginPage = $('.login.page');
	let $chatPage = $('.chat.page');

	// Promp for setting a usrnameInput
	let username;
	let connected = false;
	let typing = false;
	let lastTypingTime;
	let $currentInput = $usernameInput.focus();

	let socket = io();

	function addParticipantsMessage(data) {
		let message = ''
		message += "";

	}

})