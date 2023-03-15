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
}

export default Agent;
