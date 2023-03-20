// Declare constants
const FRAME_HEIGHT = 400;
const FRAME_WIDTH = 800;
const MARGINS = {left: 70, right: 70, top: 70, bottom: 70};

const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right;

// power a home for a day
const HOME = 7.42 
// drive one mile 
const CAR = .35
// eat a hamburger 
const BURGER = 2.84
// amount absorbed by a tree 
const TREE = 21

const JFK_COORDS = [40.6398, -73.7789]
const BOS_COORDS = [42.3643, -71.0052]


// Frame1: airport 
// initialize background map with leaflet
let map = L.map("airportvis").setView([0, 0], 1);

// add tile layer with leaflet
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// add additional svg to map for d3 points to be added
L.svg().addTo(map);

// add points to map with d3
function plotMap(filter) {

	if (filter == "JFK") {
		coords = JFK_COORDS
	} else {
		coords = BOS_COORDS
	};

	map.setView(coords, 10)

	d3.select("#airportvis")
			.select("svg")
			.selectAll("*")
			.remove();

	d3.csv("data/finaloutput.csv").then((data) => {

		filteredData = data.filter(function(row) {
			return row["from"] == filter;
		});

		console.log(filteredData);

		d3.select("#airportvis")
			.select("svg")
			.selectAll("airportLocations")
			.data(filteredData)
			.enter()
			.append("circle")
				.attr("cx", function(d) { return map.latLngToLayerPoint([d.lat, d.lon]).x})
				.attr("cy", function(d) { return map.latLngToLayerPoint([d.lat, d.lon]).y})
				.attr("r", 1)
				.attr("fill", "green")
				.attr("fill-opacity", .8);
})}

function update() {
	d3.selectAll("circle")
	  .attr("cx", function(d){ return map.latLngToLayerPoint([d.lat, d.lon]).x })
	  .attr("cy", function(d){ return map.latLngToLayerPoint([d.lat, d.lon]).y })
	  .attr("r", map.getZoom() * 0.75);
}

function changeMap() {
	let start_airport = document.getElementById("start-airport");
	let selectedValue = start_airport.options[start_airport.selectedIndex].value;
	plotMap(selectedValue)
}

map.on("moveend", update);

// Frame2: carbon emissions
const FRAME2 = d3.select("#carbonvis")
		          		.append("svg")
		            		.attr("height", FRAME_HEIGHT)
		            		.attr("width", FRAME_WIDTH)
		            		.attr("class", "carbon-emi")
		            	.append("g")
		            		.attr("transform", `translate(${FRAME_WIDTH / 2},${FRAME_HEIGHT / 2})`);

// function for builidng scatter plot (Sepal_length vs. Petal_Length)
//function createvis(){

	//d3.csv("data/finaloutput.csv").then((data) => {
	//};

const radius = Math.min(FRAME_WIDTH, FRAME_HEIGHT) / 2 - MARGINS.left

// Create dummy data
const data = {a: 9, b: 91}

// set the color scale
const color = d3.scaleOrdinal()
  .range(["blue", "transparent"])


// Compute the position of each group on the pie:
const pie = d3.pie()
  .value(d=>d[1])

// Compute the position of each group on the pie:
const data_ready = pie(Object.entries(data))
console.log(data_ready)

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
FRAME2.selectAll('percentage')
	  .data(data_ready)
	  .join('path')
	  .attr('d', d3.arc()
	    .innerRadius(70)         // This is the size of the donut hole
	    .outerRadius(radius)
	    .startAngle(function(d) {return Math.PI*2 - d.startAngle;})
		.endAngle(function(d) {return Math.PI*2 - d.endAngle})
	  )
	  .attr('fill', d => color(d.data[0]))
	  .attr("stroke", "black")
	  .style("stroke-width", "2px")
	  .style("opacity", 0.7)

FRAME2.append('text').text('Origin to Destination (loading data)')
                .attr('x', -250)
                .attr('y', -150)
                .attr('fill', 'black')

FRAME2.append('text').text('x kg of CO2 (loading data)')
                .attr('x', 50)
                .attr('y', -150)
                .attr('fill', 'black')


