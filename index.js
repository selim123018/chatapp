 var mongodb=require('mongodb').MongoClient;
var port=process.env.PORT || 4000;
var client=require('socket.io').listen(port).sockets;


//to connet database  
mongodb.connect('mongodb://localhost/mongochat',function(err,db){ 
    if(err){
       throw err;
    }   

    console.log('database connected succesfully');

    // connect to socket.io
    client.on('connection',function(socket){
      var chat=db.collection('messages');

      // create function to send status
      sendStatus=function(s){
        socket.emit('status',s);
      } 

        // get chat from mongodb collection
        chat.find().limit(100).sort({_id:1}).toArray(function(err,res){
         if(err)
          {
             throw err; 
          } 

           //emit the message
           socket.emit('output',res);
        });

        // handle input events
        socket.on('input',function(data){
          var name=data.name;
          var message=data.message;

          if(name=='' || message==''){
              sendStatus('name and message is required');
          } else{
             // insert message
              chat.insert({name:name, message:message},function(){
                   client.emit('output',[data]);

                  sendStatus({
                    message:"message sent",
                    clear:true
                  });
              });
            }
        });

        // handle clear
        socket.on('clear',function(){
          // remove all chats from collection
          chat.remove({},function(){
            socket.emit('cleared');
          });
        });
    });
});



console.log("server is running on port "+port);