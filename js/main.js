// Declare constants
const FRAME_HEIGHT = 400;
const FRAME_WIDTH = 800;
const FRAME_HEIGHT2 = 400;
const FRAME_WIDTH2 = 500;
const MARGINS = { left: 70, right: 70, top: 70, bottom: 70 };

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

const SCALE = d3.scaleLinear()
				.domain([0, 30])
				.range([0.5, 7])


// Frame1: airport 
// initialize background map with leaflet
let map = L.map("airportvis").setView([0, 0], 2);

// add tile layer with leaflet
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
	minZoom: 2,
	maxZoom: 10,
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
		// print data to console
		console.log(data)

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
			.on("mousemove", pointMousemove)
			.on("mouseout", pointMouseout);
	});
};

// create tooltip
const TOOLTIP = d3.select("#airportvis")
			.append("div")
			.attr("class", "tooltip")
			.style("z-index", "999");

// function to handle highlighting (mouseover)
function pointMouseover(event, d) {
	d3.select(this).transition()
		.duration(150)
		.attr("fill", "limegreen")
		.attr("stroke", "limegreen")
		.attr("r", map.getZoom() * 1.25);
	TOOLTIP.style("opacity", 1);
};

// add text to tooltip with more info + set position
function pointMousemove(event, d) {
	TOOLTIP.html("<b>" + d.name + " (" + d.iata + ")" + "</b><br>Distance from Start: " + d.dist + "<br>Average Daily Flights: " + d.averageDailyFlights + 
				"<br>Coordinates: (" + d.lon + ", " + d.lat + ")")
			.style("left", map.latLngToLayerPoint([d.lat, d.lon]).x + "px")
			.style("top", map.latLngToLayerPoint([d.lat, d.lon]).y + "px");
}

// function to handle removal of highlighting (mouseout)
function pointMouseout(event, d) {
	d3.select(this).transition()
		.duration(150)
		.attr("fill", "green")
		.attr("stroke", "green")
		.attr("r", map.getZoom() * 0.75);
	TOOLTIP.style("opacity", 0)
	
};

// function to handle clicking of points
function handleClick(event, d) {

	// remove all previously existing lines
	FRAME1.selectAll("line")
		.remove();

	FRAME2.selectAll("*")
		.remove();

	// create line that connects starting/ending point
	const LINE = FRAME1.append("line")
						.attr("x1", map.latLngToLayerPoint([d.lat, d.lon]).x)
						.attr("y1", map.latLngToLayerPoint([d.lat, d.lon]).y)
						.attr("x2", map.latLngToLayerPoint([coords.lat, coords.lon]).x)
						.attr("y2", map.latLngToLayerPoint([coords.lat, coords.lon]).y)
						.attr("opacity", 0.5)
						.style("stroke", "blue")
						.style("stroke-width", (10.1 - map.getZoom()) * SCALE(d.averageDailyFlights));

	// editing coordinates when map is zoomed in/out
	function adjustLine() {
		LINE.attr("x1", map.latLngToLayerPoint([d.lat, d.lon]).x)
			.attr("y1", map.latLngToLayerPoint([d.lat, d.lon]).y)
			.attr("x2", map.latLngToLayerPoint([coords.lat, coords.lon]).x)
			.attr("y2", map.latLngToLayerPoint([coords.lat, coords.lon]).y);
	};

	// updating text to indicate ending airport
	document.getElementById("currentLocation").innerHTML = "You are currently looking at flight to " + d.name;

	// adding adjustment for line when map is moved
	map.on("moveend", adjustLine);


	// add metrics
	document.getElementById("distance").innerHTML = d.from + " to " + d.iata + ' will emit ' + d.co2KGPerPerson + ' kg of CO2 per passenger';

	document.getElementById("house").innerHTML = Math.round(d.co2KGPerPerson/HOME*100)/100 + ' days';

	document.getElementById("drive").innerHTML = Math.round(d.co2KGPerPerson/CAR*100)/100 + ' miles';

	document.getElementById("burger").innerHTML = Math.round(d.co2KGPerPerson/BURGER*100)/100 + ' burgers';

	document.getElementById("tree").innerHTML = Math.round(d.co2KGPerPerson/TREE*100)/100 + ' trees';


	// create donut chart
	donut_chart(d.percentageco2);

};

