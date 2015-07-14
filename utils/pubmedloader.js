

var importPubMed = function (id) {
    return new Promise(function (resolve, reject) {
        
        request('http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&rettype=abstract&id=' + id, function (error, response, body) {
            
          if (!error && response.statusCode == 200) {
//              console.log(body);
              parseString(body, function (err, result) {
                  if (err) {
                      reject(err);
                      return;
                  }
                  var authors = result.PubmedArticleSet.PubmedArticle[0].MedlineCitation[0].Article[0].AuthorList[0].Author.map(function (author) {
                      return author.LastName[0] + " " + author.Initials[0];
                  }).join (', ');
                  var base = result.PubmedArticleSet.PubmedArticle[0].MedlineCitation[0].Article[0]
                  var article = {
                      pmid: id,
                      title: base.ArticleTitle[0],
                      authors: authors,
                      geo: base.DataBankList[0].DataBank[0].AccessionNumberList[0].AccessionNumber[0],
                      textAbstract: base.Abstract[0].AbstractText[0] 
                  };
//                  console.log(JSON.stringify(result.PubmedArticleSet.PubmedArticle[0].MedlineCitation[0].Article[0], null, 2));
                  resolve(article);
              });
          }
          else {
              reject(error);
          }
        })
    });
    
    
}

module.exports = importPubMed;