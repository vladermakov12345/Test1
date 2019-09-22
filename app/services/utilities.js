module.exports = function(mod){
	var utilities = function() {

        this.getUrlSafeDate = function(date) {
            if (!date) return null;
            return (date.getMonth() + 1) + "-" + date.getDate() + "-" + date.getFullYear();
        };

        this.getPricelineFormattedDate = function(date) {
            if (!date) return null;
            return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
        };

        this.getPricelineFormattedTime = function(timeString) {
            if (!timeString) return null;
            return this.convertTo24Hours(timeString);
        };

        this.removeHTML = function(html) {
			var div = document.createElement("div");
			div.innerHTML = html;
			var text = div.textContent || div.innerText || "";
			return text;
        };

        this.convertTo24Hours = function(timeString) {
            var time = timeString;
            var hours = Number(time.match(/^(\d+)/)[1]);
            var minutes = Number(time.match(/:(\d+)/)[1]);
            var AMPM = time.match(/\s(.*)$/)[1];
            if(AMPM == "PM" && hours<12) hours = hours+12;
            if(AMPM == "AM" && hours==12) hours = hours-12;
            var sHours = hours.toString();
            var sMinutes = minutes.toString();
            if(hours<10) sHours = "0" + sHours;
            if(minutes<10) sMinutes = "0" + sMinutes;
            return sHours + ":" + sMinutes;
        };

        this.getParameterByName = function(name) {
          var match = RegExp('[#&]' + name + '=([^&]*)').exec(window.location.hash);
          return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
        };

        this.getNthIndex = function(str, pat, n) {
            if (!str || str==='') { return 0; }
            var L= str.length, i= -1;
            while(n-- && i++<L){
                i= str.indexOf(pat, i);
                if (i < 0) break;
            }
            return i;
        };

        this.replaceAll = function(str, search, replacement) {
            //return str.replace(new RegExp(search, 'g'), replacement);
            return str.split(search).join(replacement);
        };

        this.isValidEmail = function(email) {
            if (!email) return false;
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        };

        this.isValidPhone = function(phone) {
            if (!phone) return false;

            //check for alphabetical characters
            var regex = /[a-z]/i;
            if (regex.test(phone)) return false;

            return true;

            //THIS DOES NOT WORK WELL UNLESS phone is already formatted like +12122221111
            //var regex = /^\+(?:[0-9] ?){6,14}[0-9]$/;
            //return regex.test(phone);
        };

        this.isValidCVV = function(cvv) {
            if (!cvv) return false;
            var regex = /^[0-9]{3,4}$/;
            return regex.test(cvv);
        };

        this.getFormattedDateFromString = function(dateString) {
            return dateFns.format(dateString, 'M-DD-YYYY');
        };

        this.formatDuration = function(duration) {
            if (!duration) return '';
            var sp = duration.split(':');
            var hours = sp[1];
            if (hours.startsWith('0')) hours=hours.substring(1);
            var minutes = sp[2];
            return hours + 'h ' + minutes + 'm';
        };

        this.getEndash = function() {
            return '–';
        };

        // new Date("dateString") is browser-dependent and discouraged, so we'll write
        // a simple parse function for U.S. date format (which does no error checking)
        this.parseDate = function(str) {
            var mdy = str.split('/');
            return new Date(mdy[2], mdy[0]-1, mdy[1]);
        };

        this.datediff = function(first, second) {
            // Take the difference between the dates and divide by milliseconds per day.
            // Round to nearest whole number to deal with DST.
            return Math.round((second-first)/(1000*60*60*24));
        };

        this.getNumberDaysBetween = function(startDate,endDate) {
            return this.datediff(startDate, endDate);
        };

        this.getObjectCount = function(obj) {

            var ObjectLength_Modern = function( object ) {
                return Object.keys(object).length;
            }

            var ObjectLength_Legacy = function( object ) {
                var length = 0;
                for( var key in object ) {
                    if( object.hasOwnProperty(key) ) {
                        ++length;
                    }
                }
                return length;
            }

            return Object.keys ? ObjectLength_Modern(obj) : ObjectLength_Legacy(obj);
        }
	};

    utilities.$inject = [];
    mod.service('utilities', utilities);
};