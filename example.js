// Example persona profile read
// 
// node example.js

var Persona = require('./dist/persona.js')
var Web3 = require('web3')
var ipfsApi = require('ipfs-api')

var myAddr = '0xb66c8fdb7496feb8fc188ebc6c93aae9e7ec46a3'

var web3 = new Web3();
var web3Prov = new web3.providers.HttpProvider('https://consensysnet.infura.io:8545');
var ipfsProv = ipfsApi('localhost', 5001);

var persona = new Persona(myAddr);
persona.setProviders(ipfsProv, web3Prov);

persona.load().then(() => {
  console.log(persona.getProfile())
});
