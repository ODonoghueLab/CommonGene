var Interactions = function (g, options) {
	var that = this;
	this.options = options;
	var x = 0;
	var y = 0;
//	var margin = {top: -5, right: -5, bottom: -5, left: -5},
	var zoom = d3.behavior.zoom()
    .scaleExtent([1, options.scaleExtent || 10])
    .on("zoom", zoomed);
//    .on("zoomstart", dragstarted)
//    .on("zoomend", dragended);

	this.force = d3.layout.force()
	.charge(options.charge || -120)
	.linkDistance(options.linkDistance || 30)
	.size([options.w, options.h]);

	this.g = g.append("g")
	 	.attr("width", options.w)
	    .attr("height", options.h)
	    .call(d3.behavior.zoom().on("zoom", rescale))
  	  	.append('svg:g')
//		    .on("mousemove", mousemove)
//		    .on("mousedown", mousedown)
//		    .on("mouseup", mouseup);

//		.call(this.force.drag);

//	zoom(g);
//	this.g.on("mousemove.zoom", null);	
	this.g.append("rect")
	    .attr("width", options.w)
	    .attr("height", options.h)
	    .attr("stroke", "transparent")
	    .attr("fill","transparent")
	    .attr("x", "0" )
	    .attr("y", "0")

	this.color = d3.scale.category20();


//	g.call(this.force.drag);
	
	function zoomed() {
	  if (d3.select(this).attr("cx") === null) {
//		  x = d3.event.translate.x;
//		  y = d3.event.translate.y;
//		  console.log(JSON.stringify(d3.event));
		  d3.select(this).attr("transform", "translate(" + ( d3.event.translate) + ")scale(" + (d3.event.scale) + ")");
//			  d3.event.sourceEvent.stopPropagation();
	  }
	  else {
//		  console.log(d3.select(this).attr("cx"));
	  }
	}

	// rescale g
	function rescale() {
	  trans=d3.event.translate;
	  scale=d3.event.scale;
//	  that.count = 0;
	  that.g.attr("transform",
	      "translate(" + trans + ")"
	      + " scale(" + scale + ")");
	}

	this.initialise([], []);
};

var keyFn = function(d) { return d.range ? d.range.id() : d.text; };

Interactions.prototype.initialise = function (nodes, links) {
	var that = this;
	this.g.html('');
	console.log('nodes: ' + nodes.length);
	that.linkData = that.g.selectAll(".link")
	  .data(links, keyFn);

	var link = that.linkData
 	.enter().append("line")
 	.attr("class", "link");
that.linkData.exit().transition().delay(1000).remove();

that.nodeData = that.g.selectAll("g")
  .data(nodes, keyFn);

var node = that.nodeData
.enter().append("g")
  .attr("class", "node")
  .call(that.force.drag);

that.nodeData.exit().transition().delay(1000).remove();

that.node = node;
that.link = link;
that.renderNode(node);
that.renderLink(link);

that.force.on("tick", function() {
 that.count++;
// console.log(' count: ' + that.count);
 if (that.count > that.data.nodes.length * 10) {
	 that.force.stop();
	 that.count = 0;
	 if (that.options.finalCollisionDetection) {
		 
		  var q = d3.geom.quadtree(that.data.nodes),
	      i = 0,
	      n = that.data.nodes.length;

		  while (++i < n) {
		    q.visit(collide(that.data.nodes[i]));
		  }
	 }
 }
 if (that.options.collisionDetection) {
	 
	  var q = d3.geom.quadtree(that.data.nodes),
      i = 0,
      n = that.data.nodes.length;

	  while (++i < n) {
	    q.visit(collide(that.data.nodes[i]));
	  }
 }
 	that.data.nodes.forEach (function (d) {
//		console.log(d.x + ', ' + d.y);
		d.x = Math.max(0, d.x);
		d.y = Math.max(0, d.y);
		d.x = Math.min(that.options.w, d.x);
		d.y = Math.min(that.options.h, d.y);
	});
//	
	link.attr("x1", function(d) { return d.source.x; })
	    .attr("y1", function(d) { return d.source.y; })
	    .attr("x2", function(d) { return d.target.x; })
	    .attr("y2", function(d) { return d.target.y; });

	 // Translate the groups
	  node.attr("transform", function(d) { 
	    return 'translate(' + [d.x, d.y] + ')'; 
	  });   
	});

}

Interactions.prototype.renderNode = function  (node) {
	console.log("TODO: Overwrite renderNode for subclass of abstract class Interactions");
}

Interactions.prototype.renderLink = function  (link) {
	console.log("TODO: Overwrite renderLink for subclass of abstract class Interactions");
}

Interactions.prototype.stop = function() {
	this.force.stop();
}

Interactions.prototype.start = function() {
	this.force.start();
}

Interactions.prototype.add = function(interactionsPromise) {
	var that = this;
	that.count = 0;
	that.force.nodes([]);
	that.force.links([]);
	that.force.stop();
	interactionsPromise.then(function (data) {
		if ($.isArray(data)) {
			data = data[0];
		}
		that.data = data;
		
		that.g.selectAll("g")
		  .data(data.nodes, keyFn);
		that.g.selectAll(".link")
		  .data(data.links, keyFn);

		that.initialise(data.nodes, data.links);
		that.force
//		  .stop()
		  .nodes(data.nodes)
		  .links(data.links)
//		  .start();
		
	   that.force.start();
	})

};



function collide(node) {
	  var r = node.radius + 16,
	      nx1 = node.x - r,
	      nx2 = node.x + r,
	      ny1 = node.y - r,
	      ny2 = node.y + r;
	  return function(quad, x1, y1, x2, y2) {
	    if (quad.point && (quad.point !== node)) {
	      var x = node.x - quad.point.x,
	          y = node.y - quad.point.y,
	          l = Math.sqrt(x * x + y * y),
	          r = node.radius + quad.point.radius;
	      if (l < r) {
	        l = (l - r) / l * .5;
	        node.x -= x *= l;
	        node.y -= y *= l;
	        quad.point.x += x;
	        quad.point.y += y;
	      }
	    }
	    return x1 > nx2
	        || x2 < nx1
	        || y1 > ny2
	        || y2 < ny1;
	  };
	}





module.exports = Interactions;