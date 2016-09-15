// Example persona profile read
//
// node example.js

let Persona = require('./dist/persona.js')
let Web3 = require('web3')
let ipfsApi = require('ipfs-api')

let myAddr = '0xb66c8fdb7496feb8fc188ebc6c93aae9e7ec46a3'

let web3 = new Web3()
let web3Prov = new web3.providers.HttpProvider('https://consensysnet.infura.io:8545')
let ipfsProv = ipfsApi('localhost', 5001)

let persona = new Persona(myAddr, ipfsProv, web3Prov)

persona.load().then(() => {
  console.log(persona.getProfile())
})
