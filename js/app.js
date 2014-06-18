'use strict';

// configure the base path and handling of jquery
require.config({
  baseUrl: 'js',
  paths: {
    jquery: 'jquery-2.1.0.min',
    d3:     'd3.min'
  }
});

// load modules and initialize
require(['d3', 'jquery', 'harvester', 'sentiment', 'pie', 'scatter', 'number'], function(d3, $, harvester, sentiment, pie, scatter) {
  var donutLabels = ['positive', 'negative', 'neutral'],
      donutColors = ['rgba(0,160,0,.75)',  'rgba(160,0,0,0.75)',  'rgba(254,254,254,0.1)'],
      maxTopPosts = 10,
      listStyles  = {
      	topPos: 'success',
      	topNeg: 'danger'
      };

  // called by the harvester when data is ready
  var update = function(data) {
    // score each post for sentiment and count hits for each type
    var pos = 0, neg = 0, neu = 0,
        max = 0, maxType = 0,
        posts = $.map(data, function(t) {
          // structure each result
          var d = {
            author:    t.data.author,
            link:      t.data.permalink,
            title:     t.data.title,
            score:     t.data.score,
            comments:  t.data.num_comments,
            created:   t.data.created_utc,
            sentiment: sentiment.score(t.data.title),
            thumbnail: t.data.thumbnail
          };

          // update counts here to avoid a second loop through the data
          d.sentiment > 0 && ++pos || d.sentiment < 0 && ++neg || ++neu;

          return d;
        }),
        sorted = posts.sort(function(a,b) {
          // sort posts by sentiment score
          if(a.sentiment > b.sentiment)
            return -1;
          if(a.sentiment < b.sentiment)
            return 1;
          return 0;
        }),
        lists = {
          topPos: sorted.slice(0, maxTopPosts),
          topNeg: sorted.slice(-maxTopPosts, sorted.length).reverse()
        };

    // the most common sentiment type will go in the donut's center
    $.each([pos,neg,neu], function(i,v) {
      if(v>max) {
        max = v;
        maxType = i;
      }
    });

    // change this to a dispatched event
    $('[data-widget="pie"]').data('pie').update({
      values: [pos,neg,neu],
      label:  posts.length > 0 && [Math.round(100*max/posts.length) + '%', donutLabels[maxType]] || 'unknown'
    });

    // update the scatter plot
    $('[data-widget="scatter"]').data('scatter').update({values: posts});

    // render the top posts lists
    $('[data-widget="list"]').each(function() {
      var frag = document.createDocumentFragment(),
          type = $(this).attr('data-bind');

      lists[type].forEach(function(d) {
        $(frag).append(
          '<a href="http://reddit.com/' + d.link +
          '" class="list-group-item list-group-item-' + listStyles[type] + '">' +
          '<h4 class="list-group-item-heading">' + d.author +
          '<span class="timestamp pull-right">' + d.created.timeAgo() +
          '</span></h4><p class="list-group-item-text">' + d.title + '</p></a>');
      });

      $(this).find('ul').html(frag);
    });
  };

  // make the sentiment donut chart
  $('[data-widget="pie"]').pie({
    groups: donutLabels,
    colors: donutColors,
    values: [0,0,1],
    label:  '0',
    aspect: .6
  });

  // make the sentiment scatter chart
  $('[data-widget="scatter"]').scatter({
    values: [],
    aspect: .7
  });

  // run the harvester and pass results to the sentiment engine
  harvester.run({
    limit: 100,
    load:  update
  });

});
