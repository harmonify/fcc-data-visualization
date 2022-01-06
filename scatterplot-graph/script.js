// fetch the data
d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
)
  .then((data) => {
    renderData(data);
  })
  .catch((e) => {
    console.error(e);
  });

// render the svg
// padding will be applied to all 4 sides and affect the total dimensions.
const [w, h, padding] = [900, 400, 50];
const svg = d3
  .select("#chart-container")
  .append("svg")
  .attr("width", w + padding * 2)
  .attr("height", h + padding * 2);

// render tooltip
const tooltip = renderTooltip();

// render legend
const legend = renderLegend();

// render data callback when ready
function renderData(data) {
  // modify the dataset
  const dataset = data.map((d) => {
    let tmp = d.Time.split(":");
    return {
      ...d,
      Time: new Date(1970, 0, 1, 0, tmp[0], tmp[1]),
    };
  });

  // x scale and axis
  const x = d3
    .scaleLinear()
    .domain([
      d3.min(dataset, (d) => d.Year) - 1,
      d3.max(dataset, (d) => d.Year) + 1,
    ])
    .range([0, w]);
  const xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
  svg
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", `translate(${padding}, ${h + padding})`);

  // y scale and axis
  const y = d3
    .scaleTime()
    .domain(d3.extent(dataset, (d) => d.Time))
    .range([0, h]);
  const timeFormat = d3.timeFormat("%M:%S");
  const yAxis = d3.axisLeft(y).tickFormat(timeFormat);
  svg
    .append("g")
    .call(yAxis)
    .attr("transform", `translate(${padding}, ${padding})`)
    .attr("id", "y-axis");

  // create circle for each data in the dataset
  svg
    .selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => padding + x(d.Year))
    .attr("cy", (d, i) => padding + y(d.Time))
    .attr("r", (d, i) => 7)
    .attr(
      "class",
      (d, i) => "dot " + (d.Doping !== "" ? "dot-primary" : "dot-secondary")
    )
    .attr("data-xvalue", (d, i) => d.Year)
    .attr("data-yvalue", (d, i) => d.Time.toISOString())
    // animate tooltip
    .on("mouseover", function (event, d) {
      tooltip.transition().duration(150).style("opacity", 0.8);
      tooltip
        .attr("data-year", d.Year)
        .style("left", event.pageX - (d.Doping !== "" ? 150 : 80) + "px")
        .style("top", event.pageY - (d.Doping !== "" ? 200 : 150) + "px").html(`
          <div>
            <h3>${d.Name}</h3>
            <h4>${d.Nationality}</h4>
            <p>Year: ${d.Year} Time: ${timeFormat(d.Time)}</p><br>
            <p>${d.Doping}</p>
          </div>
        `);
    })
    .on("mouseout", function (event, d) {
      tooltip.transition().duration(150).style("opacity", 0);
    });
}

function renderTooltip() {
  return d3.select("#chart-container").append("div").attr("id", "tooltip");
}

function renderLegend() {
  // Legends
  const legendContainer = svg.append("g").attr("id", "legend");
  const styles = getComputedStyle(document.documentElement);
  const legends = [
    {
      label: "Riders with doping allegations",
      fill: styles.getPropertyValue("--color-primary"),
    },
    {
      label: "No doping allegations",
      fill: styles.getPropertyValue("--color-secondary"),
    },
  ];
  const [legendRectW, legendRectH] = [32, 16];
  legends.forEach((legend, i) => {
    let l = legendContainer
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", `translate(0, ${h / 3 - i * 25})`);

    // label
    l.append("text")
      .attr("x", w + padding - legendRectW - 10)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(legend.label);

    // rect
    l.append("rect")
      .attr("x", w + padding - legendRectW)
      .attr("width", legendRectW)
      .attr("height", legendRectH)
      .style("fill", legend.fill);
  });

  return legendContainer;
}
