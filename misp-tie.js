require('dotenv').config()
const fs = require('fs')
const logger = require('./src/logger').logObject()
const connectDXL = require('./src/dxl')
const getAttributesFromMISP = require('./src/misp').getAttributesFromMISP
const argv = require('optimist').argv

let cacheFileName = 'cache.json'

init()

async function init() {
    let tieClient = undefined
    let hashesFromMISP = undefined
    let hashesFromCache = undefined
    let hashesFinalList = undefined

    try {
        logger.info(`Connecting to TIE/DXL...`)
            tieClient = await connectDXL()
        logger.info(`Loading cached hashes from previous run...`)
            hashesFromCache = await getHashesFromCache()
        logger.info(`Downloading hashes from MISP...`)
            if(!argv.noMISP) hashesFromMISP = await getHashesFromMISP()
        logger.info(`Comparing cached list with MISP list...`)
            hashesFinalList = await compareLists(hashesFromMISP, hashesFromCache)
    } catch(err) {
        logger.error(`Fatal error happened: ${new Error(err)}`)
        process.exit(-1)
    }
}

function compareLists(hashesFromMISP, hashesFromCache) {
    return new Promise(function(resolve, reject) {

        let result = {
            MD5: [],
            SHA1: [],
            SHA256: []
        }


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
                MD5: [... new Set(data[0])],
                SHA1: [... new Set(data[1])],
                SHA256: [... new Set(data[2])]
            }

            writeCacheContent(hashes)
            return resolve(hashes)

        })
    })
}

function getHashesFromCache() {
    return new Promise(function(resolve, reject) {

        const getCacheContent = function() { 
            try {
                return JSON.parse(fs.readFileSync(cacheFileName).toString())
            } catch(err) {
                logger.warn(`${new Error(err).message}`)
                return {
                    MD5: [],
                    SHA1: [],
                    SHA256: []
                }
            }
        }

        return resolve(getCacheContent())
    })
}
