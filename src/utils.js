export function plotData(data) {
  const d2 = data;
  const margin = { top: 30, right: 30, bottom: 30, left: 30 };
  const width = 640 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;
  document.querySelector('svg').innerHTML = '';

  // Create the SVG container and set the dimensions
  const svg = d3
    .select('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);
  // Select the SVG element containing the chart

  // Create the scales
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(d2, (d) => d.x)])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(d2, (d) => d.y)])
    .range([height, 0]);

  // Define the line
  const line = d3
    .line()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y));
  //   const colorScale = d3.scaleOrdinal().range(d3.schemeCategory10);

  // Generate a random color using the color scale
  //   const randomColor = colorScale(Math.floor(Math.random() * 10));
  const colorScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.y)])
    .range(['#0EA5E9', '#EF4444'])
    .interpolate(d3.interpolateHcl);

  svg
    .selectAll('circle')
    .data(d2)
    .enter()
    .append('circle')
    .attr('cx', (d) => xScale(d.x))
    .attr('cy', (d) => yScale(d.y))
    .attr('r', 2)
    .attr('fill', (d) => colorScale(d.y));

  // Add the x-axis
  svg.append('g').attr('transform', `translate(0, ${height})`).call(d3.axisBottom(xScale));

  // Add the y-axis
  svg.append('g').call(d3.axisLeft(yScale));
}
