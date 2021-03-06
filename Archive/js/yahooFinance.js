$(document).ready(function () {

    var companiesSymbols = ['AAPL', 'FB', 'TSLA', 'USDRUB=X', 'BABA', 'GOOG', 'VA', 'USDEUR=X', 'AMZN', 'SBUX'];

    getData(companiesSymbols);

});

getData = function(symbols) {

    var results = [];

    var url = 'http://query.yahooapis.com/v1/public/yql';

    // for (var i = 0; i < symbols.length; i++) {
        var data = encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + symbols + "')");

        $.getJSON(url, 'q=' + data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env")
            .done(function (data) {
                console.log(data);
                // var result = data.query.results.quote;

                // results.push(result);

                results = data.query.results.quote;

                if (results.length == symbols.length){

                    results = results.sort(function(a,b){
                      if (a.Name < b.Name)
                        return -1;
                      if (a.Name > b.Name)
                        return 1;
                      return 0;
                    });

                    var source   = $("#stock").html();
                    var template = Handlebars.compile(source);

                    var html = template(results);
                    $('body').append(html);
                    console.log(results);
                }
            })
            .fail(function (jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                console.log('Request failed: ' + err);
            });
    // }
}

Handlebars.registerHelper('grouped_each', function(every, context, options) {
  var out = "", subcontext = [], i;
  if (context && context.length > 0) {
      for (i = 0; i < context.length; i++) {
          if (i > 0 && i % every === 0) {
              out += options.fn(subcontext);
              subcontext = [];
          }
          subcontext.push(context[i]);
      }
      out += options.fn(subcontext);
  }
  return out;
});


Handlebars.registerHelper('image', function() {
    var change = this.Change;
    var symbol = this.Symbol;
    var imgClass = 'class="img-responsive company-image"';
    if (change > 0){
        return '<img src="img/' + symbol + "-happy.jpg" + '" ' + imgClass + '>';
    } else{
        return '<img src="img/' + symbol + "-sad.jpg" + '" ' + imgClass + '>';
    }
});


Handlebars.registerHelper('change-sign', function() {
    var change = this.Change;
    if (change > 0){
        return '⇈';
    } else if (change < 0){
        return '⇊';
    } else{
        return '\u00A0'
    }
});

Handlebars.registerHelper('change-class', function() {
    var change = this.Change;
    if (change > 0){
        return 'change-up';
    } else if (change < 0){
        return 'change-down';
    } else{
        return 'change-still'
    }
});