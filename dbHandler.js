var MongoClient = require('mongodb').MongoClient;
var DBurl = "mongodb://localhost:27017/mydb";


/*schema : user{
    pushToken:string,
    timeCreated:doubleInt,
    neighbourhood:string
}
*/


function insertUser(neighbourhood,time,token){
    MongoClient.connect(DBurl,function(err,db){
        if(err) throw err;
        var dbo=db.db("mydb")
        var newUser={neighbourhood:neighbourhood,timeCreated:time,pushToken:token}
        dbo.collection('users').insertOne(newUser,function(err,res){
            if(err) throw err;
            console.log("User successfully inserted.")
            db.close()
        })
    })
}

function updateUser(newNeighbourhood,token){
    MongoClient.connect(DBurl, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var myquery = { pushToken: token };
        var newvalues = { $set: {neighbourhood:newNeighbourhood } };
        dbo.collection("users").updateOne(myquery, newvalues, function(err, res) {
          if (err) throw err;
          console.log("User successfully updated.");
          db.close();
        });
      }); 
}

function deleteUser(token){
    MongoClient.connect(DBurl, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var myquery = { pushToken:token };
        dbo.collection("users").deleteOne(myquery, function(err, obj) {
          if (err) throw err;
          console.log("User successfully deleted.");
          db.close();
        });
      }); 
}
function listAll(){
    let returnValue=0
    MongoClient.connect(DBurl, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("users").find({}).toArray(function(err, result) {
          if (err) throw err;
          console.log(result);
          
          db.close();
          
        });
        
      }); 
     
}
function mainFunction(){
MongoClient.connect(DBurl, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});

  MongoClient.connect(DBurl, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    var myobj = { neighbourhood: "Cukarica", token: "aadsgkkjl" };
    dbo.collection("users").insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  });
  
MongoClient.connect(DBurl, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    dbo.collection('users').updateOne
    dbo.collection("users").findOne({neighbourhood:"Cukarica"}, function(err, result) {
      if (err) throw err;
      console.log(result.token);
      db.close();
    });
    
    
  });  
  
}

module.exports= {mainFunction,listAll,insertUser,deleteUser}