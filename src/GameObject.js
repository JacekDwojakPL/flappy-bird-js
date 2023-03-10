class GameObject {
  constructor(selector, loopingPoint, position = { x: 0, y: 0 }, speed) {
    this.domNode = document.querySelector(selector);
    this.position = position;
    this.loopingPoint = loopingPoint;
    this.speed = speed;
  }

  /**
   * update position of an object
   * @param dt time passed since last frame of execution
   */
  update(dt) {
    if (this.loopingPoint) {
      this.position.x =
        (this.position.x + -dt * this.speed) % this.loopingPoint;
      return;
    }

    this.position.x = (this.position.x + -dt * this.speed) % this.loopingPoint;
  }

  setPosition(data) {
    const { x, y } = data;
    this.position.x = x;
    this.position.y = y;
  }

  render() {
    this.domNode.style.left = this.position.x;
    this.domNode.style.top = this.position.y;
  }
}

export default GameObject;
