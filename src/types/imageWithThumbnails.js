export default class ImageWithThumbnails {
  constructor(config) {
    console.log('creating config', config);
    this.type = 'imageWithThumbnails'
  }
  async executePipeline(dijixConfig, payload) {
    console.log('executing', digixConfig, payload)
    return { myData: 'testing' };
  }
}
