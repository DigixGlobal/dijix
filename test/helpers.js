export class MockType {
  constructor(type, flag) {
    this.type = type;
    this.flag = !!flag;
  }
  async executePipeline() {
    return { myType: this.type, myFlag: this.flag };
  }
}
