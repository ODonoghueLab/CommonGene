//var d3 = require('d3-browserify');
//var d3Cloud = require('../lib/d3-cloud/d3.layout.cloud');

var WordCloud = function(svg, wordEntries, w, h, fill) {
	var that = this;
	var originalData = wordEntries;
	that.fill = fill || d3.scale.category20b();
	this.HEADING_Y = 75;
	that.w = w || svg.attr("width");
	that.h = h || svg.attr("height");
	that.clickListeners = [];

	var HOME= {
		initialX : -that.w / 2,
		initialY : -that.h / 2 + this.HEADING_Y / 2,
		text : 'HOME',
		size : 21,
		x : 0,
		y : 0,
		breadcrumbLevel : 0
	};
	that.stack = [HOME];
	

	that.background = svg.append("g").attr('class', 'wordcloud');
	that.vis = svg.append("g").attr("transform",
			"translate(" + [ that.w >> 1, that.h >> 1 ] + ")");
	that.vis.append('defs').append('marker').attr( {
	        id:"arrowhead",
	        orient: "auto",
	        markerWidth: "2",
	        markerHeight: "4",
	        refX: '0.1',
	        refY: '2'
	    }).append('path').attr({
			d: 'M0,0 V4 L2,2 Z',
			fill: '#555555'
		});

	that.popBreadcrumb = function () {
		var i = that.stack.length - 1;
		var oldValue = that.stack[i]; 
		clearValue(oldValue);
		layout.stop().words(that.stack).rotate(0).fontSize(20).start();
		that.stack.pop();
	}
	
	var clearValue = function (oldValue) {
		delete oldValue.breadcrumbLevel;
		delete oldValue.initialX;
		delete oldValue.initialY;
		oldValue.size = oldValue.originalSize;
		delete oldValue.originalSize;
		delete oldValue.sprite;
	}
	
//	that.vis
//	.append("defs")
//	.html(
//			"<marker id='head' orient='auto' markerWidth='2' markerHeight='4' refX='0.1' refY='2'><!-- triangle pointing right (+x) --><path d='M0,0 V4 L2,2 Z' fill='red'/></marker>");

	that.pushBreadcrumb = function (word) {
		word.initialX = 0;
		word.initialY = -that.h / 2 + this.HEADING_Y / 2;
		word.x = 0;
		word.y = 0;
		word.breadcrumbLevel =  that.stack.length;
		word.originalSize = word.size;
		word.size = 20;
		delete word.yoff;
		that.stack.push(word);
		layout.stop().words(that.stack).rotate(0).fontSize(20).start();

		
	}
	var text;
	var layout;
	var clickPressed = function(word) {
		var i;
		var breadcrumbId = -1;
		for (i = 0; i < that.stack.length; i++) {
			if (word === that.stack[i]) {
				breadcrumbId = i + 1;
				
			}
			else if (breadcrumbId > -1) {
				clearValue(that.stack[i]);
			} 
		}
		if (breadcrumbId > -1) {
			that.stack = that.stack.slice(0, breadcrumbId);
			if (word.text === 'HOME') {
				layout.stop().words(originalData).rotate(oldRotate).fontSize(oldFontSize).start();
			}
			else {
				layout.stop().words(that.stack).rotate(0).fontSize(20).start();
			}

		}
		else {
			that.pushBreadcrumb(word);
		}

		that.clickListeners.forEach(function(listener) {
			listener(word, that.stack);
		});
	}

	var draw = function(data, bounds) {
		// statusText.style("display", "none");
		var tempBreadcrumb = []
		data.forEach(function(item) {
			if (typeof item.breadcrumbLevel !== 'undefined') {
				tempBreadcrumb[item.breadcrumbLevel] = item;
			}
		});
		var SPACER = 75;
		var totalWidth = tempBreadcrumb.reduce(function(previous, currentItem) {
			currentItem.x = previous - currentItem.x0 ;
			var y = 0 - that.h / 2 + currentItem.height ;
			currentItem.y = y;
//			if (previous !== 0) {
				// draw arrow from previous
				var x1 = previous - SPACER ;
				var x2 = currentItem.x + currentItem.x0 ;
				y -= currentItem.y1 / 2;
				var line = that.vis.append("line")
				  .attr("id",'arrow-line2')
				  .attr("marker-end", 'url(#arrowhead)')
				  .attr("stroke-width", '3')
				  .attr("fill",'none')
				  .attr("stroke", '#777777')
				  .style("opacity", 1e-6)
				  .attr("x1", x1)
				  .attr("y1",y)
				  .attr("x2", x2 )
				  .attr("y2", y)
				  
				line.transition().delay(400).duration(500).style("opacity", 1);
				console.log('line: ' + [x1, x2, y, JSON.stringify(currentItem)]);  
//			}
			return currentItem.x + currentItem.x1 + SPACER;
		}, - that.w / 2);
		// bounds[1].x = Math.max()
		var scale = bounds ? Math.min(that.w
				/ Math.abs(bounds[1].x - that.w / 2), that.w
				/ Math.abs(bounds[0].x - that.w / 2), that.h
				/ Math.abs(bounds[1].y - that.h / 2), that.h
				/ Math.abs(bounds[0].y - that.h / 2)) / 2 : 1;
		scale = 1;
		words = data;
		text = that.vis.selectAll("text").data(words, function(d) {
			return d.text.toLowerCase();
		});
		text.transition().duration(500).attr("transform", function(d) {
			return "translate(" + [ d.x, d.y ] + ")rotate(" + d.rotate + ")";
		}).style("font-size", function(d) {
			return d.size + "px";
		});
		text.enter().append("text").attr("text-anchor", "middle").attr(
				"transform",
				function(d) {
					return "translate(" + [ d.x, d.y ] + ")rotate(" + d.rotate
							+ ")";
				}).style("font-size", function(d) {
			return d.size + "px";
		}).on(
				"click",
				function(d) {
					clickPressed(d);
				}).style("opacity", 1e-6).transition().duration(1000).style(
				"opacity", 1);
		text.style("font-family", function(d) {
			return d.font;
		}).style("fill", function(d) {
			return that.fill(d.text.toLowerCase());
		}).text(function(d) {
			return d.text;
		});
		var exitGroup = that.background.append("g").attr("transform",
				that.vis.attr("transform"));
		var exitGroupNode = exitGroup.node();
		text.exit().each(function() {
			exitGroupNode.appendChild(this);
		});
		if (that.stack.length === 1) {
			that.vis.selectAll("line").transition().duration(500).style("opacity", 1e-6).remove();
		}
		exitGroup.transition().duration(500).style("opacity", 1e-6).remove();
		that.vis.transition().delay(500).duration(400).attr(
				"transform",
				"translate(" + [ that.w >> 1, that.h >> 1 ] + ")scale(" + scale
						+ ")");
	}

	var layout = d3.layout.cloud().size([ that.w, that.h ]).words(wordEntries)
			.padding(5)
			// .rotate(function(d) { return ~~(Math.random() * 5) * 30 - 60; })
			// .rotate(function() { return ~~(Math.random() * 2) * 90; })
			.text(function(d) {
				return d.text;
			}).font("Impact").fontSize(function(d) {
				return d.size;
			}).timeInterval(10).on("end", draw).start();

	var oldRotate = layout.rotate();
	var oldFontSize = layout.fontSize();
	// var layout = d3.layout.cloud()
	// .timeInterval(10)
	// .size([w, h])
	// .fontSize(function(d) { return fontSize(+d.value); })
	// .text(function(d) { return d.key; })
	// .on("word", progress)
	// .on("end", draw);

	that.addClickListener = function(listener) {
		that.clickListeners.push(listener);
	}

	var drawArrows = function(data, bounds) {
		console.log('data is : ' + JSON.stringify(data));
	};

	var xPosition = function(d) {

	}
	
	this.remove = function() {
		svg.select('.wordcloud').remove();
	}

	this.drawBreadcrumb = function() {

		var breadcrumbWords = [ home ];

		that.stack.forEach(function(stackWord, i) {
			word.initialX = 0;
			word.initialY = -that.h / 2 + this.HEADING_Y / 2;
			word.x = 0;
			word.y = 0;
//			word.breadcrumbLevel = i + 1;
//			word.x0 = 0;
//			word.y0 = 0;
//			word.y1 = 0;
			word.size = 20;
			delete word.yoff;
		})

		layout.stop().words([ home, word ]).rotate(0).fontSize(20).on("end",
				drawArrows).start();
	}

}

module.exports = WordCloud;