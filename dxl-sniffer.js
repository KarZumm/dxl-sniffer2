require('dotenv').config()

const fs = require('fs')
const connectDXL = require('./src/dxl').connectDXL
const logger = require('./src/logger').logObject()
const searchMISP = require('./src/misp').searchMISP
const parseMISPSearchResults = require('./src/misp').parseMISPSearchResults
const vtQuery = require('./src/virustotal')

// console.log(parseMISPSearchResults([["{\"response\": {\"Attribute\": []}}",""],["{\"response\": {\"Attribute\": []}}",""],["{\"response\": {\"Attribute\": []}}",""]]))

init()

async function init() {
    let dxlClients = undefined
    let tieClient = undefined
    let dxlClient = undefined

    try {
        logger.info(`Connecting to DXL/TIE...`)
            dxlClients = await connectDXL()
                tieClient = dxlClients.tieClient
                dxlClient = dxlClients.dxlClient
        logger.info(`Adding Callback for: addFileFirstInstanceCallback...`)
            tieClient.addFileFirstInstanceCallback(processMessage)

    } catch(err) {
        logger.error(`Fatal error has occurred: ${new Error(err).message}`)
        process.exit(-1)
    }
}

/* {
    "agentGuid": "{68125cd6-a5d8-11e6-348e-000c29663178}",
    "hashes": {
        "md5": "31dbe8cc443d2ca7fd236ac00a52fb17",
        "sha1": "2d6ca45061b7972312e00e5933fdff95bb90b61b",
        "sha256": "aa3c461d4c21a392e372d0d6ca4ceb1e4d88098d587659454eaf4d93c661880f"
    },
    "name": "MORPH.EXE"
} */

function processMessage(obj, originalEvent) {

    logger.info(`New file detected: ${obj.hashes.name}. MD5: ${obj.hashes.md5}, SHA1: ${obj.hashes.sha1}, SHA256: ${obj.hashes.sha256}`)

    Promise.all([searchMISP(obj.hashes.md5), searchMISP(obj.hashes.sha1), searchMISP(obj.hashes.sha256)]).then(MISPResult => {

        vtQuery(obj.hashes.sha256).then(vtResult => {
            logger.info(`MISP Result: ${obj.name}. MD5: ${obj.hashes.md5}, SHA1: ${obj.hashes.sha1}, SHA256: ${obj.hashes.sha256}`)
                if(parseMISPSearchResults(MISPResult).length === 0) logger.info(`MISP Does not know anything about this one.`)
            logger.info(`${JSON.stringify(MISPResult)}`)
            appendToFile('./logs/logfile.log', obj)
            appendToFile('./logs/logfile.log', MISPResult)

                if(vtResult.data.attributes.last_analysis_stats.malicious >= 10) logger.info(`Virustotal says that this has been detected by more than 10 engines.`)

            appendToFile('./logs/logfile.log', vtResult)

        })


    })

}

/* abifunktsioonid */

const appendToFile = function(fileName, data) {
    try {
        fs.appendFileSync(fileName, JSON.stringify(data, null, 4))
    } catch(err) {
        logger.warn(`Error writing to ${fileName} because ${new Error(err).message}`)
    }
}
