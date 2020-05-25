/*
    kuulab DXL siini peal /mcafee/event/epo/threat/response kanalit ja trükib sinna peale tulnud sõnumi välja.
*/

require('dotenv').config()

const connectDXL = require('./src/dxl').connectDXL
const logger = require('./src/logger').logObject()

let topicToSubscribeTo = '/mcafee/event/epo/threat/response'

init()

async function init() {
    let dxlClient = undefined
    let dxlClients = undefined

    try {
        logger.info(`Connecting to DXL...`)
        dxlClients = await connectDXL()
            dxlClient = dxlClients.dxlClient
        logger.info(`Subscribing to ${topicToSubscribeTo}`)
            dxlClient.addEventCallback(topicToSubscribeTo, processMessage)

    } 
    catch(err) {
        logger.error(`Fatal error occurred: ${new Error(err).message}`)
        process.exit(-1)
    }
}

function processMessage(event) {
    console.log(JSON.stringify(event, null, 4))
}