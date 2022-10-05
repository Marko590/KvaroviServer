var express = require('express');
var app = express();
var fs = require("fs");
const axios = require('axios').default;
const util = require('util')
const request = require('request');
var parser = require('node-html-parser');
const { Expo } = require('expo-server-sdk')
const dbHandler = require('./dbHandler.js');
const schedule = require('node-schedule');
const formattingHandler = require('./formattingHandler.js')
const malfunctionHandler = require('./malfunctionsHandler.js')


// Setting up expo notification service.
let expo = new Expo({ accessToken: process.env.ACCESS_TOKEN });


//Rewrite this so it doesn't make a request for each user
async function generateNotifications() {
    let messages = []
    let list = await dbHandler.listAll()
    console.log(list)
    await list.forEach(async function (user) {

        let numPlumbing = await malfunctionHandler.numberOfPlumbingAlerts(user.neighbourhood)
        let numElectrical = await malfunctionHandler.numberOfElectricalAlerts(user.neighbourhood)
        if (Expo.isExpoPushToken(user.pushToken)) {
            messages.push({
                to: user.pushToken,
                sound: 'default',
                body: formattingHandler.electricalNumberString(numElectrical) + '\n' + formattingHandler.plumbingNumberString(numPlumbing),
                title: 'Кварови: ' + user.neighbourhood
            })
        }
        console.log(messages)
    })
    setTimeout(() => { expo.sendPushNotificationsAsync(messages) }, 5000)
}

generateNotifications()

// Setting up a callback function to be called each day at 10 AM.
const rule = new schedule.RecurrenceRule();
rule.hour = 10;
const job = schedule.scheduleJob(rule, function () {
    generateNotifications()
});

//Middleware setup
var bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

// Routes

app.get('/vodovod/kvarovi', async function (req, res) {

    let data = await malfunctionHandler.getPlumbingInfo()
    res.end(JSON.stringify(data));
})

app.get('/db', async function (req, res) {
    
    let result = await dbHandler.listAll()
    res.end(JSON.stringify(result))
})

app.post('/notification/add', async function (req, res) {
    const d = new Date()
    dbHandler.insertUser(req.body.chosen, d.getTime(), req.body.token)
    res.end(JSON.stringify({ response: 'response' }))
})

app.post('/notification/update', async function (req, res) {
    const d = new Date()

    dbHandler.updateUser(req.body.chosen, req.body.token)
    res.end(JSON.stringify({ response: 'response' }))
})

app.post('/notification/delete', async function (req, res) {

    dbHandler.deleteUser(req.body.token)
    res.end(JSON.stringify({ response: 'response' }))
})

app.post('/notification/check', async function (req, res) {

    let result=await dbHandler.isPresent(req.body.token)
    console.log(result)
    if(result){
        res.end(JSON.stringify({ present: 'true' }))
    }
    else{
        res.end(JSON.stringify({ present: 'false' }))
    }
   
})

app.get('/vodovod/radovi', async function (req, res) {

    let data = await malfunctionHandler.getPlannedWorks()
    res.end(JSON.stringify(data));
})

app.post('/vodovod/coordinates', async function (req, res) {

    let data = await malfunctionHandler.getCoordinateFromResponseBody(req.body.address)
    res.end(JSON.stringify(data));
})

app.get('/struja/radovi', async function (req, res) {

    let data = await malfunctionHandler.getElectricalWorks()
    res.end(JSON.stringify(data));
})

const port = process.env.PORT || 3000;

app.set('port', port)
var server = app.listen(port, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})