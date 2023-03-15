import Agent from './Agent';
import Enviorment from './Enviorment';
import {
  FRAME_RATE,
  START_TRAINING,
  END_TRAINING,
  EXPORT_Q_VALUES,
  Q_VALUES,
  EXPORT_SCORES,
  SCORES,
  PROGRESS,
} from './constants';

const episodeScores = [];

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
      self.postMessage({ type: PROGRESS, parameters: { iteration: i } });
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
