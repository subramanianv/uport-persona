import bigi from 'bigi';
import * as bsProfiles from 'blockstack-profiles';
import bitcoinjsLib from 'bitcoinjs-lib';
import uportRegistry from 'uport-registry';

const REGISTRY_ADDRESS = '0xa9be82e93628abaac5ab557a9b3b02f711c0151c';

const matchesAttributeName = (attrName, token) => Object.keys(token.decodedToken.payload.claim)[0] === attrName;
const notMatchesAttributeName = (attrName, token) => Object.keys(token.decodedToken.payload.claim)[0] !== attrName;

/** Class representing a persona. */
class Persona {

  /**
   *  Class constructor.
   *  Creates a new persona object. The registryAddress is an optional argument and if not specified will be set to the default consensys testnet uport-registry.
   *
   *  @memberof Persona
   *  @method          constructor
   *  @param           {String}             address                                                             the address of the persona
   *  @param           {String}             [registryAddress='0xa9be82e93628abaac5ab557a9b3b02f711c0151c']      the uport-registry address to use.
   *  @return          {Object}             self
   */
  constructor(proxyAddress, registryAddress) {
    this.address = proxyAddress;
    this.tokenRecords = [];
    if (registryAddress) {
      this.registryAddress = registryAddress;
    } else {
      this.registryAddress = REGISTRY_ADDRESS;
    }
  }

  /**
   *  This functions is used to set providers so that the library can communicate with web3 and ipfs.
   *
   *  @memberof Persona
   *  @method          setProviders
   *  @param           {String}           ipfsProvider           an ipfs provider
   *  @param           {String}           web3Provider           web3 provider
   *  @return          {Void}             No return
   */
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

  /**
   *  This function always have to be called before doing anything else, with the exception of setProfile. This function loads the profile of the persona from the uport-registry into the persona object.
   *
   *  @memberof Persona
   *  @method          load
   *  @return          {Promise<JSON, Error>}            A promise that returns all tokens registered to the persona. Encrypted tokens would be included here. Or an Error if rejected.
   */
  load() {
    return new Promise((accept, reject) => {
      this.loadAttributes().then((tokens) => {
        this.tokenRecords = tokens;
        accept(tokens);
      }).catch(reject);
    });
  }

  /**
   *  This function sets the profile of the persona. It's intended to be used in the process of creating a new persona. When modifying a persona load should be used in conjunction with the functions below dealing with attributes and claims.
   *
   *  @memberof Persona
   *  @method          setProfile
   *  @param           {JSON}           profile             a profile in JSON, preferably in the format of schema.org/Person.
   *  @param           {String}         privSignKey         the private signing key of the persona
   *  @return          {Promise<JSON, Error>}               A promise that returns tx, or an Error if rejected.
   */
  //  TODO: does this returning promise return a tx id, tx string or tx json?
  setProfile(profile, privSignKey) {
    const tokens = Object.keys(profile).map(attrName => {
      const attribute = {};
      attribute[attrName] = profile[attrName];

      return this.signAttribute(attribute, privSignKey, this.address);
    });
    this.tokenRecords = tokens;
    const pubSignKey = Persona.privateKeyToPublicKey(privSignKey);
    this.tokenRecords.push(this.signAttribute({"pubSignKey": pubSignKey}, privSignKey, this.address));
    return this.saveAttributes();
  }

  /**
   *  This function returns a profile in JSON format.
   *
   *  @memberof Persona
   *  @method          getProfile
   *  @return          {JSON}           profile
   */
  getProfile() {
    // When encryption is implemented this will only give
    // you the part of the profile you have access to.
    let profile = {};

    this.tokenRecords.map((tokenRecord) => {
      let decodedToken = null;
      try {
        decodedToken = bsProfiles.verifyTokenRecord(tokenRecord, tokenRecord.decodedToken.payload.issuer.publicKey);
      } catch (e) {
        throw new Error(`decodedToken failed: ${e}`);
      }

      if (decodedToken !== null) {
        profile = Object.assign({}, profile, decodedToken.payload.claim);
      }
    });
    return profile;
  }

  /**
   *  Returns the public signing key of the persona.
   *
   *  @memberof Persona
   *  @method          getPublicSigningKey
   *  @return          {String}
   */
  //  TODO: are these keys strings?
  getPublicSigningKey() {
    return this.getClaims('pubSignKey')[0].decodedToken.payload.claim.pubSignKey;
  }

  /**
   *  Returns the public encryption key of the persona, if set.
   *
   *  @memberof Persona
   *  @method          getPublicEncryptionKey
   *  @return          {String}
   */
  getPublicEncryptionKey() {
    return this.getClaims('pubEncKey')[0].decodedToken.payload.claim.pubEncKey;
  }

  /**
   *  Returns all tokens associated with the persona.
   *
   *  @memberof Persona
   *  @method          getAllClaims
   *  @return          {JSON}           List of tokens
   */
  getAllClaims() {
    return this.tokenRecords;
  }

  /**
   *  Returns all tokens that have the given attribute name.
   *
   *  @memberof Persona
   *  @method          getClaims
   *  @param           {String}         attributesName         the name of the attribute to check
   *  @return          {JSON}           List of tokens
   */
  getClaims(attributeName) {
    return this.tokenRecords.filter(matchesAttributeName.bind(undefined, attributeName));
  }

