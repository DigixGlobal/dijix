# Dijix

### Digix's IPFS & JSON Immutable & eXtendable File Format

This project aims to make IPFS objects easy to browse by creating a standardised JSON object that includes metadata about the file that allows javascript clients to efficiently render them.

## Overview

The system is designed for use in the Digix Proof of Asset system (and other future projects) that leverages IPFS for immutable storage. Dijix allows for painless reading and uploading of this data in-browser.

Dijix consists of:

* A specification of standardised dijix objects and types
* A core javascript library:
  * For processing raw files (input) and uploading dijix objects (and their payloads) to IPFS
  * Reading dijix objects, resolving linked objects and fetching their payloads from IPFS
* A plugin middleware system to handle the uploading and processing various dijix types, such as:
  * Images of various formats with thumbnails
  * Multi-page PDFs with image conversions
* `semantic-ui-react` component libraries for rendering dijix types in-browser

The entire dijix suite (except react components) will be supported both in browser and in node via a command line interface.

## Dijix Objects

Dijix objects are JSON objects (uploaded to IPFS) with the following properties:

* Nestable: Objects can be embedded or linked to each other (via IPFS hash)
* Versionable: Objects can link to previous versions of themselves
* Extendable: New types can inherit from other types and extend or override functionality
* Transformable: Standardisation allows for global and type-specific processing (see below)

Dijix objects come with standard headers and a type-specific `data` schema. Here's an example:

```javascript
{
  type: 'imageWithThumbnails',
  schema: '0.0.1',
  created: 1504149884688,
  data: {
    name: 'An Adorable Kitten',
    fileName: 'kitten.jpg',
    mimeType: 'image/jpeg',
    src: 'ipfs://<ipfs hash>',
    width: 2048,
    height: 1024,
    size: 12301293, // bytes
    thumbnails: {
      64: 'ipfs://<ipfs hash>', // links to raw 64 x 32 jpeg image
      256: 'ipfs://<ipfs hash>',
      512: 'ipfs://<ipfs hash>',
      1024: 'ipfs://<ipfs hash>',
    },
  },
}
```

Here's another PoA specific dijix object, which uses linking to provide Proof of Asset documents:

```javascript
{
  type: 'digixProofOfAssetAttestation',
  schema: '0.0.1',
  created: 1504149884688,
  data: {
    attesterType: 'vendor',
    assetAddress: '0x111...222',
    attesterAddress: '0x333...444',
    documentation: [
      'ipfs://<ipfs hash>', // links to imageWithThumbnails (uploaded receipt 1, jpeg)
      'ipfs://<ipfs hash>', // links to multiPagePdf (uploaded receipt 2, pdf)
    ],
  },
}
```

## Middleware

A middleware system will provide optional functionality when importing and/or reading dijix objects:

**Global**

* Encryption & Decryption
* IPFS Pinning

**Type-specific**

* Thumbnail Generation
* Page Splitting
* Image Conversion / Compression
* Watermarking
