require('dotenv').config()
const logger = require('./src/logger').logObject()
const connectDXL = require('./src/dxl').connectDXL
const setTIEReputation = require('./src/dxl').setTIEReputation

init()

async function init() {
let tieClient = undefined
let hashToTIE = {
    hashType: 'MD5',
    hash: '1c8a1aa75d514d9b1c7118458e0b8a14'
}

    try {
        tieClient = await connectDXL()
        console.log(await setTIEReputation(tieClient, hashToTIE))
    }
    catch(err) {
        throw err
    }
}




/*
let array1 = ['a', 'b', 'c', 'd', 'e', 'f']
let array2 = ['a', 'b', 'c', 'e', 'd']

function compareArrays(a, b) {
    const isSetsEqual = (a, b) => a.size === b.size

    let inputSeta = new Set(a)
    let inputSetb = new Set(b)
    let resultArray = []

        if(isSetsEqual(inputSeta, inputSetb)) return []

        for(el of inputSeta) {
            if (!inputSetb.has(el)) resultArray.push(el)
        } 
    return resultArray
}



console.log(compareArrays(array1, array2))

*/