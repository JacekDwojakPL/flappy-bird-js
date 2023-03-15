import GameObject from './GameObject';
import Enviorment from './Enviorment';
import Agent from './Agent';
import {
  BACKGROUND_SPEED,
  BACKGROUND_LOOPING_POINT,
  GROUND_SPEED,
  FRAME_RATE,
  END_TRAINING,
  START_TRAINING,
  Q_VALUES,
  EXPORT_Q_VALUES,
  EXPORT_SCORES,
  SCORES,
} from './constants';
import { plotData } from './utils';

function init() {
  const background = new GameObject('.background', BACKGROUND_LOOPING_POINT, undefined, BACKGROUND_SPEED);
  const ground = new GameObject('.ground', 500, { x: 0, y: 288 - 16 }, GROUND_SPEED);
  const pipe = new GameObject('.pipe', undefined);
  const bird = new GameObject('.bird', { x: 150, y: 150 });
  const enviorment = new Enviorment();
  const agent = new Agent();
  const trainIterationsInput = document.querySelector('.train-iterations');
  const episodeScores = [];
  const worker = new Worker(new URL('./Qlearning.worker.js', import.meta.url));

  let deltaTime = 0;
  let lastTimestamp = 0;
  let isTraining = true;
  let episodeCounter = 0;
  let animationFrameId;
  addEventHandlers();
  worker.onmessage = (ev) => {
    const { type, parameters } = ev.data;
    if (type === END_TRAINING) {
      document.title = 'Flappy Bird';
      worker.postMessage({ type: EXPORT_Q_VALUES });
    }

    if (type === Q_VALUES) {
      const { qValues } = parameters;
      agent.qValues = qValues;
    }

    if (type === SCORES) {
      const { scores } = parameters;
      plotData(scores);
    }
  };

  function reset() {
    enviorment.reset();
    agent.reset();
    pipe.setPosition({ x: 670, y: 170 });
    bird.setPosition({ x: 150, y: 150 });
  }

  function trainingLoop() {
    let numberOfEpisodes = Number(trainIterationsInput.value);
    isTraining = true;

    for (let i = 0; i < numberOfEpisodes; i++) {
      let isTerminalState = false;
      do {
        isTerminalState = update(((1 / FRAME_RATE) * 1000) / 2);
      } while (!isTerminalState);
    }
    isTraining = false;
    document.title = 'Flappy Bird';
  }

  function gameLoop(timestamp) {
    animationFrameId = requestAnimationFrame(gameLoop);
    deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    update(deltaTime);
    render();
  }

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
    background.update(dt);
    ground.update(dt);

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
    if (isTraining) {
      agent.updateQValue(
        [currentPipeDistanceX, currentPipeDistanceY, currentDistanceGround],
        choosenAction,
        [nextPipeDistanceX, nextPipeDistanceY, nextDistanceGround],
        reward
      );
    }

    const isTerminalState = enviorment.isTerminalState(nextState);

    if (!isTerminalState) {
      pipe.setPosition({ x: nextPipePosition.x, y: nextPipePosition.height });
      bird.setPosition({ x: nextAgentPosition.x, y: nextAgentPosition.y });
    } else {
      episodeScores.push({ x: episodeScores.length + 1, y: agent.getReward() });
      episodeCounter++;
      reset();
    }

    return isTerminalState;
  }

  function render() {
    pipe.render();
    background.render();
    ground.render();
    bird.render();

    document.querySelector('.episode').innerHTML = episodeCounter;
  }

  function addEventHandlers() {
    document.querySelector('.train-start-btn').addEventListener('click', () => {
      reset();
      isTraining = true;
      document.title = '[TRAINING] Flappy Bird';
      // setTimeout(() => trainingLoop(), 100);
      setTimeout(
        () =>
          worker.postMessage({ type: START_TRAINING, parameters: { iterations: Number(trainIterationsInput.value) } }),
        100
      );
    });
    document.querySelector('.start-simulation').addEventListener('click', () => {
      reset();
      isTraining = false;
      animationFrameId = requestAnimationFrame(gameLoop);
    });
    document.querySelector('.stop-simulation').addEventListener('click', () => {
      reset();
      cancelAnimationFrame(animationFrameId);
    });

    document.querySelector('.show-chart').addEventListener('click', () => {
      // plotData(episodeScores);
      worker.postMessage({ type: EXPORT_SCORES });
    });

    document.querySelector('.epsilon').addEventListener('change', (e) => {
      agent.epsilon = Number(e.target.value);
    });
    document.querySelector('.alpha').addEventListener('change', (e) => {
      agent.learningRate = Number(e.target.value);
    });
    document.querySelector('.gamma').addEventListener('change', (e) => {
      agent.reward = Number(e.target.value);
    });
  }
}

init();
