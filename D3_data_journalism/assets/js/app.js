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

// Bonus: function used for updating x-scale upon click on axis label
function xScale(stateData, chosenXAxis) {
    // create scales
    const xLinearScale = d3.scaleLinear()
      .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8,
      d3.max(stateData, d => d[chosenXAxis]) * 1.2])
      .range([0, width]);
  
    return xLinearScale;
  }

//Bonus: function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    const bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// Bonus: function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

function renderTextCircles(textCircleGroup, newXScale, chosenXAxis) {
    textCircleGroup.transition()
        .duration(1000)
        .attr("dx", d => newXScale(d[chosenXAxis]));
        // .attr("dy", d => newYScale(d[chosenYAxis]-0.22));
  
    return textCircleGroup;
}

// Bonus: function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
    
    let label;

    if (chosenXAxis === "poverty") {
        label = "Poverty Rate(%): ";
    }
    else if (chosenXAxis === "age"){
        label = "Age(Median): ";
    }
    else {
        label = "Household Income (Median): $"
    }
    
    // Initalize tooltip
    const toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
    });
    // Create tooltip in chart
    circlesGroup.call(toolTip);

    // Create event listener for tooltip
    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
    })
        // on mouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
// Including Bonus of moving chart
d3.csv('assets/data/data.csv').then((stateData, err) => {
    console.log(stateData);
    // Bonus: run err
    if (err) throw err;

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    stateData.forEach(data => {
        data.id = +data.id;
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
    });

    // Step 2: Create scale functions
    // ==============================
    // Bonus: use xLinearScale function above csv import
    let xLinearScale = xScale(stateData, chosenXAxis);    
  
    // // xLinearScale used when dealing with a static chart
    // const xLinearScale = d3.scaleLinear()
    //     .domain(d3.extent(stateData, d => d.poverty))
    //     .range([0, width]);

    const yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(stateData, d => d.healthcare)])
        .range([height, 0]);

    // Step 3: Create axis functions
    // ==============================
    const bottomAxis = d3.axisBottom(xLinearScale);
    const leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    let xAxis = chartGroup.append('g')
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    chartGroup.append("g")
        .call(leftAxis);
    
    // Step 5: Create Circles
    // ==============================
    let circlesGroup = chartGroup.selectAll("stateCircles")
        .data(stateData)
        .enter()
        .append("circle")
        .classed('stateCircles', true)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", "15")
        .attr("fill", "#ADD8E6")
        .attr("opacity", ".85");
    
    // Step 6: Add Text to the circles
    // ==============================
    let textCircleGroup = chartGroup.selectAll('stateAbbr')
        .data(stateData)
        .enter()
        .append('text')
        .classed('stateAbbr', true)
        .attr('dx', d => xLinearScale(d[chosenXAxis]))
        .attr('dy', d => yLinearScale(d[chosenYAxis])+5.00)
        .text(d => d.abbr)
        .attr("text-anchor", "middle")
        .attr("fill", "white");
    
    // Step 7: Create Axes Labels
    // ==============================
    const labelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${width/2}, ${height + 20})`);

    //append x-axis label
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
    const incomeLabel = labelsGroup.append('text')
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text('Household Income (Median)');

    //append y-axis label
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Lacks Healthcare(%)");

    //Bonus: updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

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

            textCircleGroup = renderTextCircles(textCircleGroup, xLinearScale, chosenXAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

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
}).catch(function(error) {
    console.log(error);
});