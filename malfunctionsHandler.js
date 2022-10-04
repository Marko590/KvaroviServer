const axios = require('axios').default;

var parser = require('node-html-parser');

const formattingHandler=require('./formattingHandler.js')


// Calculate number of plumbing malfunctions in the chosen area.
async function getPlumbingInfo() {
    let response = await axios.get("https://www.bvk.rs/kvarovi-na-mrezi/")

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

}
async function numberOfPlumbingAlerts(neighbourhood) {
    try {
        let data = await getPlumbingInfo()
        let counter = 0
        data.forEach(time => {
            time.streets.forEach(area => {
                if (area.neighbourhood === neighbourhood) {
                    counter += area.streetList.length
                }
            })
        })
        return counter
    } catch {
        return 0
    }
}
// Fetch the planned plumbing works.

async function getPlannedWorks(address) {
    let response = await axios.get("https://www.bvk.rs/planirani-radovi/")
    const returnValue = new Array()
    let root = parser.parse(response.data);

    let divs = root.querySelectorAll('section.av_toggle_section > div');

    divs.forEach(element => {
        const title = element.firstChild.text
        element.firstChild.remove()

        returnValue.push({ title: title, content: element.innerHTML })
    })
    return { allData: returnValue }
}

// Fetch electrical malfunctions from the page.
async function getElectricalWorks(address) {
    let response = await axios.get("http://www.epsdistribucija.rs/Dan_0_Iskljucenja.htm")
    let content = new Array();
    let root = parser.parse(response.data);

    let table = root.querySelector('body > table:nth-child(2)');
    let check = false;

    let interval = []
    let firstRow = table.childNodes.at(1)
    const streetList = firstRow.childNodes.at(2).text.split(', ');
    let previousName = firstRow.childNodes.at(0).text;
    interval.push({ time: firstRow.childNodes.at(1).text, streets: streetList })

    table.childNodes.slice(2).forEach(element => {
        if (element.childNodes.at(0).text == previousName) {
            const streetList = element.childNodes.at(2).text.split(', ');
            interval.push({ time: element.childNodes.at(1).text, streets: streetList })
        }
        else {
            content.push({ neighbourhood: previousName, interval: interval })
            previousName = element.childNodes.at(0).text;
            interval = []
            const streetList = element.childNodes.at(2).text.split(', ');
            interval.push({ time: element.childNodes.at(1).text, streets: streetList })
        }
        // return last element
    })
    return { allData: content };
}

// Calculate number of electrical malfunctions in the chosen area.
async function numberOfElectricalAlerts(neighbourhood) {
    let data = await getElectricalWorks()
    try {
        var chosenArea = 0
        data.allData.forEach(area => {
            console.log(area)
            if (area.neighbourhood === neighbourhood) {
                chosenArea = area
            }
        })
        console.log(chosenArea)
        let counter = 0
        chosenArea.interval.forEach(time => {
            counter = counter + time.streets.length
        })
        return counter
    } catch {
        return 0
    }
}

// Parse the response from the Google Maps URL and extract the coordinates
function getCoordinateFromResponseBody(address) {
    return axios.get(encodeURI(formattingHandler.addressUrlBuilder(address))).then(response => {
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

module.exports={getPlumbingInfo,numberOfElectricalAlerts,numberOfPlumbingAlerts,getElectricalWorks,getPlannedWorks,getCoordinateFromResponseBody}