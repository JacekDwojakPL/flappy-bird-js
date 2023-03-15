const FRAME_RATE = 60;
const BACKGROUND_SPEED = 1 / (FRAME_RATE / 2);
const FOREGORUND_SPEED = BACKGROUND_SPEED * 2;
const BACKGROUND_LOOPING_POINT = 413;
const PIPE_SPEED = FOREGORUND_SPEED;
const GROUND_SPEED = FOREGORUND_SPEED;
const START_TRAINING = 'START_TRAINING';
const END_TRAINING = 'END_TRAINING';
const EXPORT_Q_VALUES = 'EXPORT_Q_VALUES';
const Q_VALUES = 'Q_VALUES';
const EXPORT_SCORES = 'EXPORT_SCORES';
const SCORES = 'SCORES';
const episodeScores = [];

class Agent {
  constructor(gamma = 0.95, epsilon = 0.005, learningRate = 0.7) {
    this.position = { x: 150, y: 150 };
    this.gravity = 45;
    this.dy = 0;
    this.qValues = {};
    this.discount = gamma;
    this.epsilon = epsilon;
    this.learningRate = learningRate;
    this.reward = 0;
  }

  update(dt) {
    this.dy = this.dy + dt / this.gravity;
    this.position.y = Math.round(this.position.y + this.dy);
  }

  getAgentPosition() {
    return this.position;
  }

  getBestAction(currentState) {
    const legalActions = this.getLegalActions();
    const randomIndex = Math.floor(Math.random() * legalActions.length);
    let bestScore = -Infinity;
    let bestAction = null;
    for (let action in legalActions) {
      const score = this.getQValue(currentState, action);
      if (score > bestScore) {
        bestScore = score;
        bestAction = action;
      }
    }

    if (Math.random() < this.epsilon) {
      return legalActions[randomIndex];
    }
    return bestAction;
  }

  getQValue(state, action) {
    if (!this.qValues[state]) {
      this.qValues[state] = [0, 0];
    }

    const stateScores = this.qValues[state];
    return stateScores[action];
  }

  updateQValue(currentState, action, nextState, reward) {
    const actionsForNextState = this.getLegalActions();
    const maxActionScore = Math.max(...actionsForNextState.map((a) => this.getQValue(nextState, a)));

    const currentScore = this.getQValue(currentState, action);

    const observationSample = reward + this.discount * maxActionScore - currentScore;
    this.qValues[currentState][action] = currentScore + this.learningRate * observationSample;
  }

  getLegalActions() {
    return [0, 1];
  }

  takeAction(choosenAction) {
    if (Number(choosenAction) === 1) {
      this.dy = -2;
    }
  }

  reset() {
    this.position = { x: 150, y: 150 };
    this.dy = 0;
    this.reward = 0;
  }

  getReward() {
    return this.reward;
  }

  updateReward(reward) {
    this.reward += reward;
  }

  getQValues() {
    return this.qValues;
  }
}

class Enviorment {
  constructor() {
    this.pipe = {
      x: 670,
      height: 150, //this.getRandomArbitrary(120, 150),
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
      height: 150, //this.getRandomArbitrary(120, 150),
    };
  }

  isTerminalState(state) {
    const { nextPipeDistanceX, nextPipeDistanceY, nextDistanceGround } = state;

    if (nextDistanceGround <= 10) {
      return true;
    }

    if (nextPipeDistanceX <= 0 && nextPipeDistanceY <= 0) {
      if (nextPipeDistanceX <= -50) {
        return false;
      }
      return true;
    }

    return false;
  }

  getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }
}

const agent = new Agent();
const enviorment = new Enviorment();
const ground = {
  position: { x: 0, y: 288 - 16 },
};

function update(dt) {
  // GET CURRENT OBSERVATION
  const pipePosition = enviorment.getPipePosition();
  const agentPosition = agent.getAgentPosition();

  const currentPipeDistanceX = Math.round(pipePosition.x - agentPosition.x);
  const currentPipeDistanceY = Math.round(pipePosition.height - agentPosition.y);
  const currentDistanceGround = Math.round(ground.position.y - agentPosition.y);
  //AGENT CHOOSE BEST ACTION
  const choosenAction = agent.getBestAction([currentPipeDistanceX, currentPipeDistanceY, currentDistanceGround]);

  agent.takeAction(choosenAction);

  agent.update(dt);
  enviorment.update(dt);

  // GET RESULTED POSITION
  const nextPipePosition = enviorment.getPipePosition();
  const nextAgentPosition = agent.getAgentPosition();

  const nextPipeDistanceX = Math.round(nextPipePosition.x - nextAgentPosition.x);
  const nextPipeDistanceY = Math.round(nextPipePosition.height - nextAgentPosition.y);
  const nextDistanceGround = Math.round(ground.position.y - nextAgentPosition.y);

  // GET REWARD BASED ON CURRENT STATE AND RESULTED STATE
  const currentState = {
    currentPipeDistanceX,
    currentPipeDistanceY,
    currentDistanceGround,
  };
  const nextState = {
    nextPipeDistanceX,
    nextPipeDistanceY,
    nextDistanceGround,
  };
  const reward = enviorment.getReward(currentState, choosenAction, nextState);
  agent.updateReward(reward);

  //AGENT UPDATE Q VALUES FOR STATES

  agent.updateQValue(
    [currentPipeDistanceX, currentPipeDistanceY, currentDistanceGround],
    choosenAction,
    [nextPipeDistanceX, nextPipeDistanceY, nextDistanceGround],
    reward
  );

  const isTerminalState = enviorment.isTerminalState(nextState);

  if (isTerminalState) {
    episodeScores.push({ x: episodeScores.length + 1, y: agent.getReward() });
    reset();
  }

  return isTerminalState;
}

function trainingLoop(iterations, cb) {
  let numberOfEpisodes = iterations;

  for (let i = 0; i < numberOfEpisodes; i++) {
    let isTerminalState = false;
    if (i % 1000 === 0) {
      console.log(i);
    }

    do {
      isTerminalState = update(((1 / FRAME_RATE) * 1000) / 2);
    } while (!isTerminalState);
  }
  cb();
}

function reset() {
  agent.reset();
  enviorment.reset();
}
self.onmessage = (ev) => {
  const { type, parameters } = ev.data;
  if (type === START_TRAINING) {
    const { iterations } = parameters;
    trainingLoop(iterations, () => {
      self.postMessage({ type: END_TRAINING, parameters: null });
    });
  }

  if (type === EXPORT_Q_VALUES) {
    self.postMessage({ type: Q_VALUES, parameters: { qValues: agent.getQValues() } });
  }

  if (type === EXPORT_SCORES) {
    self.postMessage({ type: SCORES, parameters: { scores: episodeScores } });
  }
};
