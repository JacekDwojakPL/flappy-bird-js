import { PIPE_SPEED } from './constants.js';

class Enviorment {
  constructor() {
    this.pipe = {
      x: 670,
      height: 150 || this.getRandomArbitrary(100, 150),
    };
    this.pipeSpeed = PIPE_SPEED;
  }

  getPipePosition() {
    return this.pipe;
  }

  update(dt) {
    this.pipe.x = Math.round(this.pipe.x + -dt * this.pipeSpeed);
    if (this.pipe.x < -50) {
      this.reset();
    }
  }

  getReward(nextState) {
    if (this.isTerminalState(nextState)) {
      return -1000;
    }

    return 1;
  }

  reset() {
    this.pipe = {
      x: 670,
      height: 150 || this.getRandomArbitrary(100, 150) || 150,
    };
  }

  isTerminalState(state) {
    const { nextPipeDistanceX, nextPipeDistanceY, nextDistanceGround } = state;

    if (nextDistanceGround <= 20) {
      return true;
    }

    if (nextPipeDistanceX <= 20 && nextPipeDistanceY <= 20) {
      if (nextPipeDistanceX <= -75) {
        return false;
      }
      return true;
    }

    return false;
  }

  getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }
}

export default Enviorment;
