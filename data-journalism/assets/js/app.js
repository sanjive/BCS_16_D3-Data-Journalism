// @TODO: YOUR CODE HERE!
// Define the Canvas that will hold the Chart
var cnvsWidth = 960;
var cnvsHeight = 500;

// Margin to define the available chart area
var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

// Calculate the available area for SVG Chart area
var width = cnvsWidth - margin.left - margin.right;
var height = cnvsHeight - margin.top - margin.bottom;

// SVG wrapper to hold the chart
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", cnvsWidth)
  .attr("height", cnvsHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .classed("chart", true)
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
  ;

// Initial Params
let chosenXAxis = 'poverty';
let chosenYAxis = 'obesity';

function xScale(data, chosenXAxis) {
  // function used for updating x-scale var upon click on axis label
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
    d3.max(data, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);

  return xLinearScale;
} // end of function xScale()

function yScale(censusData, chosenYAxis) {
  // function used for updating y-scale var upon click on axis label
  let yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
    d3.max(censusData, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);

  return yLinearScale;
} // end of function yScale()

function renderXAxis(newXScale, xAxis) {
  // function used for updating xAxis var upon click on axis label
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
} // end of function renderXAxis()

function renderYAxis(newYScale, yAxis) {
  //function used for updating yAxis variable upon click
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(2000)
    .call(leftAxis);

  return yAxis;
} // function renderYAxis()

function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  //function for updating the circles with a transition to new circles

  circlesGroup.transition()
    .duration(2000)
    .attr('cx', data => newXScale(data[chosenXAxis]))
    .attr('cy', data => newYScale(data[chosenYAxis]));

  return circlesGroup;
} // end of function renderCircles()

function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  //function for updating State labels as the Axes changes

  textGroup.transition()
    .duration(2000)
    .attr('x', d => newXScale(d[chosenXAxis]))
    .attr('y', d => newYScale(d[chosenYAxis]));

  return textGroup;

} // end of function renderText()

const formatUSD = new Intl.NumberFormat('en-US', {
  // Custom function to format a number to currency
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0
}); // end of formatUSD Custom function

function styleX(value, chosenXAxis) {
  //function to style x-axis values for tooltips

  //style based on variable
  // poverty
  if (chosenXAxis === "poverty") { return `${value}%`; }
  // age
  else if (chosenXAxis === "age") { return `${value} yrs`; }
  // income
  else { return `${formatUSD.format(value)}`; }
} // end of function styleX()

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  // function used for updating circles group with new tooltip
  var xLabel, yLabel;

  // X label
  if (chosenXAxis === "poverty") { xLabel = "Poverty:"; }
  else if (chosenXAxis === "age") { xLabel = "Age (median):"; }
  else { xLabel = "Income (median):"; }

  // Y label
  if (chosenYAxis === "obesity") { yLabel = "Obesity:"; }
  else if (chosenYAxis === "smokes") { yLabel = "Smokes:"; }
  else { yLabel = "Healthcare (median):"; }

  // Define tooltip
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(d => (`${d.state}<br>${xLabel} ${styleX(d[chosenXAxis],
      chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`)
    );

  // Set the tooltip
  circlesGroup.call(toolTip);

  // Event listners for mouseover and mouseout
  circlesGroup.on("mouseover", toolTip.show)
    .on("mouseout", toolTip.hide);

  return circlesGroup;

} // end of function updateToolTip()

d3.csv("assets/data/data.csv").then(function (censusData, err) {
  // Retrieve data from the CSV file and execute everything below
  if (err) throw err;

  // Parse Data with forEach will cast and update string to numeric
  censusData.forEach(function (data) {
    data.poverty = +data.poverty;
    data.obesity = +data.obesity;
    data.income = +data.income;
    data.age = +data.age;
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;
  });

  // define linear scales
  var xLinearScale = xScale(censusData, chosenXAxis);
  var yLinearScale = yScale(censusData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("aText", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis (does not require transformation)
  var yAxis = chartGroup.append('g')
    .classed('aText', true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("opacity", ".5");

  //append Initial Text (State Abbreviation)
  var textGroup = chartGroup.selectAll(".stateText")
    .data(censusData)
    .enter()
    .append("text")
    .classed("stateText", true)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    //Shift the y axis by 3 for a better fit, based on foint size
    .attr('dy', 3)
    .text(d => d.abbr);

  // Create group for 3 x-axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .classed("aText", true)
    .text("In Poverty (%)");

  var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .classed("aText", true)
    .text("Age in yrs (median)");

  var incomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .classed("aText", true)
    .text("Household Income in $ (median)");

  // append y axis
  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${0 - margin.left / 4}, ${height / 20})`);

  var obesityLabel = yLabelsGroup.append("text")
    .attr("x", 0 - (height / 2))
    .attr("y", 0 - margin.left / 4)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .classed("active", true)
    .classed("aText", true)
    .attr("value", "obesity")
    .text("Obese (%)");

  var smokesLabel = yLabelsGroup.append("text")
    .attr("x", 0 - (height / 2))
    .attr("y", 0 - margin.left / 2)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .classed("inactive", true)
    .classed("aText", true)
    .attr("value", "smokes")
    .text("Smokes (%)");

  var healthcareLabel = yLabelsGroup.append("text")
    .attr("x", 0 - (height / 2))
    .attr("y", 0 - margin.left * 3 / 4)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .classed("inactive", true)
    .classed("aText", true)
    .attr("value", "healthcare")
    .text("Lacks Healthcare (%)");

  // updateToolTip function defined above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;
        console.log(chosenXAxis);

        // functions call below have been defined above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxis(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //Update the circle text
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

  // y axis labels event listener
  yLabelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");

      if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

        console.log(value);
        console.log(chosenYAxis);


        // functions call below have been defined above csv import
        // updates y scale for new data
        yLinearScale = yScale(censusData, chosenYAxis);

        // updates x axis with transition
        yAxis = renderYAxis(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //Update the circle text
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "obesity") {
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

}).catch(function (error) {
  console.log(error);
}); // end of d3.csv() data retrieval