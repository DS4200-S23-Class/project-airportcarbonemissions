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

/*

const FRAME1 = d3.select("#airportvis") 
					.append("svg")
						.attr("height", FRAME_HEIGHT)
						.attr("width", FRAME_WIDTH)
						.attr("class", "world-map");

// Plot world map using d3 projection
var projection = d3.geoNaturalEarth1()
					.scale(FRAME_WIDTH / 5.5)
    				.translate([FRAME_WIDTH / 2, FRAME_HEIGHT / 2]);;

var path = d3.geoPath()
    	.projection(projection);

// Add world map to frame
FRAME1.selectAll("path")
		.append("path")
		.attr("class", "sphere")
		.attr("d", path({type: "Sphere"}));

// Read maps json file to add the world map svgs
d3.json("js/maps.json")
	  .then(data => {
		const countries = topojson.feature(data, data.objects.countries);
		FRAME1.selectAll("path").data(countries.features)
		  		.enter()
				.append("path")
				.attr("class", "country")
				.attr("d", path);
	  });

// Add points for each individual location
d3.csv("data/finaloutput.csv").then((data) => {
	FRAME1.selectAll("locations")
			.data(data)
			.enter()
			.append("circle")
				.attr("cx", function(d) { return projection([d["lon"],d["lat"]])[0];})
				.attr("cy", function(d) { return projection([d["lon"],d["lat"]])[1];})
				.attr("r", 2)
				.attr("fill", "red")
})

*/

// Frame2: carbon emissions
const FRAME2 = d3.select("#carbonvis")
		          		.append("svg")
		            		.attr("height", FRAME_HEIGHT)
		            		.attr("width", FRAME_WIDTH)
		            		.attr("class", "scatter-width");

// function for builidng scatter plot (Sepal_length vs. Petal_Length)
//function createvis(){

	//d3.csv("data/finaloutput.csv").then((data) => {
	//};

// call the functions

