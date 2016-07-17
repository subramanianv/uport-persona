var bigi = require('bigi');
var bsProfiles = require('blockstack-profiles');
var Promise = require('bluebird');
var bitcoinjsLib = require('bitcoinjs-lib');
var uportRegistry = require('uport-registry');

const REGISTRY_ADDRESS = "0xa9be82e93628abaac5ab557a9b3b02f711c0151c";

function matchesAttributeName(attrName, token) {
  return Object.keys(token.decodedToken.payload.claim)[0] === attrName;
}

function notMatchesAttributeName(attrName, token) {
  return Object.keys(token.decodedToken.payload.claim)[0] !== attrName;
}

class Persona {
  constructor(proxyAddress, registryAddress) {
    this.address = proxyAddress;
    this.tokenRecords = [];
    if (registryAddress) {
      this.registryAddress = registryAddress;
    } else {
      this.registryAddress = REGISTRY_ADDRESS;
    }
  }

  setProviders(ipfsProvider, web3Provider) {
    uportRegistry.setIpfsProvider(ipfsProvider);
    uportRegistry.setWeb3Provider(web3Provider);
  }

  loadAttributes() {
    return uportRegistry.getAttributes(this.registryAddress, this.address);
  }

  saveAttributes() {
    return uportRegistry.setAttributes(this.registryAddress, this.tokenRecords, {from: this.address})
  }

  load() {
    return new Promise((accept, reject) => {
      this.loadAttributes().then((tokens) => {
        this.tokenRecords = tokens;
        accept(tokens);
      }).catch(reject);
    });
  }

  setProfile(profile, privSignKey) {
    var tokens = Object.keys(profile).map(function (attr_name) {
      var attribute = {};
      attribute[attr_name] = profile[attr_name];

      return this.signAttribute(attribute, privSignKey, this.address);
    }.bind(this));
    this.tokenRecords = tokens;
    var pubSignKey = Persona.privateKeyToPublicKey(privSignKey);
    this.tokenRecords.push(this.signAttribute({"pubSignKey": pubSignKey}, privSignKey, this.address));
    return this.saveAttributes();
  }

  getProfile() {
    // When encryption is implemented this will only give
    // you the part of the profile you have access to.
    var profile = {}

    this.tokenRecords.map((tokenRecord) => {
      var decodedToken = null
      try {
        decodedToken = bsProfiles.verifyTokenRecord(tokenRecord, tokenRecord.decodedToken.payload.issuer.publicKey);
      } catch (e) {
        throw new Error('decodedToken failed: ' + e);
      }

      if (decodedToken !== null) {
        profile = Object.assign({}, profile, decodedToken.payload.claim)
      }
    });
    return profile;
  }

  getPublicSigningKey() {
    return this.getClaims("pubSignKey")[0].decodedToken.payload.claim.pubSignKey;
  }

  getPublicEncryptionKey() {
    return this.getClaims("pubEncKey")[0].decodedToken.payload.claim.pubEncKey;
  }

  getAllClaims() {
    return this.tokenRecords;
  }

  getClaims(attributeName) {
    return this.tokenRecords.filter(matchesAttributeName.bind(undefined, attributeName));
  }

  addClaim(token) {
    return new Promise((accept, reject) => {
      if (!Persona.isTokenValid(token)) {
        reject("Token containing claim is invalid, and thus not added.");
      } else {
        this.tokenRecords.push(token);
        this.saveAttributes().then(() => {
          accept();
        }).catch(reject);
      }
    });
  }

  addAttribute(attribute, privSignKey) {
    var token = this.signAttribute(attribute, privSignKey, this.address);
    return this.addClaim(token);
  }

  replaceAttribute(attribute, privSignKey) {
    var attributeName = Object.keys(attribute)[0];
    this.tokenRecords = this.tokenRecords.filter(notMatchesAttributeName.bind(undefined, attributeName));
    return this.addAttribute(attribute, privSignKey);
  }

  deleteAttribute(attributeName) {
    this.tokenRecords = this.tokenRecords.filter(notMatchesAttributeName.bind(undefined, attributeName));
    return this.saveAttributes();
  }

  signAttribute(attribute, privSignKey, issuerId) {
    var issuerPublicKey = Persona.privateKeyToPublicKey(privSignKey);

    var issuer = {};
    issuer.publicKey = issuerPublicKey;
    if (issuerId !== undefined) {
      issuer.uportId = issuerId;
    }
    var subject = {uportId: this.address};
    subject.publicKey = "Public key can be read from pubSignKey record.";
    var rawToken = bsProfiles.signToken(attribute, privSignKey, subject, issuer);

    return bsProfiles.wrapToken(rawToken);
  }

  signMultipleAttributes(attributes, privSignKey, issuerId) {
    return attributes.map((attribute) => {
      return signAttribute(attribute, privSignKey, issuerId);
    });
  }

  static isTokenValid(token) {
    try {
      bsProfiles.verifyTokenRecord(token, token.decodedToken.payload.issuer.publicKey);
    } catch (e) {
      //console.log(e);
      return false;
    }
    return true;
  }

  static privateKeyToPublicKey(privateKey) {

    var privateKeyBigInteger = bigi.fromBuffer(new Buffer(privateKey, 'hex'));
    var ellipticKeyPair = new bitcoinjsLib.ECPair(privateKeyBigInteger, null, {});
    var publicKey = ellipticKeyPair.getPublicKeyBuffer().toString('hex');

    return publicKey;
  }
}

module.exports = Persona;
