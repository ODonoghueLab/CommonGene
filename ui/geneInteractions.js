var Interactions = require('./interactions');

var GeneInteractions = function (g, options) {
	Interactions.call(this, g, options);
}

GeneInteractions.prototype.renderNode = function  (node) {
	
	node.append("text")
    .attr("dx", function(d){return -20})
	    .attr("class", "ntext")
    .text(function(d){return d.text})

	var circle = node.append('circle')
	  .attr("class", "ncircle")
	  .attr("r", 9)
	  .style("fill", '#f33');
//	  .style("fill", function(d) { return color(d.type); })
//	  .call(that.force.drag, false);

	circle.append("title")
	  .text(function(d) { return d.text; });
};

GeneInteractions.prototype.renderLink = function  (link) {
    link.style("stroke", function(d) { return that.color(d.type); })
	  .style("stroke-width", function(d) { return Math.sqrt(d.value) / 5; });

	link.append("title")
	  .text(function(d) {
		  return [d.type, d.source.text + '(' + d.source.id + ')', d.target.text + '(' + d.target.id + ')'].join(','); 
	  });
};



GeneInteractions.prototype = Object.create(Interactions.prototype);
GeneInteractions.prototype.constructor = GeneInteractions;
module.exports = GeneInteractions;