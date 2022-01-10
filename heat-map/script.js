// render the svg
renderTitle();
renderDescription();
const [svg, w, h, padding] = renderSvg();

// fetch the data
d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
)
  .then((data) => {
    renderData(data);
  })
  .catch((e) => {
    console.error(e);
  });

// render tooltip
const tooltip = renderTooltip();

// render legend
const legend = renderLegend();

function renderSvg() {
  const padding = {
    top: 80,
    right: 50,
    bottom: 100,
    left: 100,
  };
  const w = 900 - padding.left - padding.right;
  const h = 400 - padding.top - padding.bottom;
  const svg = d3
    .select("#chart-container")
    .append("svg")
    .attr("width", w + padding.left + padding.right)
    .attr("height", h + padding.top + padding.bottom);

  return [svg, w, h, padding];
}

// render data callback when ready
function renderData(data) {
  // constants
  const monthNames = getMonthNames();
  const heatLevel = getHeatLevel();

  // parse the dataset
  const temperature = data.baseTemperature;
  const dataset = data.monthlyVariance.map((d) => {
    return {
      ...d,
      month: d.month - 1,
    };
  });
  const rectWidth = w / Math.ceil(dataset.length / 12);
  const rectHeight = h / 12;

  // x scale and axis
  const x = d3
    .scaleLinear()
    .domain(d3.extent(dataset, (d) => d.year))
    .range([0, w]);
  const xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
  svg
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", `translate(${padding.left}, ${h + padding.top})`);

  // y scale and axis
  const y = d3.scaleBand().domain(monthNames).range([0, h]);
  const yAxis = d3.axisLeft(y);
  svg
    .append("g")
    .call(yAxis)
    .attr("transform", `translate(${padding.left}, ${padding.top})`)
    .attr("id", "y-axis");

  // create rect for each data in the dataset
  svg
    .selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", (d, i) => padding.left + x(d.year))
    .attr("y", (d, i) => padding.top + d.month * rectHeight)
    .attr("width", rectWidth)
    .attr("height", rectHeight)
    .attr("data-month", (d, i) => d.month)
    .attr("data-year", (d, i) => d.year)
    .attr("data-temp", (d, i) => temperature + d.variance)
    .attr("class", "cell")
    .attr("fill", function (d, i) {
      const currentTemp = this.getAttribute("data-temp");
      let fill = heatLevel[0].fill;
      for (const hl of Object.values(heatLevel)) {
        if (currentTemp >= hl.above) {
          fill = hl.fill;
        }
      }
      return fill;
    })
    // animate tooltip
    .on("mouseover", function (event, d) {
      const currentTemp = this.getAttribute("data-temp");

      tooltip
        .transition()
        .duration(0)
        .style("opacity", 0.8)
        .style("left", event.pageX + "px")
        .style("top", event.pageY + "px");

      tooltip.attr("data-year", d.year).html(`
        <h3>${d.year} - ${monthNames[d.month]}</h3>
        <h4>${Number(currentTemp).toPrecision(2)}&deg;C</h4>
        <h4>${d.variance > 0 ? "+" : ""}${d.variance.toPrecision(2)}&deg;C</h4>
      `);
    })
    .on("mouseout", function (event, d) {
      tooltip.transition().duration(0).style("opacity", 0);
    });
}

function renderTitle() {
  return d3
    .select("#chart-container")
    .append("h1")
    .text("Monthly Global Land-Surface Temperature")
    .attr("id", "title");
}

function renderDescription() {
  return d3
    .select("#chart-container")
    .append("h3")
    .html("1753 - 2015: base temperature 8.6&deg;C")
    .attr("id", "description");
}

function renderTooltip() {
  return d3.select("#chart-container").append("div").attr("id", "tooltip");
}

function renderLegend() {
  const heatLevel = getHeatLevel();
  const legendContainer = svg
    .append("g")
    .attr("id", "legend")
    .attr("width", 100)
    .attr("height", 100);
  const [legendRectW, legendRectH] = [60, 10];

  let legend = legendContainer
    .selectAll(".legend-item")
    .data(heatLevel)
    .enter()
    .append("g")
    .attr("class", "legend-item");

  legend
    .append("rect")
    .attr("x", (d, i) => padding.left + i * legendRectW)
    .attr("y", (d, i) => padding.top / 3)
    .attr("width", legendRectW)
    .attr("height", legendRectH)
    .attr("fill", (d, i) => d.fill);

  legend
    .append("text")
    .attr("x", (d, i) => padding.left + i * legendRectW)
    .attr("y", (d, i) => padding.top / 3 + legendRectH * 2.5)
    .attr("width", legendRectW)
    .attr("height", legendRectH)
    .html((d) => `&ge; ${d.above}`);

  return legendContainer;
}

function getHeatLevel() {
  const styles = getComputedStyle(document.documentElement);

  return [
    {
      above: -10.0,
      fill: styles.getPropertyValue("--color-1"),
    },
    {
      above: 3.9,
      fill: styles.getPropertyValue("--color-2"),
    },
    {
      above: 5.0,
      fill: styles.getPropertyValue("--color-3"),
    },
    {
      above: 6.1,
      fill: styles.getPropertyValue("--color-4"),
    },
    {
      above: 7.2,
      fill: styles.getPropertyValue("--color-5"),
    },
    {
      above: 8.3,
      fill: styles.getPropertyValue("--color-6"),
    },
    {
      above: 9.5,
      fill: styles.getPropertyValue("--color-7"),
    },
    {
      above: 10.8,
      fill: styles.getPropertyValue("--color-8"),
    },
    {
      above: 11.7,
      fill: styles.getPropertyValue("--color-9"),
    },
  ];
}

function getMonthNames() {
  return [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
}
