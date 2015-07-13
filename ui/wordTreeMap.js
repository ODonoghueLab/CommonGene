var WordTreeMap = function (svg, data, options, clickCallback) {
	var treemap = d3.layout.treemap()
    .size([options.w, options.h])
    .children(function(d) { return d.children; })
    .value(function(d) { return d.size; })
    .sticky(true);
	var root = [{
			children: data,
			size: 100,
			text: 'root'
	}];
	this.g = svg.append("g")
	  	.attr('class', 'jellytreemap jellypage')

//    .attr("transform", "translate(-.5,-.5)");
//	var entries = d3.entries(data);
	var entries = root;
  var cell = this.g.data(entries).selectAll("g")
      .data(treemap)
    .enter().append("g")
//    .filter(function(d){ return d.depth == 1 ? 1 : 0;})
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  cell.append("svg:rect")
      .attr("width", function(d) { return d.dx; })
      .attr("height", function(d) { return d.dy; })
      .attr('id', function (d) { return d.text; })
      .style("fill", function(d) { return options.fill(d.text); })
      .on("click", clickCallback);
  
  cell.append("svg:text")
       .attr("x",0)
       .attr("dx", "0.35em")
       .attr("dy", "0.9em") 
      .attr('id', function (d) { return d.text; })
//      .each(fontSize)
      .each(wordWrap)
      .on("click", clickCallback)
	
//  this.g.selectAll(".cell text")
//  	.call(wrap, cell)
  
}




function fontSize(d,i) {
var size = d.dx/5;
var words = d.text.split(' ');
var word = words[0];
var width = d.dx;
var height = d.dy;
var length = 0;
d3.select(this).style("font-size", size + "px").text(word);
while(((this.getBBox().width >= width) || (this.getBBox().height >= height)) && (size > 12))
 {
  size--;
  d3.select(this).style("font-size", size + "px");
  this.firstChild = word;
 }
}

function wrap(text, cell) {
	var width = cell.dx;
	  text.each(function() {
	    var text = d3.select(this),
	        words = text.text().split(/\s+/).reverse(),
	        word,
	        line = [],
	        lineNumber = 0,
	        lineHeight = 1.1, // ems
	        y = text.attr("y"),
	        dy = parseFloat(text.attr("dy")),
	        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
	    while (word = words.pop()) {
	      line.push(word);
	      tspan.text(line.join(" "));
	      if (tspan.node().getComputedTextLength() > width) {
	        line.pop();
	        tspan.text(line.join(" "));
	        line = [word];
	        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
	      }
	    }
	  });
	}

function wordWrap(d, i){
var words = d.text.split(' ');
var line = new Array();
var length = 0;
var text = "";
var width = d.dx;
var height = d.dy;
var word;
do {
   word = words.shift();
   line.push(word);
   if (words.length)
     this.firstChild = line.join(' ') + " " + words[0]; 
   else
     this.firstChild = line.join(' ');
   length = this.getBBox().width;
   if (length < width && words.length) {
     ;
   }
   else {
     text = line.join(' ');
     this.firstChild = text;
     if (this.getBBox().width >= width) { 
       text = d3.select(this).select(function() {return this.lastChild;}).text();
       text = text + "<br>";
       d3.select(this).select(function() {return this.lastChild;}).text(text);
       d3.select(this).classed("wordwrapped", true);
//       break;
    }
    else
      ;

  if (text != '') {
    d3.select(this).append("svg:tspan")
    .attr("x", 0)
    .attr("dx", "0.15em")
    .attr("dy", "0.9em")
    .html(text);
  }
  else
     ;

  if(this.getBBox().height > height && words.length) {
     text = d3.select(this).select(function() {return this.lastChild;}).text();
     text = text + "...";
     d3.select(this).select(function() {return this.lastChild;}).text(text);
     d3.select(this).classed("wordwrapped", true);

     break;
  }
  else
     ;

  line = new Array();
    }
  } while (words.length);
  this.firstChild.data = '';
} 


module.exports = WordTreeMap;