const https = require('https')

module.exports = hash => {
    return new Promise(function(resolve, reject) {
        var options = {
            "method": "GET",
            "hostname": "www.virustotal.com",
            "path": `/api/v3/files/${hash}`,
            "headers": {
              "x-apikey": process.env['VTAPIKEY'],
          }
        }

        var req = https.request(options, function (res) {

            var chunks = []

            res.on("data", function (chunk) {
              chunks.push(chunk)
            })

            res.on("end", function () {
                req.end()
                return resolve(JSON.parse(Buffer.concat(chunks).toString().split('\n').join('')))
            })
          })

          req.on("error", function(err) {
              return reject(err)
          }) 

        req.end()
    })
}