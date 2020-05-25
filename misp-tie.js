require('dotenv').config()
    let cacheFileName = process.env['CACHEFILE'] || 'cache.json'
    let runIntervalHours = process.env['RUNINTERVALHOURS'] || 1

const fs = require('fs')
const logger = require('./src/logger').logObject()
const connectDXL = require('./src/dxl').connectDXL
const setTIEReputation = require('./src/dxl').setTIEReputation
const getAttributesFromMISP = require('./src/misp').getAttributesFromMISP
const argv = require('optimist')
    .usage('Synchronize hashes from MISP to TIE enterprise security known malicious.\n$0')
    .describe('noMISP', 'Do not connect to MISP to get new hashes')
    .describe('IamFuckingSure', 'This is the override for actually setting the reputation in TIE. If not present it will only play out what would be done.')
    .describe('killCache', 'Ignores cache data and rewrites it')
    .argv

init()

setInterval(() => {
    init()
}, runIntervalHours * 3600000);

async function init() {
    let dxlClients = undefined
    let tieClient = undefined
    let dxlClient = undefined
    let hashesFromMISP = undefined
    let hashesFromCache = undefined
    let hashesFinalList = undefined

    try {
        logger.info(`Connecting to TIE/DXL...`)
            dxlClients = await connectDXL()
                tieClient = dxlClients.tieClient
                dxlClient = dxlClients.dxlClient
        logger.info(`Loading cached hashes from previous run...`)
            hashesFromCache = await getHashesFromCache()
        logger.info(`Downloading hashes from MISP...`)
            if(!argv.noMISP) hashesFromMISP = await getHashesFromMISP()
        logger.info(`Comparing cached list with MISP list...`)
            hashesFinalList = await compareLists(hashesFromMISP, hashesFromCache)
                logger.info(`Count of new MD5 hashes: ${hashesFinalList['MD5'].length}`)
                logger.info(`Count of new SHA1 hashes: ${hashesFinalList['SHA1'].length}`)
                logger.info(`Count of new SHA256 hashes: ${hashesFinalList['SHA256'].length}`)
        logger.info(`Setting the TIE Reputations...`)
            await setTIEReputations(tieClient, hashesFinalList)

        logger.info(`Disconnecting from DXL...`)
            dxlClient.destroy()
        logger.info(`Sleeping for ${runIntervalHours} hours...`)

    } catch(err) {
        logger.error(`Fatal error happened: ${new Error(err)}`)
        process.exit(-1)
    }
}

async function setTIEReputations(tieClient, hashesFinalList) {

    for(hashType in hashesFinalList)
        for(hash of hashesFinalList[hashType]) {
            try {
                if(argv.IamFuckingSure) {
                    await setTIEReputation(tieClient, { hashType, hash } )
                    logger.info(`TIE Reputation for ${hash} set to known malicious`)
                } else {
                    logger.warn(`Would set TIE Reputation for ${hash} set to known malicious`)
                }
            }
            catch(err) {
                logger.error(`TIE Reputation Set error: ${new Error(err).message}`)
            }
        }
}

function compareLists(hashesFromMISP, hashesFromCache) {
    return new Promise(function(resolve, reject) {

        if(!hashesFromMISP) return resolve(hashesFromCache)

        const compareArrays = function(hashTypesToCompare) {

            const isSetsEqual = (a, b) => a.size === b.size

            let inputSeta = new Set(hashesFromMISP[hashTypesToCompare])
            let inputSetb = new Set(hashesFromCache[hashTypesToCompare])
            let resultArray = []
        
                if(isSetsEqual(inputSeta, inputSetb)) return []
        
                for(el of inputSeta) {
                    if (!inputSetb.has(el)) resultArray.push(el)
                } 
            return resultArray
        }

        return resolve({
            MD5: compareArrays('MD5'),
            SHA1: compareArrays('SHA1'),
            SHA256: compareArrays('SHA256')
        })

    })
}

function getHashesFromMISP() {
    return new Promise(function(resolve, reject) {
        Promise.all([getAttributesFromMISP('md5'), getAttributesFromMISP('sha1'), getAttributesFromMISP('sha256')]).then(data => {

            const writeCacheContent = function(data) {
                try {
                    logger.info(`Writing out cachefile: ${cacheFileName}`)
                    fs.writeFileSync(cacheFileName, JSON.stringify(data, null, 4))
                } catch(err) {
                    logger.warn(`Unable to write file to cache with error of: ${new Error(err).message}`)
                }
            }

            let hashes = {
                MD5: [... new Set(data[0])].filter(el => { return el != '' }),
                SHA1: [... new Set(data[1])].filter(el => { return el != '' }),
                SHA256: [... new Set(data[2])].filter(el => { return el != '' })
            }

            writeCacheContent(hashes)
            return resolve(hashes)

        }).catch(reject)
    })
}

function getHashesFromCache() {
    return new Promise(function(resolve, reject) {

        const getEmptyCache = function() {
            return {
                MD5: [],
                SHA1: [],
                SHA256: []
            }
        }

        const getCacheContent = function() { 
            try {
                if(argv.killCache) {
                    logger.warn(`Ignoring current cached content`)
                    return getEmptyCache()
                } else {
                    return JSON.parse(fs.readFileSync(cacheFileName).toString())
                }
            } catch(err) {
                logger.warn(`${new Error(err).message}`)
                return getEmptyCache()
            }
        }

        return resolve(getCacheContent())
    })
}
