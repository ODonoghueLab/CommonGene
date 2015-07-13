var colorUtils = require('../utils/color');
var format = require('../utils/format');
var isIE = false;
var baseColor = d3.scale.category20();

//var baseColor = function (name) {
//	return '#999999';
//}

var TreeMap = function (divName, options) {
	
	options = options || {};
	this.divName = divName;
	this.chartWidth = options.width || window.innerWidth;
	this.chartHeight = options.height || window.innerHeight;
	this.hoverCallback = options.hoverCallback;
	this.xscale = d3.scale.linear().range([0, this.chartWidth]);
	this.yscale = d3.scale.linear().range([0, this.chartHeight]);
	this.headerHeight = 20;
	this.headerColor = function (d) {
		var c = baseColor(d.name);
//		console.log('d,c: ' + [d,c]);
		return c;
	}
	this.transitionDuration = 500;
	this.root;
	this.node;
	
	this.treemap = d3.layout.treemap()
    .round(false)
    .size([this.chartWidth, this.chartHeight])
    .sticky(false)
    .value(function(d) {
        return Math.min(300, d.size);
    });

	
	this.chart = d3.select("#"  + divName)
	    .append("svg:svg")
	    .attr('id', this.divName + '_svg')
	    .attr("width", this.chartWidth)
	    .attr("height", this.chartHeight)
	    .append("svg:g");
}

TreeMap.prototype.size = function (width, height) {
	this.chartWidth = width;
	this.chartHeight = height;
	this.xscale = d3.scale.linear().range([0, this.chartWidth]);
	this.yscale = d3.scale.linear().range([0, this.chartHeight]);
	this.treemap.size([this.chartWidth, this.chartHeight]);
	this.chart = d3.select("#"  + this.divName + '_svg')
    .attr("width", this.chartWidth)
    .attr("height", this.chartHeight)
    this.load();
}


TreeMap.prototype.color = function (data, isParent) {
	var color = baseColor(data);
	if (!isParent) {
		color = '#333';
//		color = colorUtils.adjustToBrightness(color, 0.95);
	}
//	else if(type == 'dark') {
////		color = colorUtils.adjustToBrightness(color, 0.05);
//		color = '#000000';
//	}
//	console.log('data, color:, type' + [data, color]);
	return color;
}


