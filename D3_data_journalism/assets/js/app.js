// @TODO: YOUR CODE HERE!
const svgWidth = 960;
const svgHeight = 500;

const margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
const svg = d3.select('#scatter')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

// Append an SVG group
const chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Initial Params
let chosenXAxis = 'poverty';
let chosenYAxis = 'healthcare';

// Retrieve data from the CSV file and execute everything below
d3.csv('assets/data/data.csv').then(stateData => {
    console.log(stateData);
    // Step 1: Parse Data/Cast as numbers
    // ==============================
    stateData.forEach(data => {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
    });

    // Step 2: Create scale functions
    // ==============================
    const xLinearScale = d3.scaleLinear()
        .domain(d3.extent(stateData, d => d.poverty))
        .range([0, width]);

    const yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(stateData, d => d.healthcare)])
        .range([height, 0]);
    
    // Step 3: Create axis functions
    // ==============================
    const bottomAxis = d3.axisBottom(xLinearScale);
    const leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    chartGroup.append('g')
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    chartGroup.append("g")
        .call(leftAxis);
    
    // Step 5: Create Circles
    // ==============================
    const circlesGroup = chartGroup.selectAll("stateCircles")
        .data(stateData)
        .enter()
        .append("circle")
        .classed('stateCircles', true)
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", "15")
        .attr("fill", "#ADD8E6")
        .attr("opacity", ".85");
    
    // Step 6: Add Text to the circles
    // ==============================
    const textCircleGroup = chartGroup.selectAll('stateAbbr')
        .data(stateData)
        .enter()
        .append('text')
        .classed('stateAbbr', true)
        .attr('x', d => xLinearScale(d.poverty))
        .attr('y', d => yLinearScale(d.healthcare)+5.00)
        .text(d => d.abbr)
        .attr("text-anchor", "middle")
        .attr("fill", "white");
    
    // Step 7: Create Axes Labels
    // ==============================

    const labelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${width/2}, ${height + 20})`);

    //x-axis label
    const povertyLabel = labelsGroup.append('text')
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text('In Poverty (%)');
    const ageLabel = labelsGroup.append('text')
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text('Age (Median)');
    //y-axis label
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Lacks Healthcare(%)");


    // Step 8: Create Axes Event Listener
    // ==============================
    labelsGroup.selectAll("text")
        .on("click", function () {
        // get value of selection
        const value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(stateData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenXAxis === "poverty") {
            povertyLabel
                .classed("active", true)
                .classed("inactive", false);
            hairLengthLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else {
            povertyLabel
                .classed("active", false)
                .classed("inactive", true);
            hairLengthLabel
                .classed("active", true)
                .classed("inactive", false);
            }
        }
    });
}).catch(function(error) {
    console.log(error);
});