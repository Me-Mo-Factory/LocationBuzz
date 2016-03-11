(function () {

    var glbCurrentLat = 100;
    var glbCurrentLng = 100;
    var glbDestLat = 100;
    var glbDestLng = 100;

    $(document).on("click", "#btnStoreLocation", function (evt) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(setLocation);
        } else {
            alert("There is Some Problem on your current browser to get Geo Location!");
        }
    });

    $(document).on("click", "#btnAlarm", function (evt) {
        $('#dvDistance').show();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getCurrentlocation);
        } else {
            alert("There is Some Problem on your current browser to get Geo Location!");
        }

        refresh();
    });

    $(document).on('pageinit', function () {

        var auto_refresh = setInterval(function () {
            refresh();
        }, 10000);

    });

    function refresh() {
        if (null == localStorage.getItem("currentLatitude") || null == localStorage.getItem("currentLongitude") || null == localStorage.getItem("destinationLatitude") || null == localStorage.getItem("destinationLongitude")) {
            $('#dvDistance')[0].innerText = "Distance: ";

        } else {
            var distance = getDistanceFromLatLonInKm(localStorage.getItem("currentLatitude"), localStorage.getItem("currentLongitude"), localStorage.getItem("destinationLatitude"), localStorage.getItem("destinationLongitude"));
            $('#dvDistance')[0].innerText = "Distance: " + distance;

            //$("#dvDistance .button").vibrate("long");

            var metres = parseFloat(distance) * 1609;

            if (metres <= 2000) {

                var item = $("#dvDistance .button");
                // Either of these
                item.vibrate("medium");
                item.vibrate("default");
                item.vibrate(2000);
            }

        }
    }

    function getCurrentlocation(position) {
        var lat = position.coords.latitude;
        var long = position.coords.longitude;

        localStorage.setItem("currentLatitude", lat);
        localStorage.setItem("currentLongitude", long);


    }

    function setLocation(position) {

        var lat = position.coords.latitude;
        var long = position.coords.longitude;

        localStorage.removeItem("currentLatitude");
        localStorage.removeItem("currentLongitude");

        localStorage.setItem("destinationLatitude", lat);
        localStorage.setItem("destinationLongitude", long);

        var city = position.coords.locality;
        var LatLng = new google.maps.LatLng(lat, long);
        var mapOptions = {
            center: LatLng,
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var map = new google.maps.Map(document.getElementById("MyMapLOC"), mapOptions);
        var marker = new google.maps.Marker({
            position: LatLng,
            title: "<div style = 'height:60px;width:200px'><b>Your location:</b><br />Latitude: "
                        + lat + +"<br />Longitude: " + long
        });

        marker.setMap(map);
        var getInfoWindow = new google.maps.InfoWindow({
            content: "<b>Your Current Location</b><br/> Latitude:" +
                                    lat + "<br /> Longitude:" + long + ""
        });
        getInfoWindow.open(map, marker);

        fetchAddress(map);
    }

    function fetchAddress(map) {
        var geocoder = new google.maps.Geocoder;

        var latlng = { lat: parseFloat(localStorage.getItem("destinationLatitude")), lng: parseFloat(localStorage.getItem("destinationLongitude")) };
        geocoder.geocode({ 'location': latlng }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    map.setZoom(11);
                    var marker = new google.maps.Marker({
                        position: latlng,
                        map: map
                    });
                    //infowindow.setContent(results[1].formatted_address);
                    localStorage.setItem("destinationAddress", results[1].formatted_address);
                    $('#dvAddress')[0].innerText = "Address: " + results[1].formatted_address;
                    $('#dvAddress').show();
                    //infowindow.open(map, marker);
                } else {
                    window.alert('No results found');
                }
            } else {
                window.alert('Geocoder failed due to: ' + status);
            }
        });
    }

    function SearchRoute() {
        document.getElementById("MyMapLOC").style.display = 'none';

        var markers = new Array();
        var myLatLng;

        //Find the current location of the user.  
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (p) {
                var myLatLng = new google.maps.LatLng(p.coords.latitude, p.coords.longitude);
                var m = {};
                m.title = "Your Current Location";
                m.lat = glbCurrentLat = p.coords.latitude;
                m.lng = glbCurrentLng = p.coords.longitude;
                markers.push(m);

                //Find Destination address location.  
                var address = document.getElementById("txtDestination").value;
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({ 'address': address }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        m = {};
                        m.title = address;
                        m.lat = glbDestLat = results[0].geometry.location.lat();
                        m.lng = glbDestLng = results[0].geometry.location.lng();
                        markers.push(m);
                        var mapOptions = {
                            center: myLatLng,
                            zoom: 4,
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        };
                        var map = new google.maps.Map(document.getElementById("MapRoute"), mapOptions);
                        var infoWindow = new google.maps.InfoWindow();
                        var lat_lng = new Array();
                        var latlngbounds = new google.maps.LatLngBounds();

                        for (i = 0; i < markers.length; i++) {
                            var data = markers[i];
                            var myLatlng = new google.maps.LatLng(data.lat, data.lng);
                            lat_lng.push(myLatlng);
                            var marker = new google.maps.Marker({
                                position: myLatlng,
                                map: map,
                                title: data.title
                            });
                            latlngbounds.extend(marker.position);
                            (function (marker, data) {
                                google.maps.event.addListener(marker, "click", function (e) {
                                    infoWindow.setContent(data.title);
                                    infoWindow.open(map, marker);
                                });
                            })(marker, data);
                        }
                        map.setCenter(latlngbounds.getCenter());
                        map.fitBounds(latlngbounds);

                        //***********ROUTING****************//  

                        //Initialize the Path Array.  
                        var path = new google.maps.MVCArray();

                        //Getting the Direction Service.  
                        var service = new google.maps.DirectionsService();

                        //Set the Path Stroke Color.  
                        var poly = new google.maps.Polyline({ map: map, strokeColor: '#4986E7' });

                        //Loop and Draw Path Route between the Points on MAP.  
                        for (var i = 0; i < lat_lng.length; i++) {
                            if ((i + 1) < lat_lng.length) {
                                var src = lat_lng[i];
                                var des = lat_lng[i + 1];
                                path.push(src);
                                poly.setPath(path);
                                service.route({
                                    origin: src,
                                    destination: des,
                                    travelMode: google.maps.DirectionsTravelMode.DRIVING
                                }, function (result, status) {
                                    if (status == google.maps.DirectionsStatus.OK) {
                                        for (var i = 0, len = result.routes[0].overview_path.length; i < len; i++) {
                                            path.push(result.routes[0].overview_path[i]);
                                        }
                                    } else {
                                        alert("Invalid location.");
                                        window.location.href = window.location.href;
                                    }
                                });
                            }
                        }
                    } else {
                        alert("Request failed.");
                    }
                });

            });
        }
        else {
            alert('Some Problem in getting Geo Location.');
            return;
        }
    }

    function ShowDistance() {
        var distance = getDistanceFromLatLonInKm(glbCurrentLat, glbCurrentLng, glbDestLat, glbDestLng);
        alert(Math.round(distance * 0.62) + " miles");
    }

    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1);  // deg2rad below
        var dLon = deg2rad(lon2 - lon1);
        var a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d * 0.62; //in miles
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

})();