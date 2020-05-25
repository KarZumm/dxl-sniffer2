/*
    MAR Search
*/

require('dotenv').config()

const connectMAR = require('./src/dxl').connectMAR
const logger = require('./src/logger').logObject()

/*
const argv = require('optimist')
    .usage('Usage: $0 --hashtype=MD5/SHA1/SHA256 --hash <hash>')
    .demand('hashtype', 'MD5/SHA1/SHA256')
    .demand('hash', 'The hash to be set')
    .argv
*/

init()

async function init() {
    let dxlClient = undefined
    let dxlClients = undefined
    let marClient = undefined

    try {
        dxlClients = await connectMAR()
            dxlClient = dxlClients.dxlClient
            marClient = dxlClients.marClient

            marClient.search(
                [{
                  name: 'Processes',
                  outputs: ['name', 'id']
                }],
                {
                  or: [{
                    and: [{
                      name: 'Processes',
                      output: 'name',
                      op: 'EQUALS',
                      value: 'csrss'
                    },
                    {
                      name: 'Processes',
                      output: 'name',
                      op: 'CONTAINS',
                      value: 'exe'
                    }]
                  },
                  {
                    and: [{
                      name: 'Processes',
                      output: 'size',
                      op: 'GREATER_THAN',
                      value: '200',
                      negated: 'true'
                    }]
                  }]
                },
                function (searchError, resultContext) {
                  if (resultContext && resultContext.hasResults) {
                    console.log(resultContext)
                  } else {
                    console.error(searchError)
                  }
                }
              )


//            dxlClient.destroy()

    } catch(err) {
        logger.error(`Fatal error occurred: ${new Error(err).message}`)
        process.exit(-1)
    }
}
