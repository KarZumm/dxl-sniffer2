require('dotenv').config()
const vt = require('./src/virustotal')
const fs = require('fs')

/* 8739c76e681f900923b900c9df0ef75cf421d39cabb54650c4b9ad19b6a76d85 */ 

vt('8739c76e681f900923b900c9df0ef75cf421d39cabb54650c4b9ad19b6a76d85').then(res => {
    fs.writeFileSync('vtotalreply.json', JSON.stringify(res, null, 2))
}).catch(console.error)



/*
require('dotenv').config()
const connectDXL = require('./src/dxl').connectDXL
const setTIEReputation = require('./src/dxl').setTIEReputation
const logger = require('./src/logger').logObject()

init()

async function init() {
    try {
        let dxlClients = await connectDXL()
        let dxlClient = dxlClients.dxlClient
        let tieClient = dxlClients.tieClient

        dxlClient.destroy()

        console.log(tieClient)

    } catch(err) {
        console.error(err)
    }
}


/*
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
*/
