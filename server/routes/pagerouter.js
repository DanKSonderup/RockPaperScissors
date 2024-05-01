const express = require('express');
const router = express.Router();
const io = require('socket.io')(3005);
const RoomLogic = require('../roomLogic');
const GameLogic = require('../gameLogic');

const activeRooms = {};
const Users = [{}];

router.get('/', (req, res) => {
    res.render('frontpage');
});

router.get('/waitroom/:id', (req, res) => {
    const roomId = req.params.id;
    res.render('waitroom', { roomId: roomId });
});

router.get('/gameroom/:id', (req, res) => {
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

module.exports = router;