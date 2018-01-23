let express = require('express'),
    bodyParser = require('body-parser'),
    mongodb = require('mongodb');

let app = express();

//midleware Body-parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

let  port = 8080;

app.listen(port);

console.log('O servidor esta escutando a porta ' + port);