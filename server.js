console.log("Blah");

var express = require('express');
var app = express();
var server = app.listen(3000, '0.0.0.0');
app.use(express.static('public'));
var socket = require('socket.io');
var io = socket(server);
const path = require('path');


var playerCount = 0;

var users = {};

app.use(express.static(__dirname));
app.use('/Images', express.static(path.join(__dirname, 'Images')));


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

socket.on("erase", (data) => {
    socket.broadcast.emit("erase", data);
  });

function newConnection(socket) {

    var user = new User(socket.id);
    users[socket.id] = user;
    playerCount++;
    var usernameString = user.getUsername();

    console.log("Assigned username: " + usernameString);

    setTimeout(() => {
        socket.emit('usernames', usernameString);
    }, 300);

    
    socket.on('mouse', mouseMsg);

    function mouseMsg(data) {
        socket.broadcast.emit('mouse', data);
        console.log(data);
    }

    
}