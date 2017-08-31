# Dijix

### Digix's IPFS & JSON Immutable & eXtendable File Format

This project aims to make IPFS objects easy to browse by creating a standardised JSON object that includes metadata about the object that allows javascript clients to efficiently render them.

## Overview

The system is designed for use in the Digix Proof of Asset system (and other future projects) that leverages IPFS for immutable storage. Dijix allows for painless reading and uploading of this data in-browser.

Dijix objects are nestable and can be embedded or linked to each other.

Dijix consists of:

* A specification of standardised dijix objects and types
* A core javascript (node & browser) library:
  * For processing raw files (input) and uploading dijix objects (and their payloads) to IPFS
  * Reading dijix objects, resolving linked objects and fetching their payloads from IPFS
* A plugin middleware system to handle the uploading and processing various dijix types, such as:
  * Images of various formats with thumbnails
  * Multi-page PDFs with image conversions
* `semantic-ui-react` component libraries for rendering dijix types in-browser

## Example Dijix Object

Dijix objects are JSON objects (uploaded to IPFS), with standard headers and a type-specific `data` schema.

```javascript
{
  type: 'imageWithThumbnails',
  schema: '0.0.1',
  created: 1504149884688,
  data: {
    name: 'kitten.jpg'
    mimeType: 'image/jpeg'
    ipfsHash: '<ipfs hash>',
    width: 2048,
    height: 1024,
    size: 12301293, // bytes
    thumbnails: {
      64: '<ipfs hash>',
      256: '<ipfs hash>',
      512: '<ipfs hash>',
      1024: '<ipfs hash>',
    },
  }
}
```

## Transforms

Plugins for the various types will enable

**Global Transforms**

* Pinning
* Encryption

**Type-specific Transforms**

* Thumbnail Generation
* Page Splitting
* Image Conversion / Compression
* Watermarking
