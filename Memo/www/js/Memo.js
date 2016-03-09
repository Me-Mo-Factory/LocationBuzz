// Jquery Mobile - Very Imp
//Following methods bind, delegate, live and die are deprecated and may not work on IOS 5, instead use on
//Say location.href may not work on phones, and also $mobile.changePage will be deprecated in future
//$.mobile.pageContainer.pagecontainer("change", "index.html?sliderVal=" + val, will work instead of $mobile.changePage

(function () {

    var RoomConstants = {
        "MinTemp": 5,
        "MaxTemp": 35,
        "ImpUrl": 'https://agent.electricimp.com/'
    };

    var panel = '<div data-role="panel" data-display="reveal" data-theme="a" id="mypanel">' +
                '<ul data-role="listview">' +
                '<li data-icon="home"><a href="index.html" data-transition="slide">Home</a></li>' +
                '<li data-icon="bullets"><a href="UserSettings.html" data-transition="slide">User Settings</a></li>' +
                '<li data-icon="cloud"><a href="Weather.html" data-transition="slide">Weather</a></li>' +
                '<li data-icon="info"><a href="ContactUs.html" data-transition="slide">Help & Support</a></li>' +
                '<li data-icon="location"><a href="Contactus.html" data-transition="slide">Contact us</a></li>' +
                '</ul></div>';

    $(document).one('pagebeforecreate', function () {
        $.mobile.pageContainer.prepend(panel);
        $("#mypanel").panel().enhanceWithin();
    });

    function refreshPage() {
        jQuery.mobile.pageContainer.pagecontainer('change', window.location.href, {
            allowSamePageTransition: true,
            transition: 'none',
            reloadPage: true
        });
    }

    $(document).on("click", "#btnActivate", function (evt) {

        var sliderVal = 20;// $('#inputSlider').val();

        SetBackground($('#dvTargetRoomTemp'), sliderVal);

        localStorage.setItem("targetRoomTemp", sliderVal);

        $('#targetRoomTemp')[0].innerText = sliderVal + " ℃";

        //Call Api to open the relay
    });

    $(document).on("click", "#btnManual", function (evt) {
        getCurrentRoomTemp();
        localStorage.setItem("targetRoomTemp", localStorage.getItem("currentRoomTemp"));
        SetBackground($('#dvTargetRoomTemp'), localStorage.getItem("currentRoomTemp"));
        $('#targetRoomTemp')[0].innerText = $('#currentRoomTemp')[0].innerText;

        onRoomTemp();

    });

    $(document).on("click", "#btnOff", function (evt) {

        SetBackground($('#dvTargetRoomTemp'), RoomConstants.MinTemp);
        $('#targetRoomTemp')[0].innerText = RoomConstants.MinTemp + " ℃";
        localStorage.setItem("targetRoomTemp", RoomConstants.MinTemp);

        offRoomTemp();
    });

    $(document).on("click", "#btnSchedule", function (evt) {

        $.mobile.pageContainer.pagecontainer("change", "Schedule.html",
        {
            transition: "flip",
        });
    });

    $(document).on('pageinit', function () {

        var auto_refresh = setInterval(function () {
            //getCurrentRoomTemp();

        }, 10000);

        $("#inputSlider").on('slidestop', function (event) {
            var sliderVal = $("#inputSlider").slider().val();
            SetBackground($('#dvTargetRoomTemp'), 0);
            $('#targetRoomTemp')[0].innerText = sliderVal + " ℃";
            //localStorage.setItem("targetRoomTemp", sliderVal);
        });

        if (localStorage.getItem("userName") == null) {
            //$.mobile.pageContainer.pagecontainer("change", "Login.html",
            //   {
            //       transition: "flip",
            //   });
        }
    });

    //All working code
    $(document).on("pageshow", function (event, data) {
        //getTargetRoomTemp();
        //getCurrentRoomTemp();

    });

    function getTargetRoomTemp() {
        $('#inputSlider').val("20");
        //$('#targetRoomTemp')[0].innerText = "20" + " ℃";
        SetBackground($('#dvTargetRoomTemp'), "20");
    }

    function getCurrentRoomTemp() {
        $.get(getImpUrl() + '?command=' + 'temp',
               function (temp) {
                   var newListcontent = '<li style="background-color:transparent; border-color:transparent;text-align:center;color:white;font-size:1.50em;">' + parseFloat(temp).toFixed(1) + ' ℃</li>';
                   $("#currentRoomTemp ul").html(newListcontent).listview('refresh');
                   SetBackground($('#dvCurrentRoomTemp'), parseFloat(temp).toFixed(1));
                   localStorage.setItem("currentRoomTemp", parseFloat(temp).toFixed(1));
               });
    }

    function onRoomTemp() {
        $.get(getImpUrl() + '?command=' + 'on',
               function (reply) {

               });
    }

    function offRoomTemp() {
        $.get(getImpUrl() + '?command=' + 'off',
               function (reply) {

               });
    }

    function getImpUrl() {
        return RoomConstants.ImpUrl + localStorage.getItem("impKey");
    }

    function SetBackground(div, sliderInput) {
        var sliderVal = parseInt(sliderInput);
        if (sliderVal == 0) {
            div.css("background-color", "rgb(60, 70, 72)");
        }
        else if (sliderVal >= 5 && sliderVal <= 15.5) {
            div.css("background-color", "rgb(41, 146, 181)");
        }
        else if (sliderVal >= 16 && sliderVal <= 18.5) {
            div.css("background-color", "lightseagreen");
        }
        else if (sliderVal >= 19 && sliderVal <= 21.5) {
            div.css("background-color", "rgb(250, 166, 61)");
        }
        else if (sliderVal >= 22 && sliderVal <= 24.5) {
            div.css("background-color", "#ff8e00");
        }
        else if (sliderVal >= 25 && sliderVal <= 35) {
            div.css("background-color", "rgb(232, 26, 18)");
        }
    }

    $(document).on("click", "#lnkWeather", function (evt) {
        $.mobile.pageContainer.pagecontainer("change", "weather.html",
        {
            transition: "flip",
        });
    });

    $(document).on("click", "#lnkUserSettings", function (evt) {
        $.mobile.pageContainer.pagecontainer("change", "UserSettings.html",
        {
            transition: "flip",
        });
    });


    $(document).on('pageinit', '#usersettings', function () {
        $(document).on('click', '#submit', function () { // catch the form's submit event
            if ($('#location').val().length > 0 && $('#email').val().length > 0) {
                localStorage.setItem("location", $('#location').val());
                localStorage.setItem("email", $('#email').val());
                localStorage.setItem("temperaturedegree", $('#sliderdegree').val());
                $.mobile.pageContainer.pagecontainer("change", "index.html",
                {
                    transition: "flip",
                });
            }
        });
    });

    $(document).on('pageinit', '#Userlogin', function () {
        $(document).on('click', '#btnSubmit', function () {
            userLogin();
        });

        $(document).on('click', '#btnDemo', function () {
            userLogin();
        });
    });

    function userLogin() {
        if ($('#userName').val().length > 0 && $('#password').val().length > 0
                && $('#impKey').val().length > 0) {
            localStorage.setItem("userName", $('#userName').val());
            localStorage.setItem("impKey", $('#impKey').val());

            //window.location.href = "index.html";
            $.mobile.pageContainer.pagecontainer("change", "index.html",
            {
                transition: "flip",
            });
        }
    }

    $(document).on("click", "#exitDemo", function (evt) {
        logout();
    });

    $(document).on("click", "#logout", function (evt) {
        logout();
    });

    function logout()
    {
        localStorage.removeItem("userName");
        localStorage.removeItem("impKey");

        $.mobile.pageContainer.pagecontainer("change", "Login.html",
        {
            transition: "flip",
        });
    }

    $(document).on('pageinit', '#contactUs', function () {
        var latlon = 51.503324 + "," + -0.119543;

        var img_url = "http://maps.googleapis.com/maps/api/staticmap?center="
        + latlon + "&zoom=14&size=400x300&sensor=false";
        document.getElementById("dvMap").innerHTML = "<img src='" + img_url + "'>";
    });
	
	$(document).on("click", "#takePhoto", function (evt) {
        capturePhoto();
    });
	
function capturePhoto() {
// Take picture using device camera and retrieve image as base64-encoded string
    navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50 });
}
//for taking picture
//Callback function when the picture has been successfully taken
function onPhotoDataSuccess(imageData) {                
    // Get image handle
    var smallImage = document.getElementById('smallImage');

    // Unhide image elements
    smallImage.style.display = 'block';
    smallImage.src = imageData;
}

//Callback function when the picture has not been successfully taken
function onFail(message) {
    alert('Failed to load picture because: ' + message);
}

function movePic(file){ 
    window.resolveLocalFileSystemURI(file, resolveOnSuccess, resOnError); 
} 

//Callback function when the file system uri has been resolved
function resolveOnSuccess(entry){ 
    var d = new Date();
    var n = d.getTime();
    //new file name
    var newFileName = n + ".jpg";
    var myFolderApp = "EasyPacking";

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {      
    //The folder is created if doesn't exist
    fileSys.root.getDirectory( myFolderApp,
                    {create:true, exclusive: false},
                    function(directory) {
                        entry.moveTo(directory, newFileName,  successMove, resOnError);
                    },
                    resOnError);
                    },
    resOnError);
}

//Callback function when the file has been moved successfully - inserting the complete path
function successMove(entry) {
    //I do my insert with "entry.fullPath" as for the path
}

function resOnError(error) {
    alert(error.code);
}

})();
