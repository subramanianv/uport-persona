# uPort Persona
A library for creating, updating and reading attributes and claims on uport personas. It's intended as an easy interface to the uport-registry, allowing developers to focus on the actual data instead of the datastructure of the object stored in the registry.

## Documentation

**Table of contents:**
- `Persona`
  - `new Persona(address, [registryAddress])`
  - `setProviders(ipfsProvider, web3Provider)`
  - `load()`
  - `setProfile(profile, privSignKey)`
  - `getProfile()`
  - `getPublicSigningKey()`
  - `getPublicEncryptionKey()`
  - `getAllClaims()`
  - `getClaims(attributesName)`
  - `addClaim(token)`
  - `addAttribute(attribute, privSignKey)`
  - `replaceAttribute(attribute, privSignKey)`
  - `deleteAttribute(attribute)`
  - `signAttribute(attribute, privSignKey, issuerId)`
  - `signMultipleAttributes(attributes, privSignKey, issuerId)`
  - `isTokenValid(token)`
  - `privateKeyToPublicKey(privateKey)`

### Persona

---
###### var persona =  new Persona(address, [registryAddress])
Creates a new persona object. the registryAddress is an optional argument and if not specified will be set to the default consensys testnet uport-registry.

`address` - the address of the persona

`registryAddress` - the uport-registry address to use.

---
###### persona.setProviders(ipfsProvider, web3Provider)
This functions is used to set providers so that the library can communicate with web3 and ipfs.

`ipfsProvider` - an ipfs provider

`web3Provider` - a web3 provider

---
###### persona.load().then((tokens) => {...})
This function always have to be called before doing anything else, with the exception of `setProfile`. This function loads the profile of the persona from the uport-registry into the `persona` object.

`tokens` - all tokens registered to the persona. Encrypted tokens would be included here.

---
###### persona.setProfile(profile, privSignKey)
This function sets the profile of the persona. It's intended to be used in the process of creating a new persona. When modifying a persona `load` should be used in conjunction with the functions below dealing with attributes and claims.

`profile ` - a profile in JSON, preferably in the format of [schema.org/Person](https://schema.org/Person).

`privSignKey` - the private signing key of the persona

---
###### var profile = persona.getProfile()
This function returns a profile in JSON format.

---
###### var pubSignKey = persona.getPublicSigningKey()
Returns the public signing key of the persona.

---
###### var pubEncKey = persona.getPublicEncryptionKey()
Returns the public encryption key of the persona, if set.

---
###### var tokens = persona.getAllClaims()
Returns all tokens associated with the persona.

`tokens` - a list of tokens

---
###### var tokens = persona.getClaims(attributesName)
Returns all tokens that have the given attribute name.

`attributesName` - the name of the attribute to check

`tokens` - a list of tokens

---
###### persona.addClaim(token).then(() => {...})
Add a signed claim to this persona. This should be used to add tokens signed by third parties.

Only to be used if you can send transactions as `persona.address`.

`token` - the claim to add

---
###### persona.addAttribute(attribute, privSignKey).then(() => {...})
Adds a self signed attribute to the persona.

Only to be used if you can send transactions as `persona.address`.

`attribute` - the attribute to add, in the format `{attrName: attr}`

`privSignKey` - the private signing key of the persona

---
###### persona.replaceAttribute(attribute, privSignKey).then(() => {...})
Removes all tokens having the same attribute name as the given attribute and adds the given attribute.

Only to be used if you can send transactions as `persona.address`.

`attribute` - the attribute to add, in the format `{attrName: attr}`

`privSignKey` - the private signing key of the persona

---
###### persona.deleteAttribute(attribute).then(() => {...})
Removes all attributes with the same attribute name as the given attribute.

Only to be used if you can send transactions as `persona.address`.

`attribute` - the attribute to add, in the format `{attrName: attr}`

---
###### var token = persona.signAttribute(attribute, privSignKey, issuerId)
Signs the given attribute to the persona. This method is to be used by third parties who wishes to attest to an attribute of the persona.

`attribute` - the attribute to add, in the format `{attrName: attr}`

`privSignKey` - the private signing key of the attestor

`issuerId` - the address of the attestor (voluntary, to allow finding info on the attestor from uport-registry)

---
###### persona.signMultipleAttributes(attributes, privSignKey, issuerId)
Same as above but for a list of attributes.

`attributes` - the attributes to add, in the format `[{attrName: attr},...]`

`privSignKey` - the private signing key of the attestor

`issuerId` - the address of the attestor (voluntary, to allow finding info on the attestor from uport-registry)

---
###### var isValid = Persona.isTokenValid(token)
A static function for checking if a token is valid.

`isValid` - boolean

---
###### var publicKey = Persona.privateKeyToPublicKey(privateKey)
A static function returning a private key given a public key.

`privateKey` - the key to use

`publicKey` - the resulting public key

## Running tests
Make sure that you have ipfs and testrpc running, then run:
```
npm test
```

