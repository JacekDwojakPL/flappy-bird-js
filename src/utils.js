import { scaleLinear, max, min, interpolateHcl } from 'd3';

export function plotData(data) {
  const width = 640; // Canvas width
  const height = 400; // Canvas height

  // Select the canvas and set up its dimensions
  const canvas = document.querySelector('canvas');
  const context = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;

  // Clear previous render
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Create scales
  const xScale = scaleLinear()
    .domain([0, max(data, (d) => d.x)]) // Set domain based on max x value
    .range([0, width]);

  const yScale = scaleLinear()
    .domain([min(data, (d) => d.y), max(data, (d) => d.y)]) // Handle negative y-values by finding the min and max
    .range([height, 0]); // Flip y-axis to fit canvas coordinate system

  const colorScale = scaleLinear()
    .domain([min(data, (d) => d.y), max(data, (d) => d.y)]) // Set color scale based on y values
    .range(['#0EA5E9', '#EF4444'])
    .interpolate(interpolateHcl);

  // Draw all points
  context.fillStyle = 'black'; // Default color (overridden for each point)
  data.forEach((d) => {
    context.beginPath();
    context.arc(xScale(d.x), yScale(d.y), 1, 0, 2 * Math.PI); // Radius of 1
    context.fillStyle = colorScale(d.y); // Apply color scale based on y-value
    context.fill();
  });

  // Draw axes
  context.strokeStyle = 'black';
  context.lineWidth = 1;

  // X-axis
  context.beginPath();
  context.moveTo(0, height); // Start at the bottom of the canvas
  context.lineTo(width, height); // End at the bottom-right corner
  context.stroke();

  // Y-axis
  context.beginPath();
  context.moveTo(0, 0); // Start at the top-left corner
  context.lineTo(0, height); // End at the bottom-left corner
  context.stroke();

  // Optional: Add labels for axes
  // context.font = '12px sans-serif';
  // context.fillStyle = 'black';
  // context.fillText('X-axis', width / 2, height + 30);
  // context.fillText('Y-axis', -30, height / 2);
}

export function getFps() {
  let frameCount = 0;
  let lastTime = performance.now();
  let iterations = 0;
  return new Promise((resolve, reject) => {
    function update() {
      frameCount++;
      let currentTime = performance.now();
      let deltaTime = currentTime - lastTime;

      if (deltaTime >= 1000) {
        iterations++;
        let fps = Math.round((frameCount * 1000) / deltaTime);

        if (iterations === 2) {
          return resolve(fps);
        }
        frameCount = 0;
        lastTime = currentTime;
      }

      window.requestAnimationFrame(update);
    }

    update();
  });
}
