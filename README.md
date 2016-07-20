# uPort Persona
A library for creating, updating and reading attributes and claims on uport personas. It's intended as an easy interface to the uport-registry, allowing developers to focus on the actual data instead of the datastructure of the object stored in the registry.
## Example usage
### Basic information viewing
For each persona you want to interact with you have to create a separate instance of the Persona class.
```
// the address of the persona you want to interact with
var myAddress = "0x123...";
var p = new Persona(myAddress);
var ipfsProvider = ipfsApi(<hostname>, <port>);
p.setProviders(ipfsProvider, web3.currentProvider);
p.load().then(() => {...});
```
Once instantiated you can start by getting the current profile:
```
var profile = p.getProfile();
```
The `profile` is in JSON format containing all attributes associated with the persona.

### Viewing attestations
An attestation, also called a claim is the basic building block of the information associated with a persona. By default all attributes are self signed by the persona that it's associated with. But an attribute can have multiple claims, meaning that several parties have signed it. The claims are in the same format as [blockstack-profiles](https://github.com/blockstack/blockstack-profiles-js).
To get all claims associated with the persona:
```
var claims = p.getAllCalims();
```

You can also get all claims to a specific attribute:
```
var claims = p.getCalims("MyAttribute");
```

### Signing attributes as a third party
As a third party you would like to attest to the fact that the given persona has a specific attribute. By signing an attribute you create a claim.
```
var thirdPartyPrivKey = ...
var thirdPartyAddress = "0x...";
var claim = p.signAttribute("MyAttribute", thirdPartyPrivKey, thirdPartyAddress);
```

This new claim can now be added to the persona (only by the persona itself).
```
p.addClaim(claim);
```
Note that `addClaim` can only be successfully called if you can sign transactions as the address of persona `p`.


## Running tests
Make sure that you have ipfs and testrpc running, then run:
```
npm test
```
## Documentation
<a name="Persona"></a>

## Persona
Class representing a persona.

**Kind**: global class  