TreeMap.prototype.load = function (data) {
	var that = this;
	data = data || that.root;
    that.node = that.root = data;
    

    var nodes = that.treemap.nodes(that.root);

    var children = nodes.filter(function(d) {
        return !d.children;
    });
    var parents = nodes.filter(function(d) {
        return d.children;
    });

    // create parent cells
    var parentCells = that.chart.selectAll("g.cell.parent")
        .data(parents, function(d) {
            return "p-" + d.name;
        });
    var parentEnterTransition = parentCells.enter()
        .append("g")
        .attr("class", "cell parent")
        .on("click", function(d) {
            that.zoom(d);
        });
    parentEnterTransition.append("rect")
        .attr("width", function(d) {
            return Math.max(0.01, d.dx);
        })
        .attr("height", function(d) { return d.dy; })
        .style("fill", that.headerColor)
//        .attr('title', function(d) {
//	        return d.name;
//	    });

    parentEnterTransition.append('foreignObject')
        .attr("class", "foreignObj")
        .append("xhtml:body")
        .attr("class", "labelbody")
        .append("div")
        .attr("class", "label");
    // update transition
    var parentUpdateTransition = parentCells.transition().duration(that.transitionDuration);
    parentUpdateTransition.select(".cell")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    parentUpdateTransition.select("rect")
        .attr("width", function(d) {
            return Math.max(0.01, d.dx);
        })
        .attr("height", function(d) { return d.dy; })
        .style("fill", that.headerColor);
    parentUpdateTransition.select(".foreignObj")
//    	.attr("x", function (d) {return d.x; })
//        .attr("y", function (d) {return d.y; })
        .attr("width", function(d) {
            return Math.max(0.01, d.dx);
        })
        .attr("height", function(d) { return d.dy; })
        .select(".labelbody .label")
        .text(function(d) {
            return d.name;
        })
    // remove transition
    parentCells.exit()
        .remove();

    // create children cells
    var childrenCells = that.chart.selectAll("g.cell.child")
        .data(children, function(d) {
            return "c-" + d.name;
        });
    // enter transition
    var childEnterTransition = childrenCells.enter()
        .append("g")
        .attr("class", "cell child")
        .on("click", function(d) {
            that.zoom(that.node === d.parent ? that.root : d.parent);
        });
    childEnterTransition.append("rect")
        .classed("background", true)
        .style("fill", function(d) {
            return that.color(d.parent.name, d.parent === that.root);
        })
        

    childEnterTransition.append('foreignObject')
        .attr("class", "foreignObj")
        .attr("width", function(d) {
            return Math.max(0.01, d.dx);
        })
        .attr("height", function(d) {
            return Math.max(0.01, d.dy);
        })
//        .attr('title', function(d) {
//	        return d.name + " (P-Value of " + Math.pow(10, -d.size) + ")";
//	    })
        .append("xhtml:body")
        .attr("class", "labelbody")
        .append("div")
//        .style('display', 'table')
//        .append("span")
//        .style('display', 'table-cell')
//        .style('vertical-align', 'middle')
//        .style('height', function (d) {return d.dy + "px"})
        .attr("class", "label")
        .html(function(d) {
	        var ret = d.name;
	        if (d.size) {
	        	var log;
	        	if (d.size <300) {
		        	log = Math.pow(10, -d.size);
		        	var equality = '='; 
	        		
		        	ret += "<p style='font-size: 10px; text-align: center;'>(p " + equality + " " + format.sciFormat(log, 1) + ")<p>";
	        	}
	        	else {
		        	var equality = '&le;'; 
	        		
		        	ret += "<p style='font-size: 10px; text-align: center;'>(p &le; <nobr>10<sup>-300</sup></nobr>)<p>";
	        	} 
	        }
	        return ret;
	    })
//        .html(function(d) {
//            var ret = d.name;
//            if (d.size) {
////            	ret += "\n(p &le; " + format.sciFormat(d.size) + ")";
//            }
//            return ret;
//        })
	    .style("color", function(d) {
        	return idealTextColor(that.color(d.parent.name, d.parent === that.root));
        });

    var tip = d3.tip().attr('class', 'd3-tip').html(function(d) {
    	var ret = "<h2>" +d.name + "</h2>";
//    	console.log('the def is : ' + d.def);
//    	var desc = /"(*)"[(*)]/
    	if (d.def) {
    		var desc = d.def.split('"');
    		ret += desc[1];
    	}
    	ret += "<p style='color: aaa;'>(P-Value of " + Math.pow(10, -d.size) + ")</p>"
    	return  ret; 
    });

    childEnterTransition.call(tip);
    
    
    d3.selectAll('.cell') 
	    .on('mouseover', function (a,b,c,d,e) {
	    	var obj = this;
    		tip.show(a,b,c,d,e);
	    	that.timeout = setTimeout(function () {
//	    		tip.show.call(obj, a,b,c,d,e);
		    	that.hoverCallback(a,b,c, tip);
	    	}, 1000);
    		console.log('setting timeout; '+ that.timeout);
	    })
	    .on('mouseout', function (a,b,c,d,e) {
	    	if(that.timeout) {
	    		console.log('clearing timeout; '+ that.timeout);
	    		clearTimeout(that.timeout);
	    		that.timeout = null;
	    	}
	    	tip.hide(a,b,c,d,e);
	    	
	    })


    if (isIE) {
       childEnterTransition.selectAll(".foreignObj .labelbody .label")
            .style("display", "none");
    } else {
//        childEnterTransition
//        .each("end", function(d, i) {
//        	console.log('i: ' + i);
//        });
    }
//
//            that.chart.selectAll(".cell.child")
//
//                .select(".foreignObject")
//        
//                .style("display", function(d){
//                	var widthParsed = d.dx;
////           	var widthParsed = parseInt(this.attributes.getNamedItem('width').value);
////        	console.log(widthParsed < 60);
//                	return parseInt(this.attributes.getNamedItem('width').value) < 60 ? "none" : '';
////        	return widthParsed < 60 ? "none" : '';
//                });
//        });
        
//        .selectAll(".foreignObject")
//
//        .style("display", function(d){
//        	return parseInt(this.attributes.getNamedItem('width').value) < 60 ? "none" : '';
////        	return (d.dx < 60 ? "none" : '');
//        });
//   }

    // update transition
    var childUpdateTransition = childrenCells.transition().duration(that.transitionDuration);
    childUpdateTransition.select(".cell")
        .attr("transform", function(d) {
            return "translate(" + d.x  + "," + d.y + ")";
        });
    childUpdateTransition.select("rect")
        .attr("width", function(d) {
            return Math.max(0.01, d.dx);
        })
        .attr("height", function(d) {
            return d.dy;
        })
        .style("fill", function(d) {
            return that.color(d.parent.name, d.parent === that.root);
        });
    childUpdateTransition.select(".foreignObj")
        .attr("width", function(d) {
            return Math.max(0.01, d.dx);
        })
        .attr("height", function(d) {
            return Math.max(0.01, d.dy);
        })
        .select(".labelbody .label")
//        .text(function(d) {
//            return d.name;
//        })
//        .append('b')
//        .text("HI")
        childUpdateTransition
        .each("end", function(d, i) {
        	if (!i) {
        		
	            that.chart.selectAll(".cell.child")
	                .filter(function(d) {
	                    return d.parent === that.node; // only get the children for selected group
	                })
	                .select(".foreignObj")
	        
	                .style("display", function(d){
	                	var widthParsed = d.dx;
//	                	var widthParsed = parseInt(this.attributes.getNamedItem('width').value);
	                	return d.dx < 60 ? "none" : '';
	                });
        	}
        });
//
//        .style("display", "")
//        .filter(function (d) {
//        	return this.width.baseVal.value <= 60; // only get the children for selected group
//        })
//        .style("display", "none");


    // exit transition
    childrenCells.exit()
        .remove();

    d3.select("select").on("change", function() {
        console.log("select zoom(node)");
        that.treemap.value(this.value == "size" ? size : count)
            .nodes(that.root);
        that.zoom(that.node);
    });

    that.zoom(that.node);

    // update font size to fill each element
    // from https://github.com/jquery-textfill/jquery-textfill
//    childUpdateTransition.selectAll(".foreignObject .labelbody")
//		.textfill({'innerTag': 'div', minFontPixels: 3, maxFontPixels: -1});
	
};

