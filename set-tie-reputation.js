/*
    Manuaalselt ühekaupa reputatsiooni maliciouseks sättimine.
*/

require('dotenv').config()

const connectDXL = require('./src/dxl').connectDXL
const setTIEReputation = require('./src/dxl').setTIEReputation
const logger = require('./src/logger').logObject()
const argv = require('optimist')
    .usage('Usage: $0 --hashtype=MD5/SHA1/SHA256 --hash <hash>')
    .demand('hashtype', 'MD5/SHA1/SHA256')
    .demand('hash', 'The hash to be set')
    .argv

init()

async function init() {
    let dxlClient = undefined
    let dxlClients = undefined
    let tieClient = undefined

    try {
        dxlClients = await connectDXL()
            dxlClient = dxlClients.dxlClient
            tieClient = dxlClients.tieClient

        logger.info(`Setting ${argv.hashtype} - ${argv.hash} to malicious.`)
        await setTIEReputation(tieClient, { hashType: argv.hashtype, hash: argv.hash })
        logger.info(`Done`)
            dxlClient.destroy()

    } catch(err) {
        logger.error(`Fatal error occurred: ${new Error(err).message}`)
        process.exit(-1)
    }
}
