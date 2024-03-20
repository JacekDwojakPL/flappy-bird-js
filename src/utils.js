import { select, scaleLinear, interpolateHcl, max, axisLeft, axisBottom } from 'd3';

export function plotData(data) {
  const margin = { top: 50, right: 50, bottom: 50, left: 50 };
  const width = 640 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  document.querySelector('svg').innerHTML = '';

  // Create the SVG container and set the dimensions
  const svg = select('svg')
    .attr('width', '100%')
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);
  // Select the SVG element containing the chart

  // Create the scales
  const xScale = scaleLinear()
    .domain([0, max(data, (d) => d.x)])
    .range([0, width]);

  const yScale = scaleLinear()
    .domain([0, max(data, (d) => d.y)])
    .range([height, 0]);

  // Generate a random color using the color scale
  //   const randomColor = colorScale(Math.floor(Math.random() * 10));
  const colorScale = scaleLinear()
    .domain([0, max(data, (d) => d.y)])
    .range(['#0EA5E9', '#EF4444'])
    .interpolate(interpolateHcl);

  svg
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', (d) => xScale(d.x))
    .attr('cy', (d) => yScale(d.y))
    .attr('r', 1)
    .attr('fill', (d) => colorScale(d.y));

  // Add the x-axis
  svg.append('g').attr('transform', `translate(0, ${height})`).call(axisBottom(xScale));

  // Add the y-axis
  svg.append('g').call(axisLeft(yScale));
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
