$(document).ready(function () {

    var companiesSymbols = ['AAPL', 'FB', 'TSLA', 'USDRUB=X', 'BABA', 'GOOG', 'VA', 'USDEUR=X', 'AMZN', 'SBUX'];

    getIndexData(companiesSymbols);


    // // $("a[href~='#']").click(function() {
    // $("a").click(function() {
    //     console.log("clicked");
    // });


});

$(document).on('click',"a[href*='#']",function(event){
    event.preventDefault();
    var symbol = this.getAttribute('href');
    symbol = symbol.slice(1);//cut "#" sign
    getCompanyData(symbol);

    var indexContainer = $('.index-container');
    var companyInfoContainer = $('.companyInfo-container');

    indexContainer.addClass('visuallyhidden');
    indexContainer.one('transitionend', function(e) {
      indexContainer.addClass('hidden');
    });
    // companyInfoContainer.removeClass('hidden');
    // setTimeout(function () {
    //   companyInfoContainer.removeClass('visuallyhidden');
    // }, 20);
});

// showDiv = function(class){
//   var divToShow = $(class);
//   divToShow.removeClass('hidden');
//   setTimeout(function () {
//     divToShow.removeClass('visuallyhidden');
//   }, 20);
// }

// hideDiv = function(class){
//   var divToHide = $(class);
//   divToHide.addClass('visuallyhidde');
//   divToHide.one('transitionend', function(e) {
//     divToHide.addClass('hidden');
//   });
// }

getIndexData = function(symbols) {

    var results = [];

    var url = 'https://query.yahooapis.com/v1/public/yql';

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

                var source   = $("#index").html();
                var template = Handlebars.compile(source);

                var html = template(results);
                $('.index-container').append(html);

                console.log(results);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log('Request failed: ' + err);
        });
}


getCompanyData = function(symbol) {

    var results = [];
    var companyInfo;
    var companyHistory;

    console.log(symbol + " clicked");

    var url = 'https://query.yahooapis.com/v1/public/yql';

    var data = encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + symbol + "')");

    $.getJSON(url, 'q=' + data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env")
        .done(function(companyData) {

            var startDate = '2016-01-01';
            var endDate = moment().format().slice(0, 10);
            var data = encodeURIComponent('select * from yahoo.finance.historicaldata where symbol in ("' + symbol + '") and startDate = "' + startDate + '" and endDate = "' + endDate + '"');
            
            $.getJSON(url, 'q=' + data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env")
                .done(function(historyData) {

                    $.extend(results, companyData.query.results.quote, historyData.query.results.quote);

                    var source   = $("#companyInfo").html();
                    var template = Handlebars.compile(source);

                    var html = template(results);
                    $('.companyInfo-container').append(html);

                    var companyInfoContainer = $('.companyInfo-container');
                    companyInfoContainer.removeClass('hidden');
                    setTimeout(function () {
                      companyInfoContainer.removeClass('visuallyhidden');
                    }, 20);

                    console.log(results);
            
                })
                .fail(function (jqxhr, textStatus, error) {
                    var err = textStatus + ", " + error;
                    console.log('Request failed: ' + err);
                });
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

Handlebars.registerHelper('image', function(className) {
    var change = this.Change;
    var symbol = this.Symbol;
    var imgClass = 'class="img-responsive ' + className + '"';
    if (change > 0){
        return '<img src="img/' + symbol + "-happy.jpg" + '" ' + imgClass + '>';
    } else{
        return '<img src="img/' + symbol + "-sad.jpg" + '" ' + imgClass + '>';
    }
});

Handlebars.registerHelper('history-image', function(){
    var open = this.Open;
    var close = this.Close;
    var symbol = this.Symbol;
    var imgClass = 'class="img-responsive history-image"';

    var change = close - open;
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

Handlebars.registerHelper('compareMoodsImages', function() {

    var data = this;

    var happyCounter = 0;
    var sadCounter = 0;
    for (var i = data.length - 1; i >= 0; i--) {
      if (data[i].Open < data[i].Close){
        happyCounter++;
      } else {
        sadCounter++;
      }
    }
    var symbol = this.Symbol;
    var compareClass = 'compareImage';
    var maxHeight = 300;
    if (happyCounter > sadCounter){
      var sadImageSize = sadCounter/(happyCounter + 1) * maxHeight;//TO-DOcheck on 0
      return '<img src="img/' + symbol + '-sad.jpg" class=' + compareClass + ' style="height:' + sadImageSize + 'px"><img src="img/' + symbol + '-happy.jpg" class=' + compareClass + ' style="height:' + maxHeight + 'px">';
    } else {
      var happyImageSize = happyCounter/(sadCounter + 1) * maxHeight;
      return '<img src="img/' + symbol + '-sad.jpg" class=' + compareClass + ' style="height:' + maxHeight + 'px"><img src="img/' + symbol + '-happy.jpg" class=' + compareClass + ' style="height:' + happyImageSize + 'px">';
    }

});

Handlebars.registerHelper('timesHappy', function() {

    var happyCounter = 0;

    for (var i = this.length - 1; i >= 0; i--) {
      if (this[i].Open < this[i].Close){
        happyCounter++;
      }
    }
    return happyCounter;

});


Handlebars.registerHelper('timesSad', function() {

    var sadCounter = 0;

    for (var i = this.length - 1; i >= 0; i--) {
      if (this[i].Open >= this[i].Close){
        sadCounter++;
      }
    }
    return sadCounter;
    
});
