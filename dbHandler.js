const { MongoClient } = require("mongodb");
var DBurl = process.env.MONGODB_CONNECTION_URL;
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
    console.log("Listing all users.")
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
async function isPresent(token) {
  try {
    // Connect the client to the server (optional starting in v4.7)
    console.log("Checking whether user with token "+ token + "is present")
    await client.connect();
    // Establish and verify connection
    var result = await client.db("mydb").collection('users').find({pushToken:token}).toArray()
    if(result.length===0){
      return false
    }
    else{
      return true
    }
    
    
    console.log("Connected successfully to server");
  }catch(err){
    console.log(err)
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

async function insertUser(neighbourhood,time,token) {
  try {
    console.log("Adding user with token "+ token + " who's chosen neighbourhood is: "+neighbourhood)
    // Connect the client to the server (optional starting in v4.7)
   
    
    await client.connect();
    // Establish and verify connection
    var newUser={neighbourhood:neighbourhood,timeCreated:time,pushToken:token}
    await client.db("mydb").collection('users').insertOne(newUser)
    
   
    console.log("Connected successfully to server");
  }catch(err){
    console.log(err)
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
  }catch(err){
    console.log(err)
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}


async function deleteUser(token) {
  try {
    // Connect the client to the server (optional starting in v4.7)
    console.log("Deleting user with token "+ token )
    console.log("Nesto")
    await client.connect();
    // Establish and verify connection
   
    await client.db("mydb").collection('users').deleteOne({pushToken:token})
    
   
    console.log("Connected successfully to server");
  }catch(err){
    console.log(err)
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

//TODO: add error handling when the api tries to update a non-existant user.


// TODO: Find out how to forward this collected data as a return value of the function.



module.exports= {listAll,insertUser,deleteUser,updateUser,listAll,isPresent}