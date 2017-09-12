# Dijix

### Digix's IPFS & JSON Immutable & eXtendable File Format

This project aims to make IPFS objects easier to view by processing files and creating a standardised JSON schema that includes metadata about the file and allows clients to more efficiently render them.

## Overview

The system is designed for use in the Digix Proof of Asset system (and other future projects) that leverages IPFS for immutable storage. Dijix allows for painless reading and uploading of this data in-browser.

Dijix consists of:

* A specification of standardised dijix objects and types
* A core javascript library:
  * For processing raw files (input) and uploading dijix objects (and their payloads) to IPFS
  * Reading dijix objects, resolving linked objects and fetching their payloads from IPFS
* A plugin system that handles the uploading and processing various dijix types
* Hooks that allow for global transformations (such as encryption)
* `semantic-ui-react` component libraries for rendering dijix types in-browser (TODO)

The entire dijix suite (except for react components) is supported in the browser, node and via a command line interface.

## Dijix Objects 

Dijix objects are JSON objects (uploaded to IPFS) with the following properties:

* Nestable: Objects can be embedded or linked to each other (via IPFS hash)
* Versionable: Objects can link to previous versions of themselves
* Extendable: New types can inherit from other types and extend or override functionality
* Transformable: Standardisation allows for global and type-specific processing (see below)

Dijix objects come with standard headers and a type-specific `data` schema. Here's an example:

```javascript
{
  "type": "image",
  "created": 1505208269402,
  "schema": "0.0.1",
  "data": {
    "height": 250,
    "width": 940,
    "src": "QmPQkRRAryL8MHu8ERabQNVgHcsixnZDjzm3nuTW7Xq81n",
    "size": 100789,
    "mime": "image/jpeg",
    "thumbnails": {
      "64": "Qme4PHgc7Ecfddg268WYEBagsnc9skNntM9BKbqjzAkajU",
      "256": "QmW4FkWdzRjAnJSnwHWSMxu4mL6rqo5AyfB4b4yUQ1PQ9i",
      "512": "QmQSjeNksgWWK7Bvk9YtMomFZmVMNkGcwvEQNYqFmSdvFE"
    },
    "fileName": "banner.jpg"
  },
  "ipfsHash": "QmUdRPGRxtz3ww3mHZB6dd4qmbYvrFRbrUVKW5XApiWGKF"
}
```

## Types

* [dijix-image](https://github.com/DigixGlobal/dijix-image)
* [dijix-pdf](https://github.com/DigixGlobal/dijix-pdf)
* dijix-attestation (coming soon; a Proof of Asset attestation object)
* dijix-pinning-registry (coming soon; a kovan-connected pinning registry)

## Middlewares

A middleware system will provide optional functionality when importing and/or reading dijix objects:

* Encryption & Decryption (TODO)
* IPFS Pinning / Unpinning (TODO)
* Local & Cloud Backups (TODO)

## Usage

### Node & Browser

```javascript
import Dijix from 'dijix';
import DijixImage from 'dijix-image';
import DijixPDF from 'dijix-pdf';

const dijix = new Dijix({
  ipfsEndpoint: 'https://ipfs.infura.io:5001', // optional
  httpEndpoint: 'https://ipfs.infura.io/ipfs', // optional
  concurrency: 10, // optional
  types: [
    new DijixImage(),
    new DijixPDF(),
  ],
});

await dijix.create('image', { src: '/some/image.jpg', ...config }); // outputs dijix object
await dijix.create('pdf', { src: '/some/pdf.pdf', ...config }); // outputs dijix object
```

For node and CLI, you'll need npm, node 8+ and cairo / libpng. See [dijix-image](https://github.com/DigixGlobal/dijix-image) for instructions.

### CLI

```
$ npm install -g dijix dijix-image dijix-pdf

dijix create pdf ~/Desktop/Sample.pdf
processing page 0 of 1
{
  "type": "pdf",
  "created": 1505207437136,
  "schema": "0.0.1",
  "data": {
    "fileSize": 37545,
    "metaData": {},
    "pageCount": 1,
    "src": "QmSkA3k4ksCvJPP2fojXsW15GHa1AJwytLonJikKFvFA4R",
    "mime": "application/pdf",
    "fileName": "Sample.pdf",
    "name": "test",
    "pages": [
      "QmeFUkpXBMF29XvxpfQm58EprrAxDVMpMBGe5chTkjVS4r"
    ]
  },
  "ipfsHash": "QmUfzvU4Q1rsR8U9Ti3Wib2enUX2zuy7FAxY2RoQEQ79NT"
}
```

## Test

To run node and browser tests:

```
npm run test
```

## License

BSD-3-Clause
