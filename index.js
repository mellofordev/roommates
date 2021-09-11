
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const urlRegex=/(((https?:\/\/)|(www\.))[^\s]+)/g;
app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/index.html');
});
var users=[]
var socket_username='';
io.on('connection',(socket)=>{
    console.log('user connected ');
    io.emit('count',users.length,users);
    socket.on('chat message', (msg,username) => {
        var url=msg.match(urlRegex,msg);
        var new_url='<a href="'+url+'" target="_blank" style="color:#673AB6;" ">'+url+'</a>';
        msg=msg.replace(url,new_url);
        console.log(msg);
        io.emit('chat message', msg,username);
    });
    socket.on('user joined',(username)=>{
        if(users.includes(username)==false){
            socket_username=username;
            users.push(username);
            io.emit('user joined',username,users.length);
        }else{
            socket.on('disconnect',function(){
                console.log("disconnect");
            });
        }
    });
    socket.on('typing',(username)=>{
        socket.broadcast.emit('typing',username);
    });

    socket.on('image', (image,username) => {
        io.emit('image',{file:image.file,fileName:image.fileName,fileType:image.fileType},username)
    });
    socket.on('disconnect',(username)=>{
        console.log('user disconnected '+username);
        socket.broadcast.emit('userleft',username,users.length);
        console.log(username);
        users.pop(socket_username);
        io.emit('count',users.length,users);
        io.emit('userleft',socket_username);
        

        
    });

});
http.listen(3000,()=>{

    console.log("listing in port 3000")
});