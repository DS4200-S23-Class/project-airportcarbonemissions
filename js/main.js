// Declare constants
const FRAME_HEIGHT = 400;
const FRAME_WIDTH = 800;
const MARGINS = { left: 70, right: 70, top: 70, bottom: 70 };

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

const JFK_COORDS = { lat: 40.6398, lon: -73.7789 }
const BOS_COORDS = { lat: 42.3643, lon: -71.0052 }


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

// select frame for future reference
const FRAME1 = d3.select("#airportvis")
	.select("svg");

// establish coords as variable for future reference
let coords;

// add points to map with d3
function plotMap(filter) {

	// set value of coords depending on filter
	if (filter == "JFK") {
		coords = JFK_COORDS;
	} else {
		coords = BOS_COORDS;
	}

	// set view of leaflet map based on filter
	map.setView([coords["lat"], coords["lon"]], 8);

	// remove all previously plotted points/lines
	FRAME1.selectAll("*")
		.remove();

	// add starting point (red dot)
	FRAME1.selectAll("startAirport")
		.data([coords])
		.enter()
		.append("circle")
			.attr("cx", function (d) { return map.latLngToLayerPoint([d.lat, d.lon]).x })
			.attr("cy", function (d) { return map.latLngToLayerPoint([d.lat, d.lon]).y })
			.attr("r", map.getZoom() * 0.75)
			.attr("fill", "red")
			.attr("fill-opacity", .5)
			.attr("stroke", "red")
			.attr("stroke-width", map.getZoom() * 0.25);

	// read csv file to add second round of points (green dots)
	d3.csv("data/finaloutput.csv").then((data) => {

		// filter the data such that the starting airport is based on filter
		filteredData = data.filter(function (row) {
			return row["from"] == filter;
		})

		// add points for all ending airports (green dots)
		FRAME1.selectAll("airportLocations")
			.data(filteredData)
			.enter()
			.append("circle")
				.attr("class", "airportLocations")
				.attr("cx", function (d) { return map.latLngToLayerPoint([d.lat, d.lon]).x })
				.attr("cy", function (d) { return map.latLngToLayerPoint([d.lat, d.lon]).y })
				.attr("r", map.getZoom() * 0.75)
				.attr("fill", "green")
				.attr("fill-opacity", .5)
				.attr("stroke", "green")
				.attr("stroke-width", map.getZoom() * 0.25)
				.attr("pointer-events", "visible")
			.on("click", handleClick)
			.on("mouseover", pointMouseover)
			.on("mouseout", pointMouseout);
	})
}

// function to handle highlighting (mouseover)
function pointMouseover(event, d) {
	d3.select(this).transition()
		.duration(150)
		.attr("fill", "limegreen")
		.attr("stroke", "limegreen")
		.attr("r", map.getZoom() * 1.25);
};

// function to handle removal of highlighting (mouseout)
function pointMouseout(event, d) {
	d3.select(this).transition()
		.duration(150)
		.attr("fill", "green")
		.attr("stroke", "green")
		.attr("r", map.getZoom() * 0.75);
};

// function to handle clicking of points
function handleClick(event, d) {

	// remove all previously existing lines
	FRAME1.selectAll("line")
		.remove();

	// create line that connects starting/ending point
	const LINE = FRAME1.append("line")
						.attr("x1", map.latLngToLayerPoint([d.lat, d.lon]).x)
						.attr("y1", map.latLngToLayerPoint([d.lat, d.lon]).y)
						.attr("x2", map.latLngToLayerPoint([coords.lat, coords.lon]).x)
						.attr("y2", map.latLngToLayerPoint([coords.lat, coords.lon]).y)
						.style("stroke", "blue")
						.style("stroke-width", 1.5 * Math.log(map.getZoom()));

	// editing coordinates when map is zoomed in/out
	function adjustLine() {
		LINE.attr("x1", map.latLngToLayerPoint([d.lat, d.lon]).x)
			.attr("y1", map.latLngToLayerPoint([d.lat, d.lon]).y)
			.attr("x2", map.latLngToLayerPoint([coords.lat, coords.lon]).x)
			.attr("y2", map.latLngToLayerPoint([coords.lat, coords.lon]).y);
	}

	// updating text to indicate ending airport
	document.getElementById("currentLocation").innerHTML = "You are currently looking at: " + d.name;

	// adding adjustment for line when map is moved
	map.on("moveend", adjustLine);

}

// function to update the coordinates of dots with zoom in/out
function update() {
	d3.selectAll("circle")
		.attr("cx", function (d) { return map.latLngToLayerPoint([d.lat, d.lon]).x })
		.attr("cy", function (d) { return map.latLngToLayerPoint([d.lat, d.lon]).y })
		.attr("r", map.getZoom() * 0.75);
}

// function to change filters depending on dropdown selected
function changeMap() {
	let start_airport = document.getElementById("start-airport");
	let selectedValue = start_airport.options[start_airport.selectedIndex].value;
	plotMap(selectedValue);
}

// update coordinates of dots with zoom
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
const data = { a: 9 }
data.b = 100 - data.a


// set the color scale
const color = d3.scaleOrdinal()
	.range(["#287AB8", "transparent"])


// Compute the position of each group on the pie:
const pie = d3.pie()
	.value(d => d[1])

// Compute the position of each group on the pie:
const data_ready = pie(Object.entries(data))

let arc = d3.arc()
	.outerRadius(radius)
	.innerRadius(70)
	.startAngle(function (d) { return Math.PI * 2 - d.startAngle })
	.endAngle(function (d) { return Math.PI * 2 - d.endAngle });

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
FRAME2.selectAll('percentage')
	.data(data_ready)
	.join('path')
	.attr('d', arc)
	.attr("stroke", "black")
	.style("stroke-width", "1px")
	.attr('fill', "transparent")

// animation for donut portion
FRAME2.selectAll(".arc")
	.data(data_ready)
	.enter()
	.append("g")
	.attr("class", "arc")
	.append("path")
	.style("fill", function (d) { return color(d.data[0]) })
	.style("opacity", 0.5)

	.transition().delay(function (d, i) { return i * 500; }).duration(500)
	.attrTween('d', function (d) {
		var i = d3.interpolate(d.endAngle, d.startAngle);
		return function (t) {
			d.startAngle = i(t);
			return arc(d)
		}
	})


FRAME2.append('text').text('Origin to Destination (loading data)')
	.attr('x', -250)
	.attr('y', -150)
	.attr('fill', 'black')

FRAME2.append('text').text('x kg of CO2 (loading data)')
	.attr('x', 50)
	.attr('y', -150)
	.attr('fill', 'black')


