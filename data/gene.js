var Point = require('./point');
var Range = require('./range');
/**
 * Represents a range that is a point (center/midpoint) and a distance (radius) 
 */
var Gene = function (argsOriginal) {
	this.args = argsOriginal;
	
	
	this.reload();
};

/**
 * Reload the gene attributes from the arguments
 */
Gene.prototype.reload = function() {
    var args = this.args;
    this.transcription = Range.createRange(args.chrom, args.txStart, args.txEnd);
    this.coding = Range.createRange(args.chrom, args.cdsStart, args.cdsEnd);

    var i;
    this.exons = [];
    this.strand = args.strand;
    this.name = args.name;
    this.proteinID = args.proteinID || '';
    this.synonym = args.synonym || '';
    
    
    if (args.exonCount > 0) {
        
        var exonStarts = ("" + args.exonStarts).split(',');
        var exonEnds = ("" + args.exonEnds).split(',');
        for (i = 0; i < args.exonCount; i++ ){
            var exon = Range.createRange(args.chrom, parseInt(exonStarts[i]), parseInt(exonEnds[i]));
            this.exons.push(exon);
        }
    }
};


/**
 * Print a nice representation of the Gene
 * @returns {String}
 */
Gene.prototype.toString = function() {
	return "G[" + this.name + "(" + this.proteinID + ")]"; 
};

module.exports = Gene;