TreeMap.prototype.loadProteins = function (d, tip) {
	var that = this;
	var text = d.name;
	
	if (text.length > 0) {
		
		that.hoverCallback(options.feature || 0, options.description, colors, options.organism || 0, function (data) {
		    rex = /(\w+)/g;  
		    var whiteData = [];
		    var darkData = [];
		    data = data.forEach(function (row) {
		    	var color = row['Color'];
		    	if (color === 'White' || color === 'Grey') {
		        	whiteData.push(row['Primary_Accession']);
		    	}
		    	else {
		    		darkData.push(row['Primary_Accession']);
		    	}
		    });
		    console.log('white: ' + whiteData);
		    console.log('dark: ' + darkData);
	//		addAccessionData(whiteData, true);
	//		addAccessionData(darkData, false);
		//    $('#whiteProteins').html('<html>\n<head>\n<link href="css/jquery-ui-1.10.1.custom.min.css" rel="stylesheet">\n<link href="css/Style.css" rel="stylesheet"><style>lu{width:55px !important;} li{width:55px !important;height: 19px !important;}</style></head>\n<body style="max-height=20 px !important;"><ul 						  style="background-color: rgb(204, 204, 204)" class="ui-front ui-menu ui-widget ui-widget-content ui-corner-all">'+data+'</ul></body></html>');  
			
		})
	}
};	




function size(d) {
    return d.size;
}


function count(d) {
    return 1;
}


//and another one
TreeMap.prototype.textHeight = function(d) {
    var ky = this.chartHeight / d.dy;
    yscale.domain([d.y, d.y + d.dy]);
    return (ky * d.dy) / this.headerHeight;
}


function getRGBComponents (color) {
    var r = color.substring(1, 3);
    var g = color.substring(3, 5);
    var b = color.substring(5, 7);
    return {
        R: parseInt(r, 16),
        G: parseInt(g, 16),
        B: parseInt(b, 16)
    };
}


function idealTextColor (bgColor) {
    var nThreshold = 105;
    var components = getRGBComponents(bgColor);
    var bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);
    return ((255 - bgDelta) < nThreshold) ? "#000000" : "#ffffff";
}


