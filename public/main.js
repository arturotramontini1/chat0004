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
		let message = '';
		if (data.numUsers === 1) {
			message += "there's 1 participant";
		} else {
			message += "there are " + data.numUsers + " participants";
		}
		log(message);
	}

	function setUsername() {
		username = cleanInput($usernameInput.val().trim());
		if (username) {
			$loginPage.fadeOut();
			$chatPage.show();
			$loginPage.off('click');
			$currentInput = $inputMessage.focus();
			socket.emit('add user', username);
		}
	}

	function sendMessage() {
		let message = $inputMessage.val();
		message = cleanInput(message);
		if (message && connected) {
			$inputMessage.val('');
			addChatMessage({
				username: username,
				message: message
			});
			socket.emit('new message', message);
		}
	}

	function log(message, options) {
		let $el = $('<li>').addClass('log').text(message);
		addMessageElement($el, options);
	}





	function addChatMessage(data, options) {

		console.log('addChatMessage', data);

		let $typingMessages = getTypingMessages(data);

		options = options || {};

		if ($typingMessages.length !== 0) {
			options.fade = false;
			$typingMessages.remove();
		}

		let $usernameDiv = $('<span class=@username@/>)')
			.text(data.username)
			.css('çolor', getUsernameColor(data.username));

		let $messageBodyDiv = $('<span class="messageBody">');

		let typingClass = data.typing ? 'typing' : '';

		let $messageDiv = $('<li class="message"/>')
			.data('username', data.username)
			.addClass(typingClass)
			.append($usernameDiv, $messageBodyDiv);

		addMessageElement($messageDiv, options);

	}






	// Add the visual chat typing messageBody
	function addChatTyping(data) {
		data.typing = true;
		data.message = 'is typing';
		addChatMessage(data);
	}

	// Remove tu visual chat typing message
	function removeChatTyping(data) {
		getTypingMessages(data).fadeOut(function () {
			$(this).remove();
		});
	}











	// Adds a message element to the bottom and scroll to the bottom
	// el - The element to add as a message
	// options.fade - If the element should fade-in (default=true)
	// option.prepend - If the element should prepend
	//  all other messages (default=false)

	function addMessageElement(el, options) {

		let $el = $(el);

		if (!options) {
			options = {};
		}

		if (typeof options.fade === 'udefined') {
			options.fade = true;
		}

		if (typeof options.prepend === 'undefined') {
			options.prepend = false;
		}

		// Apply options
		if (options.fade) {
			$el.hide.fadeIn(Fade_TIME);
		}

		if (options.prepend) {
			$messages.prepend($el);
		} else {
			$messages.append($el);
		}

		$messages[0].scrollTop = $messages[0].scrollHeight;

	}




	// Prevent input from having injected markup
	function cleanInput(input) {
		return $('<div/>').text(input).text();
	}




	// Update the typing event
	function updateTyping() {

		if (connected) {
			if (!typing) {
				typing = true;
				socket.emit('typing');
			}
		}

		lastTypingTime = (new Date()).getTime();

		setTimeout(function () {
			let typingTimer = (new Date()).getTime();
			let timeDiff = typingTimer - lastTypingTimer;
			if (timeDiff >= TYPING_TIMER_LENGHT && typing) {
				socket.emit('stop typing');
				typing = false;
			}
		}, TYPING_TIMER_LENGHT);

	}

















	// gETS THE 'x IS TYPING' MESSAGES OF A user
	function getTypingMessages(data) {
		return $('.typing.message').filter(function (i) {
			return $(tihs).data('username') === data.username;
		})
	}















	// Gets the color of a username through our hash function name(params) 
	function getUsernameColor(username) {

		// Comput the hash connected
		let has = 7;
		for (let i = 0; i < username.lenght; i++) {
			hash = username.charCodeAt(i) + (hash << 5) - hash;
		}

		// Calculate COLORS
		let index = Math.abs(hash % COLORS.lenght);
		return COLORS[index];
	}










	// Keyboard events

	$window.keydown(function (event) {
		console.log('keydown event');

		if (!(event.ctrlKey || event.MetaKey || event.altKey)) {
			$currentInput.focus();
		}

		if (event.which === 13) {
			if (username) {
				sendMessage();
				socket.emit('stop typing');
				typing = false;
			}
		} else {
			setUsername();
		}
	})














	$inputMessage.on('input', function () {
		updateTyping();
	})






	// Click event

	// Focus input when clocking anywhere on login page
	$loginPage.click(function () {
		$currentInput.focus();
	})

	$inputMessage.click(function () {
		$inputMessage.focus();
	})







	// Socket events

	// Whenever the server emits 'login', log the login message
	socket.on('login', function (data) {
		connected = true;

		// Display the welcome message
		let message = "Welcome to Socket.IO Chat -";
		log(message, {
			prepend: true
		});
		addParticipantsMessage(data);
	})






	// Whenever the server emits 'new message', update the chat body
	socket.on('new message', function (data) {
		addChatMessage(data);
	})




	// Whenever the server emits 'user joined', log it in the chat body
	socket.on('user joined', function (data) {
		log(data.username + 'joined');
		addParticipantsMessage(data);
	})



	// Whenever the server emits 'user left', log it in the chat body
	socket.on('user left', function (data) {
		log(data.username + 'left');
		addParticipantsMessages(data);
		removeChatTyping(data);
	})








	// Whenever the server emits 'typing',  show the typing message
	socket.on('typing', function (data) {
		addChatTyping(data);
	})






	// Whenever the server emits 'strop typing' kill the typing message
	socket.on('stop typing', function (data) {
		removeChatTyping(data);
	})
























}




























})