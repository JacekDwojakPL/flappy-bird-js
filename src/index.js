import tippy from 'tippy.js';
import GameObject from './GameObject';
import Enviorment from './Enviorment';
import Agent from './Agent';
import {
  BACKGROUND_SPEED,
  BACKGROUND_LOOPING_POINT,
  GROUND_SPEED,
  END_TRAINING,
  START_TRAINING,
  Q_VALUES,
  EXPORT_Q_VALUES,
  EXPORT_SCORES,
  SCORES,
  PROGRESS,
} from './constants';
import { plotData, getFps } from './utils';

async function init() {
  const background = new GameObject('.background', BACKGROUND_LOOPING_POINT, undefined, BACKGROUND_SPEED);
  const ground = new GameObject('.ground', 500, { x: 0, y: 288 - 16 }, GROUND_SPEED);
  const pipe = new GameObject('.pipe', undefined);
  const bird = new GameObject('.bird', { x: 150, y: 150 });
  const enviorment = new Enviorment();
  const agent = new Agent();
  const trainIterationsInput = document.querySelector('.train-iterations');
  const progressBar = document.querySelector('.progress');
  const progressBarValue = document.querySelector('.progressValue');
  const episodeDis = document.querySelector('.episode');
  const fps = await getFps();
  const episodeScores = [];
  const worker = new Worker(
    /* webpackChunkName: "q-learning-worker" */ new URL('./Qlearning.worker.js', import.meta.url)
  );

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
      progressBar.value = Number(trainIterationsInput.value);
      progressBarValue.innerHTML = '100%';
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

    if (type === PROGRESS) {
      const { iteration } = parameters;
      progressBar.value = iteration;
      progressBarValue.innerHTML = `${Math.round((Number(iteration) / Number(trainIterationsInput.value)) * 100)}%`;
    }
  };

  function reset() {
    enviorment.reset();
    agent.reset();
    pipe.setPosition({ x: 670, y: 170 });
    bird.setPosition({ x: 150, y: 150 });
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

    episodeDis.innerHTML = episodeCounter;
  }

  function addEventHandlers() {
    document.querySelector('.train-start-btn').addEventListener('click', () => {
      reset();
      isTraining = true;
      document.title = '[TRAINING] Flappy Bird';
      setTimeout(() => {
        progressBar.max = Number(trainIterationsInput.value);
        progressBar.classList.remove('hidden');
        worker.postMessage({
          type: START_TRAINING,
          parameters: { iterations: Number(trainIterationsInput.value), fps },
        });
      }, 100);
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
      worker.postMessage({ type: EXPORT_SCORES });
    });
    document.querySelector('.clear-chart').addEventListener('click', () => {
      document.querySelector('svg').innerHTML = '';
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
    if (tippy) {
      tippy('#epsilon', {
        content:
          'This parameter represents the exploration vs. exploitation trade-off in the Q-value iteration algorithm. It determines the probability of the agent taking a random action instead of the action with the highest Q-value (i.e., exploration) vs. the action with the highest Q-value (i.e., exploitation). <p>A high value of ε indicates that the agent is more likely to explore, while a low value of ε indicates that the agent is more likely to exploit. Setting ε too high can cause the agent to explore too much and potentially miss the optimal policy, while setting it too low can cause the agent to exploit too much and potentially get stuck in local optima.</p>',
        allowHTML: true,
      });

      tippy('#alpha', {
        content:
          'This parameter represents the learning rate in the Q-value update. It determines how much weight should be given to the new Q-value estimate vs. the previous Q-value estimate. A high value of α indicates that the new Q-value estimate should be given more weight, while a low value of α indicates that the previous Q-value estimate should be given more weight. Setting α too high can cause the algorithm to converge too quickly and potentially miss the optimal policy, while setting it too low can cause the algorithm to converge too slowly.',
        allowHTML: true,
      });
      tippy('#gamma', {
        content:
          'This parameter determines the importance of future rewards in the Q-value update. It is a discount factor that discounts the value of future rewards based on how far away they are in time. In other words, it determines how much weight should be given to immediate rewards vs. future rewards. A high value of γ (e.g., close to 1.0) indicates that future rewards are important, while a low value of γ (e.g., close to 0.0) indicates that only immediate rewards matter.',
        allowHTML: true,
      });
    }
  }
}

init();
