import Agent from './Agent.js';
import Enviorment from './Enviorment.js';
import fs from 'fs';

const episodeScores = [];

const agent = new Agent(0.95, 0.01, 0.7, false);
const enviorment = new Enviorment();
const ground = {
  position: { x: 0, y: 288 - 16 },
};
const decayRate = 0.001;

function update(dt) {
  // GET CURRENT OBSERVATION
  const pipePosition = enviorment.getPipePosition();
  const agentPosition = agent.getAgentPosition();
  const pipeHeight = pipePosition.height;

  const currentPipeDistanceX = Math.round(pipePosition.x - agentPosition.x);
  const currentPipeDistanceY = Math.round(pipePosition.height - agentPosition.y);
  const currentDistanceGround = Math.round(ground.position.y - agentPosition.y);
  //AGENT CHOOSE BEST ACTION
  const choosenAction = agent.getBestAction([
    currentPipeDistanceX,
    currentPipeDistanceY,
    currentDistanceGround,
    pipeHeight,
  ]);

  agent.takeAction(choosenAction);

  agent.update(dt);
  enviorment.update(dt);

  // GET RESULTED POSITION
  const nextPipePosition = enviorment.getPipePosition();
  const nextAgentPosition = agent.getAgentPosition();
  const nextPipeHeight = nextPipePosition.height;

  const nextPipeDistanceX = Math.round(nextPipePosition.x - nextAgentPosition.x);
  const nextPipeDistanceY = Math.round(nextPipePosition.height - nextAgentPosition.y);
  const nextDistanceGround = Math.round(ground.position.y - nextAgentPosition.y);

  // GET REWARD BASED ON CURRENT STATE AND RESULTED STATE
  const currentState = {
    currentPipeDistanceX,
    currentPipeDistanceY,
    currentDistanceGround,
    pipeHeight,
  };
  const nextState = {
    nextPipeDistanceX,
    nextPipeDistanceY,
    nextDistanceGround,
    nextPipeHeight,
  };
  const reward = enviorment.getReward(currentState, choosenAction, nextState);
  agent.updateReward(reward);

  //AGENT UPDATE Q VALUES FOR STATES

  agent.updateQValue(
    [currentPipeDistanceX, currentPipeDistanceY, currentDistanceGround, pipeHeight],
    choosenAction,
    [nextPipeDistanceX, nextPipeDistanceY, nextDistanceGround, nextPipeHeight],
    reward
  );
  const accReward = agent.getReward();
  const isTerminalState = enviorment.isTerminalState(nextState);

  if (isTerminalState || accReward > 10000) {
    episodeScores.push({ x: episodeScores.length + 1, y: accReward });
    reset();
  }

  return isTerminalState || accReward > 10000;
}

function trainingLoop(iterations, fps, cb) {
  let numberOfEpisodes = 0;
  let isTerminalState = false;
  agent.isTraining = true;
  // const deltaTime = 1000 / FRAME_RATE;
  const deltaTime = 4; //1000 / fps;
  console.log('start training');
  while (true) {
    numberOfEpisodes++;
    if (numberOfEpisodes % 1000 === 0) {
      console.log({ iteration: numberOfEpisodes, score: episodeScores[episodeScores.length - 1].y });
    }
    do {
      isTerminalState = update(deltaTime);
    } while (!isTerminalState);
    if (numberOfEpisodes % 150000 === 0) {
      fs.writeFileSync('output.json', JSON.stringify(agent.getQValues()));
    }
  }
  cb();
}

function reset() {
  agent.reset();
  enviorment.reset();
}

trainingLoop(undefined, 30, () => {
  console.log('finished training');
});
// self.onmessage = (ev) => {
//   const { type, parameters } = ev.data;
//   if (type === START_TRAINING) {
//     const { iterations, fps } = parameters;
//     trainingLoop(iterations, fps, () => {
//       self.postMessage({ type: END_TRAINING, parameters: null });
//     });
//   }

//   if (type === EXPORT_Q_VALUES) {
//     self.postMessage({ type: Q_VALUES, parameters: { qValues: agent.getQValues() } });
//   }

//   if (type === EXPORT_SCORES) {
//     self.postMessage({ type: SCORES, parameters: { scores: episodeScores } });
//   }

//   if (type === CHANGE_ALPHA) {
//     agent.learningRate = parameters.alpha;
//   }

//   if (type === CHANGE_EPSILON) {
//     agent.epsilon = parameters.epsilon;
//   }

//   if (type === CHANGE_GAMMA) {
//     agent.gamma = parameters.gamma;
//   }
// };
