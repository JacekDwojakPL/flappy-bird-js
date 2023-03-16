import { select, scaleLinear, interpolateHcl, max, axisLeft, axisBottom } from 'd3';

export function plotData(data) {
  const margin = { top: 30, right: 30, bottom: 30, left: 30 };
  const width = 640 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  document.querySelector('svg').innerHTML = '';

  // Create the SVG container and set the dimensions
  const svg = select('svg')
    .attr('width', width + margin.left + margin.right)
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
  let deltaTime = 0;
  let lastTimestamp = 0;
  let iterations = 0;
  // deltaTime = timestamp - lastTimestamp;
  // lastTimestamp = timestamp;

  return new Promise((resolve, reject) => {
    function loop(timestamp) {
      deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      iterations++;
      if (iterations > 10) {
        if (deltaTime <= 10) {
          return resolve(120);
        }
        return resolve(60);
      }
      window.requestAnimationFrame((timeRes) => loop(timeRes));
    }
    window.requestAnimationFrame((timeRes) => loop(timeRes));
  });
}
