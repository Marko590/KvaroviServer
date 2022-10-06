

function electricalNumberString(number) {
    let returnValue = "Број кварова на електричној мрежи: " + number
    return returnValue
}

function plumbingNumberString(number) {
    let returnValue = "Број кварова на водоводној мрежи: " + number
    return returnValue
}

// Build the url that will be used to fetch the coordinates.
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

module.exports={electricalNumberString,plumbingNumberString,addressUrlBuilder}