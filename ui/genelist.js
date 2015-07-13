var GeneList = function (divName, args) {
	this._textArea = $('<textarea rows = "20" cols = "40"/>');
	this.geneSet = {};
	$('#' + divName).append(this._textArea);
};

GeneList.prototype.addGenes = function (genes) {
	var geneText = [];
	var that = this;
	genes.forEach(function (gene) {
		// for future when gene is a complex object
		var geneId = gene;
		geneText.push(geneId);
		that.geneSet[geneId] = gene;
	});
	this._textArea.text(geneText.join('\n'));
};


GeneList.prototype.getGenes = function() {
	var text = this._textArea.val().trim();
	var genes = [];
	if (text.length > 0) {
		genes = text.split('\n');
	}
	
	return genes;
}
module.exports = GeneList;