// function to update the coordinates of dots with zoom in/out
function update() {
	d3.selectAll("circle")
		.attr("cx", function (d) { return map.latLngToLayerPoint([d.lat, d.lon]).x })
		.attr("cy", function (d) { return map.latLngToLayerPoint([d.lat, d.lon]).y })
		.attr("r", map.getZoom() * 0.75);
};

// function to change filters depending on dropdown selected
function changeMap() {
	let start_airport = document.getElementById("start-airport");
	let selectedValue = start_airport.options[start_airport.selectedIndex].value;
	plotMap(selectedValue);
};

// update coordinates of dots with zoom
map.on("moveend", update);


// Frame2: carbon emissions
const FRAME2 = d3.select("#carbonvis")
	.append("svg")
	.attr("height", FRAME_HEIGHT2)
	.attr("width", FRAME_WIDTH2)
	.attr("class", "carbon-emi")
	.append("g")
	.attr("transform", `translate(${FRAME_WIDTH2 / 2},${FRAME_HEIGHT2 / 2})`);


const radius = Math.min(FRAME_WIDTH2, FRAME_HEIGHT2) / 1.65 - MARGINS.left;

function donut_chart(d) {
	// remove the last chart
	FRAME2.selectAll('.arc')
			.remove()

	FRAME2.selectAll('path')
			.remove()

	// load data
	const data = {a: d};
	data.b = 100 - data.a;

	// set the color scale
	const color = d3.scaleOrdinal()
		.range(["#287AB8", "transparent"]);

	// Compute the position of each group on the pie:
	const pie = d3.pie()
		.value(d => d[1]);

	// Compute the position of each group on the pie:
	const data_ready = pie(Object.entries(data));

	let arc = d3.arc()
		.outerRadius(radius)
		.innerRadius(radius*0.5)
		.startAngle(function (d) {return Math.PI * 2 - d.startAngle})
		.endAngle(function (d) {return Math.PI * 2 - d.endAngle});


	// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
	FRAME2.selectAll('percentage')
		.data(data_ready)
		.join('path')
		.attr('d', arc)
		.attr("stroke", "black")
		.style("stroke-width", "1px")
		.attr('fill', "transparent");

	// animation for donut portion
	FRAME2.selectAll(".arc")
		.data(data_ready)
		.enter()
		.append("g")
		.attr("class", "arc")
		.append("path")
		.style("fill", function (d) {return color(d.data[0])})
		.style("opacity", 0.5)
			.transition().delay(function (d, i) {return i * 500}).duration(500)
				.attrTween('d', function (d) {
					let i = d3.interpolate(d.endAngle, d.startAngle);
					return function (t) {
						d.startAngle = i(t)
						return arc(d);
					};
				});



	// Another arc that won't be drawn. Just for labels positioning.
	let outerArc = d3.arc()
	  .innerRadius(radius * 0.9)
	  .outerRadius(radius * 0.9)


	// Add the labels for percentage
	FRAME2.selectAll('allPolylines')
	  .data(data_ready)
	  .enter()
	  .filter(function(d) {
	    return d.index == 1 && d.value < 6;
	  })
	  .append('polyline')
	    .attr("stroke", "black")
	    .style("fill", "none")
	    .attr("stroke-width", 1)
	    .attr('points', function(d) {
	      let posA = arc.centroid(d) // line insertion in the slice
	      let posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
	      let posC = outerArc.centroid(d); // Label position = almost the same as posB
	      let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
	      posB[0] = posB[0] * -1
	      posC[0] = radius * 0.8;
	      return [posA, posB, posC]
	    });

  FRAME2.selectAll("allLabels")
    .data(data_ready)
    .enter()
	.filter(function(d) {
	    return d.index == 1 && d.value < 6;
	  })
    .append("text")
    .attr('transform', function(d) {
	    let pos = arc.centroid(d);
	    pos[0] = radius * 0.83;
	    pos[1] = pos[1] - 20;
	    return 'translate(' + pos + ')';
	  })
    .text(function(d) {
	return Math.round(d.value * 100) / 100 + '%';
	})

  FRAME2.selectAll("allLabels")
    .data(data_ready)
    .enter()
	.filter(function(d) {
	    return d.index == 1 && d.value > 6;
	  })
    .append("text")
    .attr('transform', function(d) {
	    let pos = arc.centroid(d);
	    pos[0] = pos[0] - 20;
	    return 'translate(' + pos + ')';
	  })
    .text(function(d) {
	return Math.round(d.value * 100) / 100 + '%';
	})



};
