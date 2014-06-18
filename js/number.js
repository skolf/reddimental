// number.js
//
// extensions to the native number type

// return an abbreviation according to order of magnitude
// ex: 10000.toAbbr();
//     > 10K
Number.prototype.toAbbr = function(precision) {
  if(this < 1000)
    return Math.round(this);
  else {
    var mag = Math.floor(Math.log(this) / Math.LN10 / 3);
    return (this / Math.pow(1000, mag)).toPrecision(precision || 3) + " KMBTP"[mag];
  }
}

// translate a UTC timestamp to a relative time
Number.prototype.timeAgo = function(options) {
  var now  = new Date(),
  		diff = now.getTime()/1000 - this,
  		str  = '';
  
	options = options || {};
	diff    = diff < 0 ? 0 : diff;
  
  if(diff < 60)
    str = Math.round(diff) + 's';
  else if(diff < 3600) {
    var mins = Math.round(diff/60);
    str = mins + 'm';
  }
  else if(diff < 86400) {
    var hours = Math.round(diff/3600);
    str = hours + 'h';
  }
  else {
    var days = Math.round(diff/86400),
    		yrs  = Math.floor(days/365);
    		
    days = days - 365*yrs;
    str  = (yrs && yrs+'y ' || '') + days + 'd';
  }

  options.suffix != false && (str += ' ago');

  return str;
}
