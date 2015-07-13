var Range = require('../data/range');
var Gene = require('../data/gene');
var BasicTable = require('./basicTable');

var ProteinTable = function (tableDivName, options) {
	var columns = ['Name', 'Synonym', 'Chr', 'TxStart', 'TxEnd', 'Gene'];
	options.searchable = true;
	BasicTable.call(this, tableDivName, columns, options);
	
//	var map = {};
	
	this.createRow = function(gene) {
//		map[gene.proteinId] = gene;
		return [ 
			gene.proteinID,
			gene.synonym,
		    gene.transcription.chromosome(),
			'' + gene.transcription.lower(),
			'' + gene.transcription.upper(),
			gene.name,
			'' + gene.exons.length];
	};
	
	this.getObjectId = function(gene) {
		return gene.proteinID;
	};

};


ProteinTable.prototype = Object.create(BasicTable.prototype);
ProteinTable.prototype.constructor = ProteinTable;

module.exports = ProteinTable;