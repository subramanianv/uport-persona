import {assert} from 'chai';
import MutablePersona from '../lib/mutablePersona.js';
import {ECPair} from 'bitcoinjs-lib';
import bigi from 'bigi';;
import ipfs from 'ipfs-js';
import ipfsApi from 'ipfs-api';
import Web3 from 'web3';
import pudding from 'ether-pudding';
const web3 = new Web3();
pudding.setWeb3(web3);

const web3Prov = new web3.providers.HttpProvider('http://localhost:8545');
const ipfsProv = ipfsApi('localhost', 5001);
web3.setProvider(web3Prov);
ipfs.setProvider(ipfsProv);

// Setup for deployment of a new uport registry
let UportRegistry = require("uport-registry/environments/development/contracts/UportRegistry.sol.js").load(pudding);
UportRegistry = pudding.whisk({binary: UportRegistry.binary, abi: UportRegistry.abi})


describe("Persona", function () {
  this.timeout(30000);

  let persona, claim, registryAddress;
  let accounts = web3.eth.accounts;

  it("Correctly verifies tokens", (done) => {
    let persona = new MutablePersona("address")
    //console.log(persona)
    persona.saveAttributes()
    //assert.isTrue(Persona.isTokenValid(testData.validToken));
    //testData.invalidTokens.forEach((token) => {
      //assert.isFalse(Persona.isTokenValid(token));
    //});
    done();
  });
});

