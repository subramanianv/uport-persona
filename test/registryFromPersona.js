import {assert} from 'chai'
import MutablePersona from '../lib/mutablePersona.js'
import Persona from '../lib/persona.js'
import ipfsApi from 'ipfs-api'
import Web3 from 'web3'
import pudding from 'ether-pudding'
const web3 = new Web3()
pudding.setWeb3(web3)

const web3Prov = new web3.providers.HttpProvider('http://localhost:8545')
const ipfsProv = ipfsApi('localhost', 5001)
web3.setProvider(web3Prov)

// Setup for deployment of a new uport registry
let UportRegistry = require('uport-registry/environments/development/contracts/UportRegistry.sol.js').load(pudding)
UportRegistry = pudding.whisk({binary: UportRegistry.binary, abi: UportRegistry.abi})

import testData from './testData.json'

describe('Read and write to registry from Persona and MutablePersona', function () {
  this.timeout(30000)

  let persona, mutablePersona, registryAddress
  let accounts = web3.eth.accounts

  it('Creates a persona object', (done) => {
    UportRegistry.new(accounts[0], {from: accounts[0]}).then((uportReg) => {
      registryAddress = uportReg.address
      mutablePersona = new MutablePersona(accounts[0], ipfsProv, web3Prov, registryAddress)
      assert.equal(mutablePersona.address, accounts[0])
      done()
    }).catch(done)
  })

  it('Write profile to registry', (done) => {
    const tokens = Object.keys(testData.profile).map(attrName => {
      const attribute = {}
      attribute[attrName] = testData.profile[attrName]

      return mutablePersona.addAttribute(attribute, testData.privSignKey1)
    })
    mutablePersona.setPublicSigningKey(testData.privSignKey1)
    mutablePersona.writeToRegistry().then((txHash) => {
      done()
    })
  })

  it('Correctly loads tokenRecords from uport registry', (done) => {
    var tmpRecords = mutablePersona.getAllClaims()
    persona = new Persona(accounts[0], ipfsProv, web3Prov, registryAddress)
    persona.load().then(() => {
      assert.deepEqual(tmpRecords, persona.getAllClaims())
      done()
    }).catch(done)
  })
})
