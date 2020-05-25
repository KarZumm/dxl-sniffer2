const Dxl = require('@opendxl/dxl-client')
const TieClient = require('@opendxl/dxl-tie-client').TieClient
const hashTypes = require('@opendxl/dxl-tie-client').HashType

function connectDXL() {
    return new Promise(function(resolve, reject) {

        try {
            const dxlClient = new Dxl.Client(Dxl.Config.createDxlConfigFromFile(process.env['DXLCONFIGFILE']))

            dxlClient.connect(() => {
                let tieClient = new TieClient(dxlClient)
                logger.info(`Connected to DXL.`)
                resolve({tieClient, dxlClient})
            })
        }
        catch(err) {
            reject(err)
        }

    })
}

function setTIEReputation(tieClient, hashToSet) {
    return new Promise(function(resolve, reject) {

        let hashes = {}
            hashes[hashTypes.MD5] = ''
            hashes[hashTypes.SHA1] = ''
            hashes[hashTypes.SHA256] = ''
            hashes[hashToSet.hashType] = hashToSet.hash

        tieClient.setFileReputation(err => {
            if(err) return reject(err)
            return resolve(`TIE Reputation successfully set for `)
        }, 1, hashes, '', 'Reputation Set via dxl-sniffer')
    })
}

module.exports = { connectDXL, setTIEReputation }
