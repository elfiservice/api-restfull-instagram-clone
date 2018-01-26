let express = require('express'),
    bodyParser = require('body-parser'),
    mongodb = require('mongodb'),
    objectId = require('mongodb').ObjectID;

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
            });
        });
    });
  
    
});

app.get('/api', (req, res) => {
    db.open((err, mongoClient) => {
        mongoClient.collection('postagens', (err, collection) => {
            collection.find().toArray((err, result) => {
                if(err) {
                    res.json(err);
                } else if (result) {

                    res.status(200).json(result);
                } else {
                    res.status(404).json(result);
                }
                mongoClient.close();
            });
        });
    });
});

app.get('/api/:id', (req, res) => {
    db.open((err, mongoClient) => {
        mongoClient.collection('postagens', (err, collection) => {
            collection.find({_id : objectId(req.params.id)}).toArray((err, result) => {
                if(err) {
                    res.json(err);
                } else if (result != "") {
                    res.status(200).json(result);
                } else {
                    res.status(404).json(result);
                }
                mongoClient.close();
            });
        });
    });
});

//PUT - atualizar API
app.put('/api/:id', (req, res) => {
    db.open((err, mongoClient) => {
        mongoClient.collection('postagens', (err, collection) => {
            collection.update(
                { _id : objectId(req.params.id) },
                { $set : { name: req.body.name } },
                {},
                (err, results) => {
                    if(err) {
                        res.json(err);
                    } else {
                        res.json(results);
                    }
                    mongoClient.close();    
                }
            );
        });
    });
});

//delete - remover do BD API
app.delete('/api/:id', (req, res) => {
    db.open((err, mongoClient) => {
        mongoClient.collection('postagens', (err, collection) => {
            collection.remove({ _id : objectId(req.params.id) }, (err, result) => {
                if(err) {
                    res.json(err);
                } else {
                    res.json(result);
                }
                mongoClient.close();
            });
        });
    });
});