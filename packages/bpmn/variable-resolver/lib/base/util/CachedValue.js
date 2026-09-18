export default class CachedValue {
  constructor(generatorFunction) {
    this._generate = generatorFunction;
    this.value = null;
    this.valid = false;
  }

  invalidate() {
    this.valid = false;
  }

  get() {
    if (!this.valid) {
      this.value = this._generate();
      this.valid = true;
    }

    return this.value;
  }
}