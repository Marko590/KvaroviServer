const { MongoClient } = require("mongodb");
var DBurl = "mongodb://localhost:27017/mydb";
const client = new MongoClient(DBurl);

/*schema : user{
    pushToken:string,
    timeCreated:doubleInt,
    neighbourhood:string
}
*/
async function listAll() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    console.log("Nesto")
    await client.connect();
    // Establish and verify connection
    var result = await client.db("mydb").collection('users').find({}).toArray()
    return result
    
    console.log("Connected successfully to server");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
async function insertUser(neighbourhood,time,token) {
  try {
    // Connect the client to the server (optional starting in v4.7)
    console.log("Nesto")
    await client.connect();
    // Establish and verify connection
    var newUser={neighbourhood:neighbourhood,timeCreated:time,pushToken:token}
    await client.db("mydb").collection('users').insertOne(newUser)
    
   
    console.log("Connected successfully to server");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
async function updateUser(newNeighbourhood,token) {
  try {
    // Connect the client to the server (optional starting in v4.7)
    console.log("Nesto")
    await client.connect();
    // Establish and verify connection
    var myquery = { pushToken: token };
    var newvalues = { $set: {neighbourhood:newNeighbourhood } };
    await client.db("mydb").collection('users').updateOne(myquery,newvalues)
    
   
    console.log("Connected successfully to server");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}


async function deleteUser(token) {
  try {
    // Connect the client to the server (optional starting in v4.7)
    console.log("Nesto")
    await client.connect();
    // Establish and verify connection
   
    await client.db("mydb").collection('users').deleteOne({pushToken:token})
    
   
    console.log("Connected successfully to server");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

//TODO: add error handling when the api tries to update a non-existant user.


// TODO: Find out how to forward this collected data as a return value of the function.

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

module.exports= {mainFunction,listAll,insertUser,deleteUser,updateUser,listAll}