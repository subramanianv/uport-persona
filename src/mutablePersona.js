import Persona from './persona.js';

/** Class representing a persona that can be modified. This is a subclass of Persona. */
class MutablePersona extends Persona {

  /**
   *  Class constructor.
   *  Creates a new persona object. The registryAddress is an optional argument and if not specified will be set to the default consensys testnet uport-registry.
   *
   *  @memberof MutablePersona
   *  @method          constructor
   *  @param           {String}         address                                                             the address of the persona
   *  @param           {String}         ipfsProvider                                                        an ipfs provider
   *  @param           {String}         web3Provider                                                        web3 provider
   *  @param           {String}         [registryAddress='0xa9be82e93628abaac5ab557a9b3b02f711c0151c']      the uport-registry address to use.
   *  @return          {Object}         self
   */
  constructor(proxyAddress, ipfs, web3Provider, registryAddress) {
    super(proxyAddress, ipfs, web3Provider, registryAddress);
  }

  /**
   *  This should be the only function ever used to write the persona onto the blockchain. This can be overridden in
   *  a subclass.
   *
   *  It stores whatever is in this.tokenRecords.
   *
   *  @memberof MutablePersona
   *  @method          writeToRegistry
   *  @return          {Promise<String, Error>}            A promise that returns the txHash of the transaction updating the registry. Or an Error if rejected.
   */
  writeToRegistry() {
    return this.uportRegistry.setAttributes(this.registryAddress, this.tokenRecords, {from: this.address})
  }

  /**
   *  Add a signed claim to this persona. This should be used to add tokens signed by third parties.
   *
   *  @memberof MutablePersona
   *  @method          addClaim
   *  @param           {JSON}                     token          the claim to add
   */
  addClaim(token) {
    if (!Persona.isTokenValid(token)) {
      throw new Error("Token containing claim is invalid, and thus not added.");
    }
    this.tokenRecords.push(token);
  }

  /**
   *  Add mulitple signed claims to this persona. This should be used to add tokens signed by third parties.
   *
   *  @memberof MutablePersona
   *  @method          addClaims
   *  @param           {JSON}                     tokensList          the claims to add
   */
  addClaims(tokensList) {
    for (let token of tokensList) {
      this.addClaim(token);
    }
  }

  /**
   *  Removes a signed claim from a persona.
   *
   *  @memberof MutablePersona
   *  @method          removeClaim
   *  @param           {JSON}                     tokens          the claims to add
   */
  removeClaim(token) {
    let idx = this.tokenRecords.indexOf(token);
    if (idx === -1) {
      throw new Error("No such token associated with this persona.");
    }
    this.tokenRecords.splice(idx);
  }

  /**
   *  Adds a self signed attribute to the persona. Only to be used if you can send transactions as persona.address.
   *
   *  @memberof MutablePersona
   *  @method          addAttribute
   *  @param           {Object}                     attribute          the attribute to add, in the format {attrName: attr}
   *  @param           {String}                     privSignKey        the private signing key of the persona
   */
  addAttribute(attribute, privSignKey) {
    const token = this.signAttribute(attribute, privSignKey, this.address);
    this.addClaim(token);
  }

  /**
   *  Removes all tokens having the same attribute name as the given attribute and adds the given attribute. Only to be used if you can send transactions as persona.address.
   *
   *  @memberof MutablePersona
   *  @method          replaceAttribute
   *  @param           {Object}                     attribute          the attribute to add, in the format {attrName: attr}
   *  @param           {String}                     privSignKey        the private signing key of the persona
   */
  replaceAttribute(attribute, privSignKey) {
    const attributeName = Object.keys(attribute)[0];
    this.removeAttribute(attributeName);
    this.addAttribute(attribute, privSignKey);
  }

  /**
   *  Removes all attributes with the same attribute name as the given attribute. Only to be used if you can send transactions as persona.address.
   *
   *  @memberof MutablePersona
   *  @method          deleteAttribute
   *  @param           {Object}                     attribute          the attribute to add, in the format {attrName: attr}
   */
  removeAttribute(attributeName) {
    this.tokenRecords = this.tokenRecords.filter(Persona.notMatchesAttributeName(attributeName));
  }

  setPublicSigningKey(privSignKey) {
    let pub = Persona.privateKeyToPublicKey(privSignKey);
    this.replaceAttribute({'pubSignKey': pub}, privSignKey);
  }

  setPublicEncryptionKey(pubEncKey, privSignKey) {
    this.replaceAttribute({'pubEncKey': pubEncKey}, privSignKey);
  }
}

module.exports = MutablePersona;
