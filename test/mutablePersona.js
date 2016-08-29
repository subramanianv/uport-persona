import {assert} from 'chai'
import MutablePersona from '../src/mutablePersona.js'
import Persona from '../src/persona.js'
import testData from './testData.json'

describe('MutablePersona', function () {
  this.timeout(30000)

  let persona, claim

  it('Adds profile as self signed claims', (done) => {
    persona = new MutablePersona('myAddress', null, null)
    const tokens = Object.keys(testData.profile).map(attrName => {
      const attribute = {}
      attribute[attrName] = testData.profile[attrName]

      return persona.addAttribute(attribute, testData.privSignKey1)
    })
    persona.setPublicSigningKey(testData.privSignKey1)
    persona.getAllClaims().forEach((token) => {
      assert.isTrue(Persona.isTokenValid(token), 'Should not generate invalid tokens.')
    })
    const pubSignKey = persona.getPublicSigningKey()
    assert.equal(Persona.privateKeyToPublicKey(testData.privSignKey1), pubSignKey)
    done()
  })

  it('Adds attribute correctly and updates registry', (done) => {
    // Add a new self signed attribute
    const key = Object.keys(testData.additionalAttribute)[0]
    persona.addAttribute(testData.additionalAttribute, testData.privSignKey1)
    const tokens = persona.getClaims(key)
    assert.equal(tokens.length, 1, 'Only one token should have been added.')
    assert.isTrue(Persona.isTokenValid(tokens[0]))
    var p = persona.getProfile()
    delete p.pubSignKey
    delete p.pubEncKey
    assert(p[key], testData.additionalAttribute[key], 'New attribute should be present')
    delete p[key]
    assert.deepEqual(p, testData.profile)
    done()
  })

  it('Adds claim correctly', (done) => {
    // Add standalone claim
    const key = Object.keys(testData.additionalAttribute)[0]
    claim = persona.signAttribute(testData.additionalAttribute, testData.privSignKey2)
    persona.addClaim(claim)
    const tokens = persona.getClaims(key)
    assert.equal(tokens.length, 2, 'There should be 2 tokens added.')
    assert.isTrue(Persona.isTokenValid(tokens[0]))
    assert.isTrue(Persona.isTokenValid(tokens[1]))
    done()
  })

  it('Reject invalid claim', (done) => {
    let claimAdded = true
    assert.throws(persona.addClaim.bind(null, testData.invalidClaim[0]), 'Token containing claim is invalid, and thus not added.')
    done()
  })

  it('Adds claims correctly', (done) => {
    const claimList = [claim, claim, claim]
    const key = Object.keys(testData.additionalAttribute)[0]
    persona.addClaims(claimList)
    const tokens = persona.getClaims(key)
    assert.equal(tokens.length, 5, 'There should be 2 tokens added.')
    assert.isTrue(Persona.isTokenValid(tokens[0]))
    assert.isTrue(Persona.isTokenValid(tokens[1]))
    assert.isTrue(Persona.isTokenValid(tokens[2]))
    assert.isTrue(Persona.isTokenValid(tokens[3]))
    assert.isTrue(Persona.isTokenValid(tokens[4]))
    done()
  })

  it('Reject invalid claim in list of claims', (done) => {
    let claimAdded
    const claimList = [claim, testData.invalidClaim[0], claim]
    assert.throws(persona.addClaims.bind(persona, claimList), 'Token containing claim is invalid, and thus not added.')
    done()
  })

  it('Throw error if tyring to remove claims that does not exist', (done) => {
    assert.throws(persona.removeClaim.bind(persona, testData.validClaim), 'No such token associated with this persona.')
    done()
  })

  it('Remove claim correctly', (done) => {
    persona.addClaim(testData.validClaim)
    assert.notEqual(persona.getAllClaims().indexOf(testData.validClaim), -1)
    persona.removeClaim(testData.validClaim)
    assert.equal(persona.getAllClaims().indexOf(testData.validClaim), -1)
    done()
  })

  it('Replaces attribute correctly', (done) => {
    // replacing an attribute that has two attestations should remove
    // the two old attestations.
    // In this test we raplace the additionalAttribute.
    const key = Object.keys(testData.additionalAttribute)[0]
    persona.replaceAttribute(testData.replacementAttribute, testData.privSignKey1)
    var tokens = persona.getClaims(key)
    assert.equal(tokens.length, 1, 'Only one token should be present.')
    assert.isTrue(Persona.isTokenValid(tokens[0]))
    const p = persona.getProfile()
    delete p.pubSignKey
    delete p.pubEncKey
    assert(p[key], testData.replacementAttribute[key], 'New attribute should be present')
    delete p[key]
    assert.deepEqual(p, testData.profile)
    done()
  })

  it('Removes attribute correctly', (done) => {
    const attrName = Object.keys(testData.additionalAttribute)[0]
    persona.removeAttribute(attrName, testData.privSignKey1)
    const tokens = persona.getClaims(attrName)
    assert.equal(tokens.length, 0, 'No token should be present.')
    var p = persona.getProfile()
    delete p.pubSignKey
    delete p.pubEncKey
    assert.deepEqual(p, testData.profile)
    done()
  })
})
