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

//conexao com mongodb
let db = new mongodb.Db(
    'instagram',
    new mongodb.Server('localhost', 27017, {}),
    {}
);

//testando o GET dando um Ola para o Postman
app.get('/', (req, res) => {
    res.send({msg: 'ola'});
});

app.post('/api', (req, res) => {
    let dados = req.body;
    db.open((err, mongoClient) => {
        mongoClient.collection('postagens', (err, collection) => {
            collection.insert(dados, (err, result) => {
                if(err){
                    res.json(err)
                }else{
                    res.json(result);
                }
                mongoClient.close();
            })
        })
    })
  
    
})