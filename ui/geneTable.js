var Range = require('../data/range');
var Gene = require('../data/gene');
var BasicTable = require('./basicTable');

var GeneTable = function (tableDivName, options) {
    var that = this;
	var columns = ['Gene', 'Chr', 'TxStart', 'TxEnd', 'Protein', 'Exon Count'];
	options.searchable = true;
	if (options.assembly) {
	    that.assembly = options.assembly; 
    	options.fnRowCallback = function( nRow, aData, iDisplayIndex ) {
    	        
                $('td:eq(0)', nRow).html('<a href="http://genome.ucsc.edu/cgi-bin/hgGene?db=' + that.assembly + '&hgg_gene=' + aData[0] + '" target="_blank">' +
                    aData[0] + '</a>');
                var gene = that.getRow(nRow);
                $('td:eq(4)', nRow).html('<a href="http://aquaria.ws/' + gene.proteinID + '" target="_blank" title="Load ' + aData[4] + " (" + gene.proteinID +") "+ ' in Aquaria" >' +
                        aData[4] + '</a>');

    	};
	}
	BasicTable.call(this, tableDivName, columns, options);
	
	var map = {};
	
	this.createRow = function(gene) {
		map[gene.name] = gene;
		return [ 
			gene.name,
		    gene.transcription.midpoint._chromosome,
			'' + gene.transcription.lower(),
			'' + gene.transcription.upper(),
			'' + gene.synonym,
			'' + gene.exons.length];
	};
	
	this.getObjectId = function(gene) {
		return gene.name;
	};
};


GeneTable.prototype = Object.create(BasicTable.prototype);
GeneTable.prototype.constructor = GeneTable;

module.exports = GeneTable;