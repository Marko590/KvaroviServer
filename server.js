
var express = require('express');
var app = express();
var fs = require("fs");
const axios = require('axios').default;
const cheerio = require('cheerio');
const util = require('util')
const request = require('request');
var parser = require('node-html-parser');
const url = "https://www.bvk.rs/kvarovi-na-mrezi/";



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
    console.log(serbianLatinAddress2)
    const fullAddress = serbianLatinAddress2.trim() + ', Београд'




    const addressSplit = fullAddress.split(' ')
    const addressUrl = addressSplit.join('+')
    console.log("https://www.google.com/maps/place/" + addressUrl)
    return ("http://www.google.com/maps/place/" + addressUrl + "/?hl=sr").trim()

}

function getCoordinateFromResponseBody(address) {
    return axios.get(encodeURI(addressUrlBuilder(address))).then(response => {
        let content = ''
        let root = parser.parse(response.data);

        root.querySelectorAll('meta').forEach(element => {

            if (element.getAttribute('property') == 'og:image' || element.getAttribute('itemprop') == 'image') {
                console.log("\n\n\n" + element.outerHTML + "\n\n\n");
                content = element.getAttribute('content').substring(element.getAttribute('content').indexOf("ll=") + 3)
            }
        })

        let coordinates = content.split(',')
        return { latitude: coordinates.at(0), longitude: coordinates.at(1) }
    })
}

function axiosTest() {
    return axios.get(url).then(response => {

        const returnValue = new Array()

        let root = parser.parse(response.data);

        let div = root.querySelector('.toggle_content');
        let child = div.getElementsByTagName('blockquote').at(0)

        let time = ''
        let streets = null

        while (child != null) {

            if (child.tagName == 'BLOCKQUOTE') {
                time = child.text
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

                returnValue.push({ time: time, streets: streets })


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
        return { allData: returnValue }
    })
}


app.get('/vodovod/kvarovi', async function (req, res) {

    axiosTest()
        .then(data => {

            res.end(JSON.stringify(data));
        })
        .catch(err => console.log(err))
})


app.get('/vodovod/radovi', async function (req, res) {

    getCoordinateFromResponseBody(req.query.address)
        .then(data => {
            console.log(data)
            res.end(JSON.stringify(data));
        })
        .catch(err => console.log(err))
})

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port



    console.log("Example app listening at http://%s:%s", host, port)
})