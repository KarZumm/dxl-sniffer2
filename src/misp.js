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

module.exports = searchMISP
