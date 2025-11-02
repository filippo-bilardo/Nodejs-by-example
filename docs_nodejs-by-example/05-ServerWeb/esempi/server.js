const http = require("http");

http.createServer(function (req, res) {
    setTimeout(function () {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.write("Hello World");
        res.end();
    }, 2000);
}).listen(8008);

console.log("Server running at http://127.0.0.1:8008/");
