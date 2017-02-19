// Utilisation du module express  
var express = require('express'); 

// Connexion à la base de données Mongo  
var mongoose = require('mongoose');

var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };

var urlmongo = "mongodb://matthieu:pwd@ds129179.mlab.com:29179/mydbpos"; 
 
mongoose.connect(urlmongo, options);
var db = mongoose.connection; 
db.on('error', console.error.bind(console, 'Erreur lors de la connexion')); 
db.once('open', function (){
    console.log("Connecte a la base de donnee Mongo"); 
}); 

// Création du modèle de données à stocker dans la base, le même modèle que celui de la donnée envoyée par l'application 
var userDataSchema = mongoose.Schema({
    idclient: String, 
    idexo: String, 
    reponse : String,
    dateexo :String,   
}); 

var UserData = mongoose.model('UserData', userDataSchema);

var userScoreSchema = mongoose.Schema({
    idscore: String,
    score : Number 
});

var UserScore = mongoose.model('UserScore',userScoreSchema);

var app = express(); 

// Création du port 
app.set('port', (process.env.PORT || 5000));

var bodyParser = require("body-parser"); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Création de la route userdata pour le stockage des données utilisateurs  
var myRouter = express.Router(); 

myRouter.route('/userdata')

// Implémentation des méthodes de l'API REST (get, post, put, delete) 
.get(function(req,res){
            UserData.find(function(err,userdata){
            //UserData.find({}, {"sort" : [['dateexo', 'asc']]}, function(err, userdata) {
              //UserData.find().sort({'dateexo':1}, function(err, userdata) {
            if (err)
                res.send(err);
            res.json(userdata);
        }).sort({'dateexo':1});
})

.post(function(req,res){
      var data = new UserData();
      data.idclient = req.body.idclient;
      data.idexo = req.body.idexo;
      data.reponse = req.body.reponse;
      data.dateexo = req.body.dateexo;
      data.save(function(err){
        if(err){
          res.send(err);
        }
        res.send({message : 'OK la donnee utilisateur est stockee dans la base de donnees'});
      })
})

.put(function(req,res){ 
      res.json({message : "Mise à jour des informations", methode : req.method});
})

.delete(function(req,res){ 
res.json({message : "Suppression d'un objet", methode : req.method});  
});

// Création de la route userscore pour le stockage des scores de chaque utilisateur
myRouter.route('/userscore')

// Implémentation des méthodes de l'API REST (get, post, put, delete) 
.get(function(req,res){ 
    res.json({

 message : "Liste des scores utilisateurs dans la base de donnees:",
 nbResultat : req.query.maxresultat, 
 methode : req.method });
})

.post(function(req,res){
      var sc = new UserScore();
      sc.idscore = req.body.idscore;
      sc.score = req.body.score;
      sc.save(function(err){
        if(err){
          res.send(err);
        }
        res.send({message : 'Score utilisateur stocke'});
      })
})

.put(function(req,res){ 
      res.json({message : "Mise à jour des informations", methode : req.method});
})

.delete(function(req,res){ 
res.json({message : "Suppression d'un objet", methode : req.method});  
}); 


// Utilisation du routeur 
app.use(myRouter);  

// Démarrage du serveur 

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

myRouter.route('/')
 
.all(function(req,res){ 
      res.json({message : "Bienvenue sur notre API REST ", methode : req.method});
});


myRouter.route('/userdat/:userdata_id')
.get(function(req,res){ 
            UserData.findById(req.params.userdata_id, function(err, userdat) {
            if (err)
                res.send(err);
            res.json(userdat);
        });
})
.put(function(req,res){ 
                UserData.findById(req.params.userdata_id, function(err, userdat) {
                if (err){
                    res.send(err);
                }
                          userdat.idclient = req.body.idclient;
                          userdat.idexo = req.body.idexo;
                          userdat.reponse = req.body.reponse;
                              userdat.save(function(err){
                                if(err){
                                  res.send(err);
                                }
                                res.json({message : 'Mise a jour des donnees effectuee'});
                              });                
                });
})
.delete(function(req,res){ 
 
    UserData.remove({_id: req.params.userdata_id}, function(err, userdat){
        if (err){
            res.send(err); 
        }
        res.json({message:"Suppression d'une donnee utilisateur"}); 
    }); 
    
});