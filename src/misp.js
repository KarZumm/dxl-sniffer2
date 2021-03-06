const https = require('https')

function searchMISP(searchItem) {
    return new Promise(function(resolve, reject) {
        var options = {
            "method": "POST",
            "hostname": process.env['MISPADDRESS'],
            "path": '/attributes/restSearch/json',
            "headers": {
              "Authorization": process.env['MISPAPIKEY'],
              "Accept": 'application/json',
              "Content-Type": 'application/json',
              'returnFormat': 'json',
          }
        }

        var req = https.request(options, function (res) {

            var chunks = []

            res.on("data", function (chunk) {
              chunks.push(chunk)
            })

            res.on("end", function () {
                req.end()
                return resolve(Buffer.concat(chunks).toString().split('\n'))
            })
          })

          req.on("error", function(err) {
              return reject(err)
          }) 

          req.write(JSON.stringify({
              value: searchItem
          }))
          req.end()
    })
}

function getAttributesFromMISP(attribute) {
    return new Promise(function(resolve, reject) {
        var options = {
            "method": "GET",
            "hostname": process.env['MISPADDRESS'],
            "path": '/attributes/text/download/' + attribute,
            "headers": {
              "Authorization": process.env['MISPAPIKEY'],
              "Accept": 'application/json',
              "Content-Type": 'application/json',
              'returnFormat': 'json',
          }
        }
        logger.info(`Starting download from: ${options.hostname}${options.path}`)

          var req = https.request(options, function (res) {

            var chunks = []

            res.on("data", function (chunk) {
              chunks.push(chunk)
            })

            res.on("end", function () {
                req.end()
                logger.info(`Download from: ${options.hostname}${options.path} completed.`)
                return resolve(Buffer.concat(chunks).toString().split('\n'))
            })
          })

          req.end()
    })
}

/*

[
  [
    "{\"response\": 
      {\"Attribute\": []
      }
    }",
  ""],
  ["{\"response\": 
    {\"Attribute\": []
  }
}",""],["{\"response\": {\"Attribute\": []}}",""]]

*/

function parseMISPSearchResults(result) {
let parsedResult = []

  for(resultSet of result) {

    let resultArray = resultSet.filter(el => {
      if(el === '') return false
        try {
          el = JSON.parse(el)
            if(el.response.Attribute.length === 0) return false
          parsedResult.push(el)
        } 
        catch(err) {
          return false
        }
    })
  }

return parsedResult
}

module.exports = { searchMISP, getAttributesFromMISP, parseMISPSearchResults }
