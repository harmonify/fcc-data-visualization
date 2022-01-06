// fetch the data
fetch(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
)
  .then((res) => res.json())
  .then((data) => {
    renderData(data);
  })
  .catch((e) => {
    console.error(e);
  });

// create the svg
// padding will be applied to all 4 sides and affect the total dimensions.
const w = 900;
const h = 400;
const padding = 50;
const svg = d3
  .select("#chart-container")
  .append("svg")
  .attr("width", w + padding * 2)
  .attr("height", h + padding * 2);

// create the tooltip
const tooltip = d3
  .select("#chart-container")
  .append("div")
  .attr("id", "tooltip");

// render data callback
function renderData(data) {
  // parse data
  const dataset = data.data;
  const barWidth = w / dataset.length;
  const yearsDate = dataset.map(function (item) {
    return new Date(item[0]);
  });

  // for #tooltip content
  const years = dataset.map(function (d) {
    let quarter;
    const temp = d[0].slice(5, 7);

    if (temp === "01") {
      quarter = "Q1";
    } else if (temp === "04") {
      quarter = "Q2";
    } else if (temp === "07") {
      quarter = "Q3";
    } else if (temp === "10") {
      quarter = "Q4";
    }

    return d[0].slice(0, 4) + " " + quarter;
  });

  // create scales
  fromDate = d3.min(yearsDate);
  fromDate.setMonth(fromDate.getMonth() - 3);
  toDate = d3.max(yearsDate);
  toDate.setMonth(toDate.getMonth() + 3);
  const xAxisScale = d3.scaleTime().domain([fromDate, toDate]).range([0, w]);

  const maxGdp = d3.max(dataset, (d) => d[1]);
  const gdpScale = d3.scaleLinear().domain([0, maxGdp]).range([0, h]);
  const yAxisScale = d3.scaleLinear().domain([0, maxGdp]).range([h, 0]);

  // create axes
  const xAxis = d3.axisBottom(xAxisScale);
  svg
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", `translate(${padding}, ${h + padding})`);

  const yAxis = d3.axisLeft(yAxisScale);
  svg
    .append("g")
    .attr("transform", `translate(${padding}, ${padding})`)
    .attr("id", "y-axis")
    .call(yAxis);

  // create rect for each data in the dataset
  svg
    .selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", (d, i) => padding + i * barWidth)
    .attr("y", (d, i) => h + padding - gdpScale(d[1]))
    .attr("class", "bar")
    .attr("width", barWidth)
    .attr("height", (d, i) => gdpScale(d[1]))
    .attr("data-date", (d, i) => d[0])
    .attr("data-gdp", (d, i) => d[1])
    // animate tooltip
    .attr("index", (d, i) => i)
    .on("mouseover", function (event, d) {
      const i = this.getAttribute("index");
      tooltip.transition().duration(150).style("opacity", 0.8);
      tooltip
        .style("left", i * barWidth + padding * 1.75 + "px")
        .attr("data-date", d[0])
        .html(`
            <p style="margin: 0">
              ${years[i]}<br>
              $${d[1]} Billion
            </p>
        `);
    })
    .on("mouseout", function (event, d) {
      tooltip.transition().duration(150).style("opacity", 0);
    });
}
