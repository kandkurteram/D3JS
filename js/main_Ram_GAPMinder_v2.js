/*
*    main.js
*    Mastering Data Visualization with D3.js
*    5.10.0: Create the famous GAPMinder Scatter plot
*/

var margin = { left:80, right:20, top:50, bottom:100 };
var ChartHeight = 500 - margin.top - margin.bottom;
var ChartWidth = 800 - margin.left - margin.right;
var interval;
var formattedData;

var g = d3.select("#chart-area")
    .append("svg")
        .attr("width", ChartWidth + margin.left + margin.right)
        .attr("height", ChartHeight + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + 
            ", " + margin.top + ")");
    

//Scales
var x = d3.scaleLog()
    .base(10)
    .domain([142, 150000])
    .range([0, ChartWidth]);
var y = d3.scaleLinear()
    .domain([0, 90])
    .range([ChartHeight, 0]); 
var area = d3.scaleLinear()
    .range([25*Math.PI, 1500*Math.PI])
    .domain([2000, 1400000000]);
var continentColor = d3.scaleOrdinal(d3.schemeCategory10);

//Labels
//X Axis Label
var xLabel = g.append("text")
    .attr("y", ChartHeight + 50)
    .attr("x", ChartWidth / 2)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("GDP Per Capita ($)");
//Y Axis Label
var yLabel = g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("x", -170)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Life Expectancy (Years)")
var timeLabel = g.append("text")
    .attr("y", ChartHeight -10)
    .attr("x", ChartWidth - 40)
    .attr("font-size", "40px")
    .attr("opacity", "0.4")
    .attr("text-anchor", "middle")
    .text("1800");

//X Axis
var xAxisCall = d3.axisBottom(x)
    .tickValues([400, 4000, 40000])
    .tickFormat(d3.format("$"));

g.append("g")
    .attr("class", "BottomAxis")
    .attr("transform", "translate(0, " + ChartHeight + ")")
    .call(xAxisCall);

//Y Axis
var yAxisCall = d3.axisLeft(y)
    .tickFormat(function(d){ return +d; });

g.append("g")
    .attr("class", "LeftAxis")
    .call(yAxisCall);


//Adding Legend
var continents = ['americas', 'europe', 'asia', 'africa'];
var legend = g.append("g")
            .attr("transform", "translate(" + (ChartWidth - 20) + ", " + (ChartHeight - 120) + ")");

continents.forEach(function(continent, i) {
    g.append("rect")
    .attr("x", 5)
    .attr("y", 10*i*1.5)
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", continentColor(continent))
    
    g.append("text")
    .attr("x", 20)
    .attr("y", 10*i*1.5 + 7 )
    // .attr("height", 10)
    .text(continent)
    .attr("font-size", "10px")
    .attr("text-anchor", "top")
    .style("text-transform", "capitalize")
}); 
var time = 0;

tip = d3.tip()
    .attr("class", "d3-tip")
    .html(function(d) {
                        tipText = "Country: " + d.country + 
                                  "<br> Continent: <span style=text-transform:Capitalize>" +  d.continent + "</span>" +
                                  "<br> Population: " + d3.format(",.0f")(d.population) +
                                  "<br> Life Expectancy (Yrs): " + d.life_exp + 
                                  "<br> GDP Per Capita ($): " + d3.format("$,.0f")(d.income);

                        return tipText;
                      });

g.call(tip);

d3.json("data/data.json").then(function(data){
    console.log(data);   

 formattedData = data.map(
                                    function(year) {
                                                    return year["countries"].filter(function(country) {
                                                                                                        var dataExists = (country.income && country.life_exp);
                                                                                                        return dataExists;
                                                    }).map(function(country) {
                                                                                country.income = +country.income;
                                                                                country.life_exp = + country.life_exp;
                                                                                return country;
                                                    }

                                                    )
                                    }
    );
    

// d3.interval(function(){
//                         time = (time < 214 ? time + 1 : 0);
//                         update(formattedData[time]);
// }, 100);

});

$("#play-button")
.on("click", function() {
    var button = $(this);
    if (button.text()=="Play")
    {
        button.text("Pause");
        interval = setInterval(step, 200);
    }
    else{
        button.text("Play");
        clearInterval(interval);
    }
}
   )

$("#reset-button")
.on("click", function() {
    time = 0;
    update(formattedData[0]);
}
   )

$("#continent-select")
.on("change", function() {
    update(formattedData[time]);
})

$("#date-slider").slider(
    {
    max: 2014,
    min: 1800,
    step: 1,
    value: 1,
    slide: function(event, ui) {
        time = ui.value-1800;
        update(formattedData[time]);
    }
})

// $("#date-slider").slider({
//     max: 2014,
//     min: 1800,
//     step: 1,
//     slide: function(event, ui){
//         time = ui.value - 1800;
//         update(formattedData[time]);
//     }
// })

function step() {
                time = (time < 214 ? time + 1 : 214);
                update(formattedData[time]);
                };

function update(data) {
    var t = d3.transition().duration(100);
    var continent = $("#continent-select").val();

    var data = data.filter(function(d){
        if(continent == "all") {return true;}
        else {return d.continent == continent;}
    });

    //join
    var circles = g.selectAll("circle")
        .data(data,function(d) {return d.country;});

    //exit
    circles.exit()
    .attr("class", "Exit")
    .remove();

    //enter
    circles.enter()
    .append("circle")
    .attr("class", "Enter")
    .attr("fill", function(d) {return continentColor(d.continent);})
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide)
    .merge(circles)
    .transition(t)
        .attr("cx", function(d) {return x(d.income);})
        .attr("cy", function(d) {return y(d.life_exp);})
        .attr("r", function(d) {return Math.sqrt(area(d.population)/Math.PI);});

    timeLabel.text(1800 + time);
    $("#year")[0].innerHTML = +(time + 1800)
    $("#date-slider").slider("value", (time + 1800));
};
