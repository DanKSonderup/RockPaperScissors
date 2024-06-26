
const socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');

console.log("Loaded index.js");

function constructUrl(path, roomId) {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}${path}/${roomId}`;
}

socket.on("connect_error", (err) => {
    // the reason of the error, for example "xhr poll error"
    console.log(err.message);

    // some additional description, for example the status code of the initial HTTP response
    console.log(err.description);

    // some additional context, for example the XMLHttpRequest object
    console.log(err.context);
});

socket.on('roomCreated', function (roomId) {
    console.log('Room created:', roomId);
    fetch(constructUrl('waitroom', roomId))
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            document.body.innerHTML = html;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
});


socket.on('playerjoined', function (roomId) {
    console.log('Playerjoined called', roomId);
    fetch(constructUrl('gameroom', roomId))
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            document.body.innerHTML = html;
            const script = document.createElement('script');
            script.src = 'js/gameroom.js';
            script.defer = true;
            document.body.appendChild(script);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
    const result = document.getElementsByClassName('result')[0];
});

function createRoom() {
    console.log("Called CreateRoom");
    socket.emit('createRoom');
}

function joinRoom() {
    const roomId = document.getElementById('roomIdInput').value;
    socket.emit('joinRoom', roomId);
}