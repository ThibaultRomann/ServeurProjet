// Définition de la variable pour utiliser les fonctionnalites du module express  
var express = require('express'); 

// Paramètres du serveur local 
var hostname = 'localhost'; 
var port = 7000; 

// Définition de la variable pour utiliser les fonctionnalités du module mongoose 
var mongoose = require('mongoose'); 

// Options recommandées par le fournisseur MLab 
var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };

// URL de la base de données Mongo hébergée chez MLab 
var urlmongo = "mongodb://matthieu:pwd@ds129179.mlab.com:29179/mydbpos"; 

// Connexion de l'api à la base de donnée Mongo 
mongoose.connect(urlmongo, options);
var db = mongoose.connection; 
db.on('error', console.error.bind(console, 'Erreur lors de la connexion')); 
db.once('open', function (){
    console.log("Connecte a la base de donnee Mongo"); 
}); 


// Création du modèle de données à stocker dans la base, le même modèle que celui de la donnée envoyée par l'application 
var sujetSchema = mongoose.Schema({
    titre: String, 
    enonce: String, 
    niveau: String, 
    tagsujets: String   
}); 

var Sujet = mongoose.model('Sujet', sujetSchema);

var app = express(); 
var bodyParser = require("body-parser"); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Afin de faciliter le routage (les URL que nous souhaitons prendre en charge dans notre API), nous créons un objet Router.
//C'est à partir de cet objet myRouter, que nous allons implémenter les méthodes. 
var myRouter = express.Router(); 


myRouter.route('/sujets')
// Implémentation de get, post, put, delete 

.get(function(req,res){ 
	  res.json({
 message : "Liste des sujets presents dans la base de donnees:",
 nbResultat : req.query.maxresultat, 
 methode : req.method });
})

.post(function(req,res){
      var sujet = new Sujet();
      sujet.titre = req.body.titre;
      sujet.enonce = req.body.enonce;
      sujet.niveau = req.body.niveau;
      sujet.tagsujets = req.body.tagsujets;
      sujet.save(function(err){
        if(err){
          res.send(err);
        }
        res.send({message : 'OK le sujet est stocke dans la base de donnees'});
      })
})

.put(function(req,res){ 
      res.json({message : "Mise à jour des informations d'un sujet dans la liste", methode : req.method});
})

.delete(function(req,res){ 
res.json({message : "Suppression d'un objet dans la liste", methode : req.method});  
}); 

// Utilisation du routeur 
app.use(myRouter);  

// Démarrage du serveur 
app.listen(port, hostname, function(){
	console.log("Mon serveur fonctionne sur http://"+ hostname +":"+port); 
});

myRouter.route('/')
 
.all(function(req,res){ 
      res.json({message : "Bienvenue sur notre API ", methode : req.method});
});


myRouter.route('/sujet/:sujet_id')
.get(function(req,res){ 
            Sujet.findById(req.params.sujet_id, function(err, sujet) {
            if (err)
                res.send(err);
            res.json(sujet);
        });
})
.put(function(req,res){ 
                Sujet.findById(req.params.sujet_id, function(err, sujet) {
                if (err){
                    res.send(err);
                }
                        sujet.titre = req.body.titre;
                        sujet.enonce = req.body.enonce;
                        sujet.niveau = req.body.niveau;
                        sujet.tagsujets = req.body.tagsujets;
                              sujet.save(function(err){
                                if(err){
                                  res.send(err);
                                }
                                // Si tout est ok
                                res.json({message : 'Mise a jour des donnees effectuee'});
                              });                
                });
})
.delete(function(req,res){ 
 
    Sujet.remove({_id: req.params.sujet_id}, function(err, sujet){
        if (err){
            res.send(err); 
        }
        res.json({message:"Sujet supprime de la base de donnees"}); 
    }); 
    
});