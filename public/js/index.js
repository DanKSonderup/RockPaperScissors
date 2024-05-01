const socket = io('http://localhost:3005', { transports: ['websocket', 'polling', 'flashsocket'] });

const form = document.getElementById('form');
const input = document.getElementById('input');

console.log(socket);

console.log("Loaded index.js");

socket.on('roomCreated', function (roomId) {
    console.log('Room created:', roomId);
    console.log(socket);
    fetch(`/waitroom/${roomId}`)
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
    fetch(`/gameroom/${roomId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            document.body.innerHTML = html;
            const script = document.createElement('script');
            script.src = '/js/gameroom.js';
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