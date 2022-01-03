const http = require('http');
const fs = require('fs');

const express = require('express');

const app = express();

const PORT = process.env.PORT || 4000;

let target = "http://upload.wikimedia.org/wikipedia/commons/transcoded/1/1b/En-au-open_book.ogg/En-au-open_book.ogg.mp3";
// figure out 'real' target if the server returns a 302 (redirect)

app.use(express.static('dist'));

app.get('/api/v1/audio/:key', function(req, res) {
    var key = req.params.key;

    
    console.log("DONE", key);
});
app.listen(PORT, () => console.log("\x1b[43m%s\x1b[0m", `\n listening on http://localhost:${PORT} \n`));