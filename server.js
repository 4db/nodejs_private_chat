var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/client.html');
});

var users = {};

io.on('connection', function(socket){
    users[socket.id] = '';

    socket.on('login', function(login){
        users[socket.id] = login;

        getUsers(function(html){
            io.emit('getUsers', html);
        }, socket.id);
    });

    socket.on('disconnect', function() {
        delete users[socket.id];
        getUsers(function(html){
            io.emit('getUsers', html);
        });
    });

    socket.on('msg', function(obj){
        var d = new Date();

        var msg = {
            time: d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds(),
            msg: obj.msg,
            login:users[socket.id]
        };

        if (obj.userIds.length === 0) {
            io.emit('msg', msg);
        }
        else {
            obj.userIds.map(function(id){
                io.to(id).emit('msg', msg);
            });
        }
    });
});


http.listen(3000, function(){
    console.log('listening on *:3000');
});

function getUsers(callback, loginId) {
    var html = '';

    for(var id in users) {
        if(users[id] !== '') {
            html += '<a href="#" class="list-group-item" id="' + id + '" onclick="selectUser(this)">' + users[id] + '</a>';
        }
    }
    callback(html);
    return;
}