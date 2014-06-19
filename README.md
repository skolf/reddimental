reddimental
===========
A sample Javascript app to analyze and visualize the sentiment of the current top posts on Reddit.

View the [demo](http://rawgithub.com/skolf/reddimental/master/index.html).

#What it does
On page load, the app loads the top 100 posts from Reddit. Each post is scored for sentiment using the AFINN-111 word list, and the dashboard displays an overview of the results. Data is thereafter refreshed every 30 seconds.

#Future improvements
* Replace the simple sentiment classifier with something better. 
* Add tooltips for the d3 charts.
* Add clickthru to scatter plot data points.

#License
Copyright 2014 John Skolfield. Released under the [MIT License](./LICENSE).