TreeMap.prototype.zoom = function(d) {
	var that = this;
    this.treemap
        .padding([that.headerHeight, 4, 4, 4])
//        .padding([that.headerHeight/(that.chartHeight/d.dy), 4, 4, 4])
        .nodes(d);

    // moving the next two lines above treemap layout messes up padding of zoom result
    var kx = this.chartWidth  / d.dx;
    var ky = this.chartHeight / d.dy;
    var level = d;

    this.xscale.domain([d.x, d.x + d.dx]);
    this.yscale.domain([d.y, d.y + d.dy]);

   if (that.node != level) {
        if (isIE) {
            that.chart.selectAll(".cell.child .foreignObj .labelbody .label")
                .style("display", "none");
        } else {
//        	that.chart.selectAll(".cell.child .foreignObject")
//	            .filter(function(d) {
//	                return d.parent === that.node; // only get the children for selected group
//	            })
//        		.style("display", "none");
//            .style("display", function(d){
//            	return parseInt(this.attributes.getNamedItem('width').value) < 60 ? "none" : '';
//            })

        }
    }

   that.node = d;
   
   if ((level !== that.root)) {
	   
	   that.chart.selectAll(".cell.child")
		.style("display", function(d){
			return  d.parent === that.node ? '':"none";
		})	
   }
   else {
	   that.chart.selectAll(".cell.child")
		.style("display", '');
		
	   
   }


    var zoomTransition = that.chart.transition();
    var zoomTransitionCell = zoomTransition.selectAll("g.cell").duration(that.transitionDuration)
        .attr("transform", function(d) {
            return "translate(" + that.xscale(d.x) + "," + that.yscale(d.y) + ")";
        })
        .each("end", function(d, i) {
            if (!i) {
	            that.chart.selectAll(".cell.child")
                .filter(function(d) {
                    return d.parent === that.node; // only get the children for selected group
                })
                .select(".foreignObj")
        
                .style("display", function(d){
                	var widthParsed = d.dx;
                	return parseInt(this.attributes.getNamedItem('width').value) < 60 ? "none" : '';
                });
            }
        });
    if (level !== that.root) {
    	zoomTransition.selectAll("g.cell.parent")
			.style("opacity", function(d){
				return  d === that.node ? '1':"0";
			})	
    }
    else {
    	zoomTransition.selectAll("g.cell.parent")
			.style("opacity", '1')	
    }
//            	if (level !== that.root) {
//            
//	              that.chart.selectAll(".cell.child")
//		            .filter(function(d) {
//		                return d.parent === that.node; // only get the children for selected group
//		            })
//		            .select(".foreignObject")
//		        	.style("display", '');
//    			}
//    			else {
//  	              that.chart.selectAll(".cell.child .foreignObject")
//		        	.style("display", '');
//    			}
//            }
//        });
//                that.chart.selectAll(".cell.child")
//                    .filter(function(d) {
////                        return d.dx > 50; // only get the children for selected group
//                      return d.parent === that.node; // only get the children for selected group
//                    })
//                    .select(".foreignObject .labelbody .label")
//                    .style("color", function(d) {
//                        return idealTextColor(that.color(d.parent.name, d.type));
//                    });

//                if (isIE) {
//                	that.chart.selectAll(".cell.child")
//                        .filter(function(d) {
//                            return d.dx > 20; // only get the children for selected group
////                            return d.parent === that.node; // only get the children for selected group
//                        })
//                        .select(".foreignObject .labelbody .label")
//                        .style("display", "")
//                } else {
//                    that.chart.selectAll(".cell.child")
////                        .filter(function(d) {
////////                            return d.dx > 20; // only get the children for selected group
////                            return d.parent === that.node; // only get the children for selected group
////                        })
////                        .select(".foreignObject")
//                    	.style("display", function(d){
//                    		return  d.parent === that.node ? '':"none";
//                    	})	
//                }
//            }
//            else {
//            	that.chart.selectAll(".cell.child")
//            	that.chart.selectAll(".cell.child .foreignObject")
//            		.style("display", "");

//            }
////                that.chart.selectAll(".cell.child")
////                	.style("display", '')
//            }
//        });

    zoomTransitionCell.select(".foreignObj")
//        .attr("x", function(d) {
//            return d.x;
//        })
//        .attr("y", function(d) {
//            return d.y;
//        })
        .attr("width", function(d) {
            return Math.max(0.01, kx * d.dx);
        })
        .attr("height", function(d) {
            return d.children ? (ky*d.dy) : Math.max(0.01, ky * d.dy);
        })
//        .select(".labelbody .label")
//        .text(function(d) {
//            return d.name;
//        });

    // update the width/height of the rects
    zoomTransitionCell.select("rect")
//    	.style("display", function(d){
//        	return  d.parent === that.node ? '':"none";
//        })

        .attr("width", function(d) {
            return Math.max(0.01, kx * d.dx);
        })
        .attr("height", function(d) {
            return d.children ? (ky*d.dy) : Math.max(0.01, ky * d.dy);
        })
        .style("fill", function(d) {
            return d.children ? that.headerColor : that.color(d.parent.name, d.parent === that.root);
        });  
        

    
    if (d3.event) {
        d3.event.stopPropagation();
    }
}



module.exports = TreeMap;