  /**
   *  Add a signed claim to this persona. This should be used to add tokens signed by third parties.
   *
   *  @memberof Persona
   *  @method          addClaim
   *  @param           {JSON}                     token          the claim to add
   *  @return          {Promise<None, Error>}     A promise that does not return, or an Error if rejected.
   */
  //  TODO: is the token json?
  addClaim(token) {
    if (!Persona.isTokenValid(token)) {
      return Promise.reject("Token containing claim is invalid, and thus not added.");
    }

    this.tokenRecords.push(token);
    return uportRegistry.setAttributes(this.registryAddress, this.tokenRecords, {from: this.address});
  }

  /**
   *  Adds a self signed attribute to the persona. Only to be used if you can send transactions as persona.address.
   *
   *  @memberof Persona
   *  @method          addAttribute
   *  @param           {Object}                     attribute          the attribute to add, in the format {attrName: attr}
   *  @param           {String}                     privSignKey        the private signing key of the persona
   *  @return          {Promise<None, Error>}       A promise that does not return, or an Error if rejected.
   */
  addAttribute(attribute, privSignKey) {
    const token = this.signAttribute(attribute, privSignKey, this.address);
    return this.addClaim(token);
  }

  /**
   *  Removes all tokens having the same attribute name as the given attribute and adds the given attribute. Only to be used if you can send transactions as persona.address.
   *
   *  @memberof Persona
   *  @method          placeAttribute
   *  @param           {Object}                     attribute          the attribute to add, in the format {attrName: attr}
   *  @param           {String}                     privSignKey        the private signing key of the persona
   *  @return          {Promise<None, Error>}       A promise that does not return, or an Error if rejected.
   */
  replaceAttribute(attribute, privSignKey) {
    const attributeName = Object.keys(attribute)[0];
    this.tokenRecords = this.tokenRecords.filter(notMatchesAttributeName.bind(undefined, attributeName));
    return this.addAttribute(attribute, privSignKey);
  }

  /**
   *  Removes all attributes with the same attribute name as the given attribute. Only to be used if you can send transactions as persona.address.
   *
   *  @memberof Persona
   *  @method          deleteAttribute
   *  @param           {Object}                     attribute          the attribute to add, in the format {attrName: attr}
   *  @return          {Promise<None, Error>}       A promise that does not return, or an Error if rejected.
   */
  deleteAttribute(attributeName) {
    this.tokenRecords = this.tokenRecords.filter(notMatchesAttributeName.bind(undefined, attributeName));
    return this.saveAttributes();
  }

  /**
   *  Signs the given attribute to the persona. This method is to be used by third parties who wishes to attest to an attribute of the persona.
   *
   *  @memberof Persona
   *  @method          signAttribute
   *  @param           {Object}           attribute          the attribute to add, in the format {attrName: attr}
   *  @param           {String}           privSignKey        the private signing key of the attestor
   *  @param           {String}           issuerId           the address of the attestor (voluntary, to allow finding info on the attestor from uport-registry)
   *  @return          {Object}           token
   */
  signAttribute(attribute, privSignKey, issuerId) {
    const issuerPublicKey = Persona.privateKeyToPublicKey(privSignKey);

    const issuer = {};
    issuer.publicKey = issuerPublicKey;
    if (issuerId !== undefined) {
      issuer.uportId = issuerId;
    }
    const subject = { uportId: this.address };
    subject.publicKey = 'Public key can be read from pubSignKey record.';
    const rawToken = bsProfiles.signToken(attribute, privSignKey, subject, issuer);

    return bsProfiles.wrapToken(rawToken);
  }

  /**
   *  Same as addAttribute but for a list of attributes.
   *
   *  @memberof Persona
   *  @method          signMultipleAttributes
   *  @param           {Array}                  attribute          the attribute to add, in the format [{attrName: attr},...]
   *  @param           {String}                 privSignKey        the private signing key of the attestor
   *  @param           {String}                 issuerId           the address of the attestor (voluntary, to allow finding info on the attestor from uport-registry)
   *  @return          {Array}                  List of tokens
   */
  signMultipleAttributes(attributes, privSignKey, issuerId) {
    return attributes.map((attribute) => bsProfiles.signAttribute(attribute, privSignKey, issuerId));
  }

  /**
   *  A static function for checking if a token is valid.
   *
   *  @memberof Persona
   *  @method          isTokenValid
   *  @param           {Object}           token
   *  @return          {Boolean}
   */
  static isTokenValid(token) {
    try {
      bsProfiles.verifyTokenRecord(token, token.decodedToken.payload.issuer.publicKey);
    } catch (e) {
      // console.log(e);
      return false;
    }
    return true;
  }

  /**
   *  A static function for checking if a token is valid.
   *
   *  @memberof Persona
   *  @method          privateKeyToPublicKey
   *  @param           {String}                 privateKey
   *  @return          {String}                 publicKey
   */
  static privateKeyToPublicKey(privateKey) {
    const privateKeyBigInteger = bigi.fromBuffer(new Buffer(privateKey, 'hex'));
    const ellipticKeyPair = new bitcoinjsLib.ECPair(privateKeyBigInteger, null, {});
    const publicKey = ellipticKeyPair.getPublicKeyBuffer().toString('hex');

    return publicKey;
  }
}

//export default Persona;
module.exports = Persona;