* [Persona](#Persona)
    * [.constructor(address, [registryAddress])](#Persona.constructor) ⇒ <code>Object</code>
    * [.setProviders(ipfsProvider, web3Provider)](#Persona.setProviders) ⇒ <code>Void</code>
    * [.load()](#Persona.load) ⇒ <code>Promise.&lt;JSON, Error&gt;</code>
    * [.setProfile(profile, privSignKey)](#Persona.setProfile) ⇒ <code>Promise.&lt;JSON, Error&gt;</code>
    * [.getProfile()](#Persona.getProfile) ⇒ <code>JSON</code>
    * [.getPublicSigningKey()](#Persona.getPublicSigningKey) ⇒ <code>String</code>
    * [.getPublicEncryptionKey()](#Persona.getPublicEncryptionKey) ⇒ <code>String</code>
    * [.getAllClaims()](#Persona.getAllClaims) ⇒ <code>JSON</code>
    * [.getClaims(attributesName)](#Persona.getClaims) ⇒ <code>JSON</code>
    * [.addClaim(token)](#Persona.addClaim) ⇒ <code>Promise.&lt;None, Error&gt;</code>
    * [.addAttribute(attribute, privSignKey)](#Persona.addAttribute) ⇒ <code>Promise.&lt;None, Error&gt;</code>
    * [.placeAttribute(attribute, privSignKey)](#Persona.placeAttribute) ⇒ <code>Promise.&lt;None, Error&gt;</code>
    * [.deleteAttribute(attribute)](#Persona.deleteAttribute) ⇒ <code>Promise.&lt;None, Error&gt;</code>
    * [.signAttribute(attribute, privSignKey, issuerId)](#Persona.signAttribute) ⇒ <code>Object</code>
    * [.signMultipleAttributes(attribute, privSignKey, issuerId)](#Persona.signMultipleAttributes) ⇒ <code>Array</code>
    * [.isTokenValid(token)](#Persona.isTokenValid) ⇒ <code>Boolean</code>
    * [.privateKeyToPublicKey(privateKey)](#Persona.privateKeyToPublicKey) ⇒ <code>String</code>

<a name="Persona.constructor"></a>

### Persona.constructor(address, [registryAddress]) ⇒ <code>Object</code>
Class constructor.
 Creates a new persona object. The registryAddress is an optional argument and if not specified will be set to the default consensys testnet uport-registry.

**Kind**: static method of <code>[Persona](#Persona)</code>  
**Returns**: <code>Object</code> - self  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| address | <code>String</code> |  | the address of the persona |
| [registryAddress] | <code>String</code> | <code>&#x27;0xa9be82e93628abaac5ab557a9b3b02f711c0151c&#x27;</code> | the uport-registry address to use. |

<a name="Persona.setProviders"></a>

### Persona.setProviders(ipfsProvider, web3Provider) ⇒ <code>Void</code>
This functions is used to set providers so that the library can communicate with web3 and ipfs.

**Kind**: static method of <code>[Persona](#Persona)</code>  
**Returns**: <code>Void</code> - No return  

| Param | Type | Description |
| --- | --- | --- |
| ipfsProvider | <code>String</code> | an ipfs provider |
| web3Provider | <code>String</code> | web3 provider |

<a name="Persona.load"></a>

### Persona.load() ⇒ <code>Promise.&lt;JSON, Error&gt;</code>
This function always have to be called before doing anything else, with the exception of setProfile. This function loads the profile of the persona from the uport-registry into the persona object.

**Kind**: static method of <code>[Persona](#Persona)</code>  
**Returns**: <code>Promise.&lt;JSON, Error&gt;</code> - A promise that returns all tokens registered to the persona. Encrypted tokens would be included here. Or an Error if rejected.  
<a name="Persona.setProfile"></a>

### Persona.setProfile(profile, privSignKey) ⇒ <code>Promise.&lt;JSON, Error&gt;</code>
This function sets the profile of the persona. It's intended to be used in the process of creating a new persona. When modifying a persona load should be used in conjunction with the functions below dealing with attributes and claims.

**Kind**: static method of <code>[Persona](#Persona)</code>  
**Returns**: <code>Promise.&lt;JSON, Error&gt;</code> - A promise that returns tx, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| profile | <code>JSON</code> | a profile in JSON, preferably in the format of schema.org/Person. |
| privSignKey | <code>String</code> | the private signing key of the persona |

<a name="Persona.getProfile"></a>

### Persona.getProfile() ⇒ <code>JSON</code>
This function returns a profile in JSON format.

**Kind**: static method of <code>[Persona](#Persona)</code>  
**Returns**: <code>JSON</code> - profile  
<a name="Persona.getPublicSigningKey"></a>

### Persona.getPublicSigningKey() ⇒ <code>String</code>
Returns the public signing key of the persona.

**Kind**: static method of <code>[Persona](#Persona)</code>  
<a name="Persona.getPublicEncryptionKey"></a>

### Persona.getPublicEncryptionKey() ⇒ <code>String</code>
Returns the public encryption key of the persona, if set.

**Kind**: static method of <code>[Persona](#Persona)</code>  
<a name="Persona.getAllClaims"></a>

### Persona.getAllClaims() ⇒ <code>JSON</code>
Returns all tokens associated with the persona.

**Kind**: static method of <code>[Persona](#Persona)</code>  
**Returns**: <code>JSON</code> - List of tokens  
<a name="Persona.getClaims"></a>

### Persona.getClaims(attributesName) ⇒ <code>JSON</code>
Returns all tokens that have the given attribute name.

**Kind**: static method of <code>[Persona](#Persona)</code>  
**Returns**: <code>JSON</code> - List of tokens  

| Param | Type | Description |
| --- | --- | --- |
| attributesName | <code>String</code> | the name of the attribute to check |

<a name="Persona.addClaim"></a>

### Persona.addClaim(token) ⇒ <code>Promise.&lt;None, Error&gt;</code>
Add a signed claim to this persona. This should be used to add tokens signed by third parties.

**Kind**: static method of <code>[Persona](#Persona)</code>  
**Returns**: <code>Promise.&lt;None, Error&gt;</code> - A promise that does not return, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>JSON</code> | the claim to add |

<a name="Persona.addAttribute"></a>

### Persona.addAttribute(attribute, privSignKey) ⇒ <code>Promise.&lt;None, Error&gt;</code>
Adds a self signed attribute to the persona. Only to be used if you can send transactions as persona.address.

**Kind**: static method of <code>[Persona](#Persona)</code>  
**Returns**: <code>Promise.&lt;None, Error&gt;</code> - A promise that does not return, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| attribute | <code>Object</code> | the attribute to add, in the format {attrName: attr} |
| privSignKey | <code>String</code> | the private signing key of the persona |

<a name="Persona.placeAttribute"></a>

### Persona.placeAttribute(attribute, privSignKey) ⇒ <code>Promise.&lt;None, Error&gt;</code>
Removes all tokens having the same attribute name as the given attribute and adds the given attribute. Only to be used if you can send transactions as persona.address.

**Kind**: static method of <code>[Persona](#Persona)</code>  
**Returns**: <code>Promise.&lt;None, Error&gt;</code> - A promise that does not return, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| attribute | <code>Object</code> | the attribute to add, in the format {attrName: attr} |
| privSignKey | <code>String</code> | the private signing key of the persona |

<a name="Persona.deleteAttribute"></a>

### Persona.deleteAttribute(attribute) ⇒ <code>Promise.&lt;None, Error&gt;</code>
Removes all attributes with the same attribute name as the given attribute. Only to be used if you can send transactions as persona.address.

**Kind**: static method of <code>[Persona](#Persona)</code>  
**Returns**: <code>Promise.&lt;None, Error&gt;</code> - A promise that does not return, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| attribute | <code>Object</code> | the attribute to add, in the format {attrName: attr} |

<a name="Persona.signAttribute"></a>

### Persona.signAttribute(attribute, privSignKey, issuerId) ⇒ <code>Object</code>
Signs the given attribute to the persona. This method is to be used by third parties who wishes to attest to an attribute of the persona.

**Kind**: static method of <code>[Persona](#Persona)</code>  
**Returns**: <code>Object</code> - token  

| Param | Type | Description |
| --- | --- | --- |
| attribute | <code>Object</code> | the attribute to add, in the format {attrName: attr} |
| privSignKey | <code>String</code> | the private signing key of the attestor |
| issuerId | <code>String</code> | the address of the attestor (voluntary, to allow finding info on the attestor from uport-registry) |

<a name="Persona.signMultipleAttributes"></a>

### Persona.signMultipleAttributes(attribute, privSignKey, issuerId) ⇒ <code>Array</code>
Same as addAttribute but for a list of attributes.

**Kind**: static method of <code>[Persona](#Persona)</code>  
**Returns**: <code>Array</code> - List of tokens  

| Param | Type | Description |
| --- | --- | --- |
| attribute | <code>Array</code> | the attribute to add, in the format [{attrName: attr},...] |
| privSignKey | <code>String</code> | the private signing key of the attestor |
| issuerId | <code>String</code> | the address of the attestor (voluntary, to allow finding info on the attestor from uport-registry) |

<a name="Persona.isTokenValid"></a>

### Persona.isTokenValid(token) ⇒ <code>Boolean</code>
A static function for checking if a token is valid.

**Kind**: static method of <code>[Persona](#Persona)</code>  

| Param | Type |
| --- | --- |
| token | <code>Object</code> | 

<a name="Persona.privateKeyToPublicKey"></a>

### Persona.privateKeyToPublicKey(privateKey) ⇒ <code>String</code>
A static function for checking if a token is valid.

**Kind**: static method of <code>[Persona](#Persona)</code>  
**Returns**: <code>String</code> - publicKey  

| Param | Type |
| --- | --- |
| privateKey | <code>String</code> | 


