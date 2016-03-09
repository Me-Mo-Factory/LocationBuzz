
(function () {

    $(document).on("pageinit", "#weatherpage", function (event, data) {
        var options = { enableHighAccuracy: true, maximumAge: 100, timeout: 60000 };
        if (navigator.geolocation) {
            var watchID = navigator.geolocation.watchPosition(geoSuccess, geoError, options);
            var timeout = setTimeout(function () { navigator.geolocation.clearWatch(watchID); }, 5000);
        } else {
            geoError();
        }
    });

    function geoSuccess(p)
    {
        loadWeather(p.coords.latitude + ',' + p.coords.longitude);
    }

    function geoError(error) {
        if (null == localStorage.getItem("location")) {
            loadWeather("London");
        }
        else {
            loadWeather(localStorage.getItem("location"));
        }
    }

    function loadWeather(location, woeid) {
        $.simpleWeather({
            location: location,
            woeid: woeid,
            unit: 'c',
            success: function (weather) {

                var weekday = new Array(7);
                weekday[0] = "Sunday";
                weekday[1] = "Monday";
                weekday[2] = "Tuesday";
                weekday[3] = "Wednesday";
                weekday[4] = "Thursday";
                weekday[5] = "Friday";
                weekday[6] = "Saturday";

                var d = new Date();
                var day = d.getDay();
                html = '<img  src="' + weather.thumbnail + '"/><h4>' + weekday[day] + " " + weather.temp + '&deg;' + weather.units.temp + '</h4>';
                html += '<ul><li>' + weather.city + ', ' + weather.region + '</li>';
                html += '<li class="currently">' + weather.currently + '</li></ul>';
                html = html += "<br/>";
                html = html += "<table>";
                for (var i = 1; i < weather.forecast.length; i++) {
                    var weatherday = weather.forecast[i];
                    
                    html = html += '<tr><td> <img  src="' + weatherday.thumbnail + '"/></td><td>' + weatherday.day + ', ' + weatherday.text + '</td>';
                    html = html += '<td>' + weatherday.high + '&deg;' + '</td><td>' + weatherday.low + '&deg;' + '</td></tr>';
                }
                 html = html += "</table>";
                $('#weather').html(html);
            },
            error: function (error) {
                $('#weather').html('<p>' + error + '</p>');
            }
        });
    }

})();
