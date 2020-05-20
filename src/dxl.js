const Dxl = require('@opendxl/dxl-client')
const TieClient = require('@opendxl/dxl-tie-client').TieClient

function connectDXL() {
    return new Promise(function(resolve, reject) {

        try {
            const dxlClient = new Dxl.Client(Dxl.Config.createDxlConfigFromFile(process.env['DXLCONFIGFILE']))

            dxlClient.connect(() => {
                let tieClient = new TieClient(dxlClient)
                logger.info(`Connected to DXL.`)
                resolve(tieClient)
            })
        }
        catch(err) {
            reject(err)
        }

    })
}

module.exports = connectDXL
