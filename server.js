const express = require('express');
const io = require('socket.io')(3005);
const app = express();
const RoomLogic = require('./server/roomLogic');
const GameLogic = require('./server/gameLogic');
const pug = require('pug');


app.use(path.join(__dirname, 'public'));
app.set('view engine', 'pug');
app.set('views', './public/views')

const activeRooms = {};
const Users = [{}];

app.get('/rockpaperscissors', (req, res) => {
    res.render('frontpage');
});

app.get('/waitroom/:id', (req, res) => {
    const roomId = req.params.id;
    res.render('waitroom', { roomId: roomId });
});

app.get('/gameroom/:id', (req, res) => {
    const roomId = req.params.id;
    res.render('gameroom', { roomId: roomId });
});

io.on('connection', socket => {
    socket.on('createRoom', () => {
        let roomId;
        do {
            roomId = RoomLogic.generateRandomID(6);
        } while (activeRooms[roomId]);


        activeRooms[roomId] = [socket.id];
        socket.join(roomId);
        console.log(`Room ${roomId} created`);
        socket.emit('roomCreated', roomId);
    });

    socket.on('joinRoom', (roomId) => {
        if (activeRooms[roomId]) {
            socket.join(roomId);
            activeRooms[roomId].push(socket.id);
            console.log(`User joined room ${roomId}`);
            // socket.emit('joinsuccess', message);
            io.to(roomId).emit('playerjoined', roomId);
            Users.push({ id: roomId, users: [{ clientID: null, pick: null, wins: 0 }, { clientID: null, pick: null, wins: 0 }] });
        } else {
            socket.emit('roomNotFound', roomId);
        }
    });

    socket.on('requestUser', (roomId, clientID) => {
        const userPickItem = Users.find(item => item.id === roomId);
        if (userPickItem.users[0].clientID === null) {
            userPickItem.users[0].clientID = clientID;
        } else if (userPickItem.users[1].clientID === null) {
            userPickItem.users[1].clientID = clientID;
        }
        socket.emit('userGranted', userPickItem);
    });

    socket.on('turnTaken', (roomId, userIndex, pick) => {
        let roundWinner = -1;
        const userArray = Users.find(item => item.id === roomId).users;
        let opponent = userIndex == 0 ? 1 : 0;
        if (userArray[opponent].pick === null) {
            userArray[userIndex].pick = pick;
        } else {
            userArray[userIndex].pick = pick;
            roundWinner = GameLogic.findWinner(userArray[0].pick, userArray[1].pick);
            let playerPicks = [userArray[0].pick, userArray[1].pick];
            userArray[0].pick = null;
            userArray[1].pick = null;
            io.to(roomId).emit('roundWinner', { roundWinner: roundWinner, playerPicks: playerPicks });
        }
    });
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});