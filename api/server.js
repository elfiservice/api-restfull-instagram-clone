let express = require('express'),
    bodyParser = require('body-parser'),
    multiparty = require('connect-multiparty'),
    mongodb = require('mongodb'),
    objectId = require('mongodb').ObjectID;

let app = express();

//midleware Body-parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(multiparty());

let  port = 3030;

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
    
    //seta o RestFul para responder o APP de Origem a quando este for solicitado. recebendo uma resposta no front
    //parametro 1: é o erro q da no Front ao tentar enviar uma solicitação para esta API
    //parametro 2: é o dominioo de destino da resposta, poe um * para dizer q qualquer dominio solicitante pode recevber essa resposta da API
    res.setHeader("Access-Control-Allow-Origin", "*");
    let dados = req.body;

    res.send(dados);
        
    // db.open((err, mongoClient) => {
    //     mongoClient.collection('postagens', (err, collection) => {
    //         collection.insert(dados, (err, result) => {
    //             if(err){
    //                 res.json(err)
    //             }else{
    //                 res.json(result);
    //             }
    //             mongoClient.close();
    //         });
    //     });
    // });
  
    
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