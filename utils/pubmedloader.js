var request = require('request');
var parseString = require('xml2js').parseString;

/**
 * return an object representing a PubMed article, including pmid, title, authors, geo code, and text Abstract
 */
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
                  var affiliations = [];
                  var authors = result.PubmedArticleSet.PubmedArticle[0].MedlineCitation[0].Article[0].AuthorList[0].Author.map(function (author) {
                      if (author.AffiliationInfo) {
                          affiliations.push(author.AffiliationInfo[0].Affiliation[0]);
                      }
                      return author.LastName[0] + " " + author.Initials[0];
                  }).join (', ');
                  var base = result.PubmedArticleSet.PubmedArticle[0].MedlineCitation[0].Article[0];
                  
                  var article = {
                      pmid: id,
                      title: base.ArticleTitle[0],
                      authors: authors,
                      geo: base.DataBankList[0].DataBank[0].AccessionNumberList[0].AccessionNumber[0],
                      textAbstract: base.Abstract[0].AbstractText[0], 
                      year: base.ArticleDate[0].Year[0],
                      month: base.ArticleDate[0].Month[0],
                      day: base.ArticleDate[0].Day[0],
                      journal: base.Journal[0].Title[0],
                      affiliations: affiliations.join(';'),
                      citation: [base.Journal[0].Title[0],
                                 ". ",
                                 base.ArticleDate[0].Year[0],
                                 ";",
                                 base.Journal[0].JournalIssue[0].Volume[0],
                                 "(",
                                 base.Journal[0].JournalIssue[0].Issue[0],
                                 "):",
                                 base.Pagination[0].MedlinePgn[0],
                                 "."].join('');
                      
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