console.log("Blah");

var express = require('express');
var app = express();
var server = app.listen(3000);
app.use(express.static('public'));
var socket = require('socket.io');
var io = socket(server);

var playerCount = 0;


//creates object for users 
function User(socketId) {
    
    this.id = socketId;
    this.username = "Player " + playerCount;

    this.getID = function() {
        return this.id;
    };

    this.getUsername = function() {
        return this.username;
    };

    this.getData = function() {
        return this.data;
    }

}

//when a connection is made 
io.sockets.on('connection', newConnection);

function newConnection(socket) {

    var user = new User(socket.id);
    playerCount++;

    
    socket.on('usernames', setUsername);

    function setUsername() {
        socket.emit('usernames', user.getUsername());
    }
    
    socket.on('mouse', mouseMsg);

    function mouseMsg(data) {
        socket.broadcast.emit('mouse', data);
        console.log(data);
    }

    
}