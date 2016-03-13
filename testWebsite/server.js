//Lets require/import the HTTP module
var http = require('http');
var serveStatic = require ('serve-static');
var finalhandler = require('finalhandler');
var serve = serveStatic("./");

//Lets define a port we want to listen to
const PORT=8000;

//Create a server
var server = http.createServer(function(req, res) {
	var done = finalhandler(req,res);
	serve(req,res,done);
});

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});
