# Reinforcement Learning with Flappy Bir

This repository demonstrates a reinforcement learning algorithm using the popular game Flappy Bird. The project showcases how reinforcement learning can be applied to train an agent to play Flappy Bird directly in the browser, utilizing Web Workers to ensure non-blocking training. The repository includes features for visualizing rewards and adjusting key parameters such as gamma, epsilon, and alpha.

## Features

- **Reinforcement Learning**: Implementation of Q-learning to train an agent to play Flappy Bird.
- **Browser-Based Training**: Uses Web Workers to handle training without blocking the main thread.
- **Reward Visualization**: Graphical representation of rewards over time.
- **Adjustable Parameters**: Allows users to adjust gamma, epsilon, and alpha to see their effects on training.

## Getting Started

### Prerequisites

- A modern web browser (e.g., Chrome, Firefox, Edge)

### Installation

1. Clone the repository and run in dev mode:

   ```bash
   git clone https://github.com/JacekDwojakPL/flappy-bird-js.git
   cd flappy-bird-js
   npm install && npm run bild
   cd dist
   python -m http.server
   ```

2. Open localhost:8000 in the browser

Deployed version can be found here: https://flappy-bird-js.onrender.com
