require('dotenv').config()
const connectDXL = require('./src/dxl').connectDXL
const setTIEReputation = require('./src/dxl').setTIEReputation

init()

async function init() {
let tieClient = undefined
let hashToTIE = {
    hashType: 'MD5',
    hash: '1c8a1aa75d514d9b1c7118458e0b8a14'
}

    try {
        tieClient = await connectDXL()
        console.log(await setTIEReputation(tieClient, hashToTIE))
    }
    catch(err) {
        throw err
    }
}
