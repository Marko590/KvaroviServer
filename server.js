
var express = require('express');
var app = express();
var fs = require("fs");
const axios = require('axios').default;
const cheerio = require('cheerio');
const util = require('util')
const request = require('request');
var parser = require('node-html-parser');
const url = "https://www.bvk.rs/kvarovi-na-mrezi/";
const { Expo } = require('expo-server-sdk')

let expo = new Expo({ accessToken: process.env.ACCESS_TOKEN });


function addressUrlBuilder(address) {

    //transliterate address to serbian latin
    const transliterate = require('transliteration').transliterate;





    let fullAddressDash = address
    //remove text after '–' if it exists
    if (fullAddressDash.indexOf('–') != -1) {
        fullAddressDash = fullAddressDash.substring(0, fullAddressDash.indexOf('–'))
    }
    const serbianLatinAddress = transliterate(fullAddressDash, { from: 'sr-Cyrl', to: 'serbian-latin' });
    //replace "dzh" with "dž" and "ch" with "č" and "tsh" with "ć" and "sh" with "š" and "dj" with "đ"
    const serbianLatinAddress2 = serbianLatinAddress.replace(/dzh/g, "dž").replace(/ch/g, "č").replace(/tsh/g, "ć").replace(/sh/g, "š").replace(/dj/g, "đ");
  
    const fullAddress = serbianLatinAddress2.trim() + ', Београд'




    const addressSplit = fullAddress.split(' ')
    const addressUrl = addressSplit.join('+')
    
    return ("http://www.google.com/maps/place/" + addressUrl + "/?hl=sr").trim()

}

function getCoordinateFromResponseBody(address) {
    return axios.get(encodeURI(addressUrlBuilder(address))).then(response => {
        let content = ''
        let root = parser.parse(response.data);

        root.querySelectorAll('meta').forEach(element => {

            if (element.getAttribute('property') == 'og:image' || element.getAttribute('itemprop') == 'image') {
              
                content = element.getAttribute('content').substring(element.getAttribute('content').indexOf("ll=") + 3)
            }
        })

        let coordinates = content.split(',')
       
    })
}



/*
:[
    neighbourhood::string,
    interval:
            [
                time:string,
                streets:[] 
            ]
        }    
]


*/

function getElectricalWorks(address) {
    return axios.get("http://www.epsdistribucija.rs/Dan_0_Iskljucenja.htm").then(response => {
        let content = new Array();
        let root = parser.parse(response.data);

        let table=root.querySelector('body > table:nth-child(2)');
        let check=false;

        let interval=[]
        let firstRow=table.childNodes.at(1)
        const streetList=firstRow.childNodes.at(2).text.split(', ');
        let previousName=firstRow.childNodes.at(0).text;
       interval.push({time:firstRow.childNodes.at(1).text,streets:streetList})



       table.childNodes.slice(2).forEach(element => {
            if(element.childNodes.at(0).text==previousName){
                const streetList=element.childNodes.at(2).text.split(', ');
                interval.push({time:element.childNodes.at(1).text,streets:streetList})
            }
            else{
                content.push({neighbourhood:previousName,interval:interval})
                previousName=element.childNodes.at(0).text;
                interval=[]
                const streetList=element.childNodes.at(2).text.split(', ');
                interval.push({time:element.childNodes.at(1).text,streets:streetList})
            }

// return last element
       })

      
        return {allData:content};
        })
    }

function getPlannedWorks(address) {
    return axios.get("https://www.bvk.rs/planirani-radovi/").then(response => {
        const returnValue = new Array()
        let content = ''
        let root = parser.parse(response.data);

        let divs = root.querySelectorAll('section.av_toggle_section > div');

        divs.forEach(element => {
            const title=element.firstChild.text
            element.firstChild.remove()
           
           returnValue.push({title:title,content:element.innerHTML})
        })
        return {allData:returnValue}
    })
}


function getPlumbingInfo() {
    return axios.get(url).then(response => {

        const returnValue = new Array()

        let root = parser.parse(response.data);

        let div = root.querySelector('.toggle_content');
        let child = div.getElementsByTagName('blockquote').at(0)

        let time = ''
        let streets = null

        while (child != null) {

            if (child.tagName == 'BLOCKQUOTE') {
                time = child.text.trim()
            }
            else if (child.tagName == 'UL') {
                const streetsArray = new Array();
                child.childNodes.forEach(element => {
                    if (element.text == '\n') {
                        return
                    }

                    const text = element.text

                    const splitText = text.split(':')

                    const neighbourhood = splitText.at(0)
                    const streets = splitText.at(1).trim()

                    const splitStreets = streets.split(',')
                    streetsArray.push({ neighbourhood: neighbourhood, streetList: splitStreets });
                })
                streets = streetsArray

                returnValue.push({ time: time.trim(), streets: streets })


            }
            child = child.nextElementSibling;
        }


        returnValue.map(element => {
            console.log(element.time + '\n')
            element.streets.map(street => {
                console.log(street.neighbourhood + '\n')
                street.streetList.map(ulica => {
                    console.log(ulica + '\n')
                })
            })
        })
        return returnValue 
    })
}


app.get('/vodovod/kvarovi', async function (req, res) {

    getPlumbingInfo()
        .then(data => {
            
            console.log(JSON.stringify(data))
            res.end(JSON.stringify(data));
        })
        .catch(err => console.log(err))
})


app.get('/vodovod/radovi', async function (req, res) {

    getPlannedWorks()
        .then(data => {
            console.log(JSON.stringify(data))
            res.end(JSON.stringify(data));
        })
        .catch(err => console.log(err))
})
app.get('/vodovod/coordinates', async function (req, res) {

    getCoordinateFromResponseBody(req.query.address)
        .then(data => {
            console.log(JSON.stringify(data))
            res.end(JSON.stringify(data));
        })
        .catch(err => console.log(err))
})
app.get('/struja/radovi', async function (req, res) {

    getElectricalWorks()
        .then(data => {
            console.log(JSON.stringify(data))
            res.end(JSON.stringify(data));
        })
        .catch(err => console.log(err))
})
app.get('/test', async function (req, res) {
    messages.push({
        to: process.env.MY_NOTIFICATION_TOKEN,
        sound: 'default',
        body: 'This is a test notification',
        data: { withSome: 'data' },
      })
   
})

const port = process.env.PORT || 3000;

app.set('port',port)
var server = app.listen(port, function () {
    var host = server.address().address
    var port = server.address().port



    console.log("Example app listening at http://%s:%s", host, port)
})