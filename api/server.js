let express = require('express'),
    bodyParser = require('body-parser'),
    multiparty = require('connect-multiparty'),
    mongodb = require('mongodb'),
    objectId = require('mongodb').ObjectID,
    fs = require('fs'); //fs=file system nativo do NodeJs para trabalhar com Arquivos no lado servidor

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

    let date = new Date();
    let timeStamp = date.getTime();

    //com o modulo 'fs' o req.files retorna um json com os dados do Arquivo enviado do Front Client com o nome do Input do File
    let nomeDaImg = timeStamp + '_' + req.files.arquivo.originalFilename;

    let pathOrigem = req.files.arquivo.path;
    let pathDestino = './uploads/' + nomeDaImg;
    //metodo do modulo 'fs' para renomear o caminho do arquivo do temporario para o fixo no servidor
    fs.rename(pathOrigem, pathDestino, (err) => {
        if(err) {
            res.status(500).json({error: err});
            return;
        }

        let dados = {
            titulo: req.body.titulo,
            url_imagem: nomeDaImg
        }

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
});

app.get('/api', (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*");

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

//rota para pegar as Imagens no servidor a partir do URL do client
app.get('/imagens/:imagem', (req, res) => {
    let img = req.params.imagem;

    fs.readFile('./uploads/' + img, (err, conteudo) => {
        if(err) {
            res.status(400).json(err);
            return;
        }

        //escrever no cabeçalho o conten type do tipo image/jpg informando o navegador q é esse conteudo
        res.writeHead(200, {'content-type' : 'image/jpg'});
        //func nativa do NODE q escreve dentro do response --> .end
        res.end(conteudo);
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