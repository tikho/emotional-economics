$(document).ready(function () {

    

    var source   = $("#stock").html();
    var template = Handlebars.compile(source);

    var html = template(suggestionsWithLetters);
    $('body').append(html);

});

function getData(symbol) {
    var url = 'http://query.yahooapis.com/v1/public/yql';
    var data = encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + symbol + "')");

    $.getJSON(url, 'q=' + data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env")
        .done(function (data) {
            console.log(data);
            var result = data.query.results.quote;
            $('#price').text("Price: " + result.LastTradePriceOnly);
            $('#time').text("Last trade time: " + result.LastTradeTime);
            $('#change').text(result.Change);
            $('#percent-change').text(result.PercentChange);
            if (result.Change > 0){
                console.log("happy");
                document.getElementById("image").src= "img/tim-cook-happy.jpg";
            } else {
                console.log("sad");
                document.getElementById("image").src= "img/tim-cook-sad.jpg";
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log('Request failed: ' + err);
        });
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