import { PIPE_SPEED } from './constants.js';

class Enviorment {
  constructor() {
    this.pipe = {
      x: 670,
      height: this.getRandomArbitrary(100, 200),
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

  getReward(currentState, choosenAction, nextState) {
    if (this.isTerminalState(nextState)) {
      return -10000;
    }

    const { nextPipeDistanceY } = nextState;
    if (nextPipeDistanceY < 30) {
      return -1;
    }

    return 1;
  }

  reset() {
    this.pipe = {
      x: 670,
      height: this.getRandomArbitrary(100, 200) || 150,
    };
  }

  isTerminalState(state) {
    const { nextPipeDistanceX, nextPipeDistanceY, nextDistanceGround } = state;

    if (nextDistanceGround >= 1000) {
      return true;
    }
    
    if (nextDistanceGround <= 20) {
      return true;
    }

    if (nextPipeDistanceX <= 50 && nextPipeDistanceY <= 50) {
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
