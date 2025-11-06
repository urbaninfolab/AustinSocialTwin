

// firebase stuff

const firebaseConfig = {
    apiKey: "AIzaSyBhcg-rUdd_GQ-jDVu3UNL0GQOa4uEqOAc",
    authDomain: "noise-3b89d.firebaseapp.com",
    projectId: "noise-3b89d",
    storageBucket: "noise-3b89d.appspot.com",
    messagingSenderId: "548295321778",
    appId: "1:548295321778:web:a39aae9f11383310bf41ab",
    measurementId: "G-DWW4GG4D07"
  };

  const app = firebase.initializeApp(firebaseConfig);



var markers = L.markerClusterGroup({
    showCoverageOnHover: false,
    //zoomToBoundsOnClick: false,
    iconCreateFunction: function(cluster) {
        var childCount = cluster.getChildCount();
        var markers = cluster.getAllChildMarkers();
        var sum = 0;
        for (var i = 0; i < markers.length; i++) {
            //console.log(markers[i]);
            sum += markers[i].options.title;
        }
        var avg = sum / markers.length;

    var c = ' marker-cluster-';
    if (avg < 10) {
        c += 'small';
    } else if (avg < 100) {
        c += 'medium';
    } else {
        c += 'large';
    }

    return new L.DivIcon({ html: '<div><span><b>' + Math.round(avg) + '</b></span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });
        }
});



    // build temperature table for next 5 hours
    function buildTemperatureTable(hourlyData) {
        var data = ``;
        hourlyData.forEach((x, i) => {
            if (i <= 5) {
                var startTime = x.startTime.split('T')[1].split(':')[0];
                data += `
                <tr>
                    <td>${startTime}:00</td>
                    <td>${x.temperature}℉</td>
                    <td>${x.shortForecast}</td>
                    <td>${x.windDirection}</td>
                </tr>
                `;
            }

        });
        var table = `
        <table  style="
        border-collapse: collapse;
        margin: 15px 0;
        font-size: 0.9em;
        font-family: sans-serif;
        min-width: 210px;
        min-height: 30px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
    ">
        <thead  style="
        text-align: center;
        padding: 10px 40px;
        font-size: smaller;
        background-color: #009375;
        color: #ffffff;
        text-align: center;
    ">
            <tr>
                <th>Time</th>
                <th>Temperature</th>
                <th>Forecast</th>
                <th>Wind Direction</th>
            </tr>
        <thead>
        <tbody>
            ${data}
        </tbody>
        <table/>
        `;
        return table;
    }

    function addMapLayer(map) {
        L.tileLayer('https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }).addTo(map);
        // L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=podpBxEPp3rRpfqa6JY8', {
        //     attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
        // }).addTo(map);
        // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        //     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        // }).addTo(map);
        console.log("BEING CALLED");
    }

    // placeholders for the L.marker and L.circle representing user's current position and accuracy
    var current_position, current_accuracy;

    function onLocationFound(e) {
    // if position defined, then remove the existing position marker and accuracy circle from the map
    console.log("location found");
    //console.log(e);

    if (current_position) {
        map.removeLayer(current_position);
        map.removeLayer(current_accuracy);
    }

    var radius = e.coords.accuracy / 10;

    const latlng = {
        lat: e.coords.latitude,
        lng: e.coords.longitude
    };

    /*const latlng = {          // Debug coordinates
        lat: 30.508119,
        lng: -97.811024
    };*/
    
    current_position = L.marker(latlng).addTo(map);
    current_accuracy = L.circle(latlng, radius).addTo(map);

    map.setView(latlng);
    map.fitBounds(current_accuracy.getBounds());


    }

    function foundLocationGeocoded(e) {
        
    if (current_position) {
        map.removeLayer(current_position);
        map.removeLayer(current_accuracy);
    }

    var radius = 10;

    const latlng = {
        lat: e.latlng.lat,
        lng: e.latlng.lng
    };

    /*const latlng = {          // Debug coordinates
        lat: 30.508119,
        lng: -97.811024
    };*/
    
    current_position = L.marker(latlng).addTo(map);
    current_accuracy = L.circle(latlng, radius).addTo(map);

    map.setView(latlng);
    map.fitBounds(current_accuracy.getBounds());


    }


    function onLocationError(e) {
        console.error("Location found error");
        console.log(e);
    }

    function getUserLocation() {
        navigator.geolocation.getCurrentPosition(onLocationFound);

        /*navigator.geolocation.watchPosition(onLocationFound, onLocationError, {
        maximumAge: 60000,
        timeout: 2000
        });*/
    }





        // Call the function to retrieve and process the GeoJSON file
    let eventPoints = [];
    let current_event_layer = null;
    let current_subjectivity_layer = null;
    let current_polarity_layer = null;
    let current_tweet_density_layer = null;

    
    function buildEventHeatmap() {
        eventPoints = [];
        fetch('./data/points.json').then(response => {
            return response.json();
        }).then(points => {

            var min_point = 1000000;
            var max_point = -1000;
            console.log(points);
            for(var i = 0; i < points.features.length; i++) {
                eventPoint = points.features[i].properties;
                max_point = Math.max(max_point, eventPoint.score);
                min_point = Math.min(min_point, eventPoint.score);
                eventPoints.push([eventPoint.LATITUDE, eventPoint.LONGITUDE, Math.max(0.001, 2*eventPoint.score)])
            }
            console.log(min_point);
            console.log(max_point);
            var heat = L.heatLayer(
                eventPoints
            , {radius: 10, min: 0.001, max: 0.02, maxZoom: 2, blur: 10});
            
            
            heat.addTo(map);
            current_event_layer = heat;
            // heat.
            

            
           
        })
      
    
    }


    let sentimentPoints = [];
    // let current_event_shapefile = null;
    
    function buildSubjectivityHeatmap() {
        sentimentPoints = [];
        fetch('./data/points.json').then(response => {
            return response.json();
        }).then(points => {
            console.log(points);
            for(var i = 0; i < points.features.length; i++) {
                eventPoint = points.features[i].properties;
                sentimentPoints.push([eventPoint.LATITUDE, eventPoint.LONGITUDE, eventPoint.AVG_SUBJECTIVITY])
            }

            var heat = L.heatLayer(
                sentimentPoints
            , {radius: 10, min: 0.3, max: 0.8, maxZoom: 3, blur: 5});
            
            
            heat.addTo(map);
            current_subjectivity_layer = heat;

            
           
        })
      
    
    }

    let polarityPoints = [];
    // let current_event_shapefile = null;
    
    function buildPolarityHeatmap() {
        polarityPoints = [];
        fetch('./data/points.json').then(response => {
            return response.json();
        }).then(points => {
            console.log(points);
            for(var i = 0; i < points.features.length; i++) {
                eventPoint = points.features[i].properties;
                polarityPoints.push([eventPoint.LATITUDE, eventPoint.LONGITUDE, eventPoint.AVG_POLARITY])
            }

            var heat = L.heatLayer(
                polarityPoints
            , {radius: 10, min: 0.3, max: 0.8, maxZoom: 3, blur: 5});
            
            
            heat.addTo(map);
            current_polarity_layer = heat;

            
           
        })
      
    
    }


    let xDensityPoints = [];
    // let current_event_shapefile = null;
    
    function buildTweetDensityHeatmap() {
        xDensityPoints = [];
        fetch('./data/points.json').then(response => {
            return response.json();
        }).then(points => {
            console.log(points);
            for(var i = 0; i < points.features.length; i++) {
                eventPoint = points.features[i].properties;
                xDensityPoints.push([eventPoint.LATITUDE, eventPoint.LONGITUDE, Math.log(eventPoint.TWEET_COUNT)])
            }

            var heat = L.heatLayer(
                xDensityPoints
            , {radius: 10, min: 0, max: 11, maxZoom: 3, blur: 5});
            
            
            heat.addTo(map);
            current_tweet_density_layer = heat;

            
           
        })
      
    
    }

    


    let isEventPredictionMap = false;
    function buildEventLayer() {
        if (current_event_layer != null){
            map.removeLayer(current_event_layer);
            current_event_layer = null;
            eventPoints = [];
        }
        if (!document.querySelector(".event_likelihood").checked) {
            return
        }

       
        buildEventHeatmap();
        isEventPredictionMap = true;
        
       
       
    }

    function buildSubjectivityLayer() {
        if (current_subjectivity_layer != null){
            map.removeLayer(current_subjectivity_layer)
            current_subjectivity_layer = null;
            sentimentPoints = [];
        }
        if (!document.querySelector(".subjectivity").checked) {
            return
        }

       
        buildSubjectivityHeatmap();
        isEventPredictionMap = false;
        
       
       
    }


    function buildPolarityLayer() {
        if (current_polarity_layer != null){
            map.removeLayer(current_polarity_layer)
            current_polarity_layer = null;
            polarityPoints = [];
        }
        if (!document.querySelector(".polarity").checked) {
            return
        }

       
        buildPolarityHeatmap();
        isEventPredictionMap = false;
        
       
       
    }


    function buildTweetDensityLayer() {
        if (current_tweet_density_layer != null){
            map.removeLayer(current_tweet_density_layer)
            current_tweet_density_layer = null;
            xDensityPoints = [];
        }
        if (!document.querySelector(".tweet_density").checked) {
            return
        }

       
        buildTweetDensityHeatmap();
        isEventPredictionMap = false;
        
       
       
    }


    let current_traffic_layer = null;
    function builtTrafficMap() {
        if (current_traffic_layer != null) {
            map.removeLayer(current_traffic_layer)
            current_traffic_layer = null
        }
        if (!document.querySelector(".traffic_condition").checked) {
            return
        }
        let traffic_layer = L.gridLayer.googleMutant({
            type: "roadmap",
            styles: [
                { featureType: "all", stylers: [{ visibility: "off" }] },
            ],
        }).addTo(map);
        traffic_layer.addGoogleLayer("TrafficLayer");
        current_traffic_layer = traffic_layer
    }

    // let current_bike_path_layer = null;
    // function builtBikePathMap() {
    //     if (current_bike_path_layer != null) {
    //         map.removeLayer(current_bike_path_layer)
    //         current_bike_path_layer = null
    //     }
    //     if (!document.querySelector(".bike_path").checked) {
    //         return
    //     }
    //     let bike_path_layer = L.gridLayer.googleMutant({
    //         type: "roadmap",
    //         styles: [
    //             { featureType: "all", stylers: [{ visibility: "off" }] },
    //         ],
    //     }).addTo(map);
    //     bike_path_layer.addGoogleLayer("BicyclingLayer");
    //     current_bike_path_layer = bike_path_layer;
    // }

    function buildDropdownMenu(map) {
        var checkList = document.getElementById('filter-menu');
        var overlay = document.getElementById('filter-menu-overlay');
        
        // 切换菜单显示/隐藏
        function toggleMenu() {
            if (checkList.classList.contains('visible')) {
                checkList.classList.remove('visible');
                if (overlay) overlay.classList.remove('show');
            } else {
                checkList.classList.add('visible');
                if (overlay) overlay.classList.add('show');
            }
        }
        
        // 点击锚点切换菜单
        checkList.getElementsByClassName('anchor')[0].onclick = function (evt) {
            evt.stopPropagation();
            toggleMenu();
        }
        
        // 点击遮罩层关闭菜单
        if (overlay) {
            overlay.onclick = function (evt) {
                evt.stopPropagation();
                checkList.classList.remove('visible');
                overlay.classList.remove('show');
            }
        }
        
        // 点击菜单内部时阻止事件冒泡
        var items = checkList.getElementsByClassName('items')[0];
        if (items) {
            items.onclick = function (evt) {
                evt.stopPropagation();
            }
        }
        
        // 点击关闭按钮关闭菜单
        var closeBtn = checkList.querySelector('.sidebar-close');
        if (closeBtn) {
            closeBtn.onclick = function (evt) {
                evt.stopPropagation();
                checkList.classList.remove('visible');
                if (overlay) overlay.classList.remove('show');
            }
        }
        document.querySelector(".event_likelihood").addEventListener('change', function () {
            buildEventLayer();
        });

        document.querySelector(".subjectivity").addEventListener('change', function () {
            buildSubjectivityLayer();
        });

        document.querySelector(".polarity").addEventListener('change', function () {
            buildPolarityLayer();
        });

        document.querySelector(".tweet_density").addEventListener('change', function () {
            buildTweetDensityLayer();
        });

        document.querySelector(".traffic_condition").addEventListener('click', function () {
            builtTrafficMap();
        });
    }



    var data = "<item><title>Traffic Injury Pri 4F</title>" +
        "<link>http://maps.google.com/maps?q=30.389258,-97.745772</link>" +
        "<description>9800-9832 RESEARCH BLVD SVRD SB | AFD | 16:12:50</description>" +
        "<pubDate>Mon, 06 Dec 2021 16:12:50 CDT</pubDate></item>";

    // initialize map and base layer
    var map = L.map('map',{ preferCanvas:true, zoomControl: false, renderer: L.canvas() }).setView([30.356635, -97.701180], 12);

    new L.Control.Zoom({ position: 'bottomright' }).addTo(map);


    map.on('click', function(e) {

        if(current_event_layer == null) {
            return;
        }

        // make sure shapefile is event prediction
        if(!isEventPredictionMap) {
            return
        }

        const degreePerMeter = 1 / 111139;
        const pointRadiusDetection = 500;

        var bestPointDistance = 0xFFFFFFFF;
        var bestEventLevel = -1;

        for (var i = 0; i < eventPoints.length; i++) {

            const eventPoint = eventPoints[i];
            const latitude = eventPoint[0];
            const longitude = eventPoint[1];
            const eventScore = eventPoint[2];
           
            // calculate distance from event point
            const dist = ((Math.abs(e.latlng.lat - latitude) + Math.abs(e.latlng.lng - longitude)) / 2);
            if(dist <= degreePerMeter * pointRadiusDetection) {
                if(dist <= bestPointDistance) {
                    bestPointDistance = dist;
                    bestEventLevel = eventScore;
                }
        
            }

            
        }


        const normalLevelContent = `<b style="font-size:20px">Event Prediction</b> <br> 
        <span style="font-size:16px"><b>Predicted Event Probability:</b> None.</span> <br>
        With tweet density, traffic information, and more, we predict there is likely <i>not</i> an event near here.`;

        const eventPointFoundContent = `<b style="font-size:20px">Event Prediction</b> <br> 
        <span style="font-size:16px"><b>Predicted Event Probability:</b> <i> Likely. </i></span> <br>
        With tweet density, traffic information, and more, we predict there is likely an event near here.`;

        const eventPointLikelyFoundContent = `<b style="font-size:20px">Event Prediction</b> <br> 
        <span style="font-size:16px"><b>Predicted Event Probability:</b> <i> Likely. </i></span> <br>
        With tweet density, traffic information, and more, we predict there is likely an event near here.`;
        


        // var content = bestEventLevel <= 0.05 ? normalLevelContent : eventPointFoundContent;

        if(bestEventLevel < 0.01) {
            content = `<b style="font-size:20px">Event Prediction</b> <br> 
            <span style="font-size:16px"><b>Predicted Event Probability:</b> None.</span> <br>
            With tweet density, traffic information, and more, we predict there is likely <i>not</i> an event near here.`;
        } else if (bestEventLevel < 0.05) {
            content = `<b style="font-size:20px">Event Prediction</b> <br> 
            <span style="font-size:16px"><b>Predicted Event Probability:</b> Somewhat likely.</span> <br>
            With tweet density, traffic information, and more, we predict there is likely <i>not</i> an event near here.`;
        } else if (bestEventLevel < 0.09) {
            content = `<b style="font-size:20px">Event Prediction</b> <br> 
            <span style="font-size:16px"><b>Predicted Event Probability:</b> Likely.</span> <br>
            With tweet density, traffic information, and more, we predict there is likely <i>not</i> an event near here.`;
        } else {
            content = `<b style="font-size:20px">Event Prediction</b> <br> 
            <span style="font-size:16px"><b>Predicted Event Probability:</b> Very Likely.</span> <br>
            With tweet density, traffic information, and more, we predict there is likely <i>not</i> an event near here.`;
        }
        
        
        var popup = L.popup()
            .setLatLng([e.latlng.lat, e.latlng.lng])
            .setContent(content)
            .openOn(map);


            

    });
    

    addMapLayer(map);

    buildDropdownMenu(map);




    map._layersMaxZoom = 19;





    // add geolocator for address
    //const provider = new GeoSearch.OpenStreetMapProvider();

    //const search = new GeoSearch.GeoSearchControl({
    //    provider: new GeoSearch.OpenStreetMapProvider(),
    //});
    //map.addControl(search);

    // create the geocoding control and add it to the map
    var searchControl = L.esri.Geocoding.geosearch({
        position: 'topright',
        placeholder: 'Enter an address or place e.g. 1 York St',
        providers: [
        L.esri.Geocoding.arcgisOnlineProvider({
            // API Key to be passed to the ArcGIS Online Geocoding Service
            apikey: 'AAPK88fbee9b41364fc28314cabcb5108702X4OOHT6TEoflnY2xPNIuDPA8zi_zSGHg0weTJJzjiOFWugapHwRA5DvZw7Uht0eR'
        })
        ]
    }).addTo(map);


    //document.getElementsByClassName("geocoder-control")[0].children[0].style = "background-color: transparent; border-color: transparent; background-image:url(assets/images/search.png);"
    //document.getElementsByClassName("geocoder-control")[0].style = "position: fixed;top: 2.5px;right: -4.5px;"

    console.log(searchControl)

    // create an empty layer group to store the results and add it to the map
    var results = L.layerGroup().addTo(map);

    // listen for the results event and add every result to the map
    searchControl.on("results", function (data) {
        foundLocationGeocoded(data);
    });

    // Get user location and display on map


  L.Control.Watermark = L.Control.extend({
    onAdd: function (map) {
        var container = L.DomUtil.create('div');
        container.type="button";
        container.title="No cat";
        container.value = "42";
        container.classList = ["geocoder-control leaflet-control"]
    
        /*container.style.backgroundColor = 'white';     
        //container.style.backgroundImage = "url(https://t1.gstatic.com/images?q=tbn:ANd9GcR6FCUMW5bPn8C4PbKak2BJQQsmC-K9-mbYBeFZm1ZM2w2GRy40Ew)";
        container.style.backgroundSize = "30px 30px";
        container.style.width = '30px';
        container.style.height = '30px'; 
        
        container.onmouseover = function(){
          container.style.backgroundColor = 'pink'; 
        }
        container.onmouseout = function(){
          container.style.backgroundColor = 'white'; 
        } */
    
        container.onclick = function(){
          getUserLocation();
        }
    
        container.innerHTML = `
        <div class=\"geocoder-control-input leaflet-bar\" title=\"Check My Location\" style=\"position:absolute;top:0px; background-image: url(https://smartcity.tacc.utexas.edu/FireIncident/assets/images/location.png)\"></div><div class=\"geocoder-control-suggestions leaflet-bar\"><div class=\"\"></div></div>\r\n
        `;

        return container;
      },

    onRemove: function(map) {
        // Nothing to do here
    }
});

L.control.watermark = function(opts) {
    return new L.Control.Watermark(opts);
}

L.control.watermark({ position: 'bottomright' }).addTo(map);


L.Control.Watermark = L.Control.extend({
    onAdd: function (map) {
        var container = L.DomUtil.create('div');
        container.type="button";
        container.title="No cat";
        container.value = "42";
        container.classList = ["geocoder-control leaflet-control"]
    
        /*container.style.backgroundColor = 'white';     
        //container.style.backgroundImage = "url(https://t1.gstatic.com/images?q=tbn:ANd9GcR6FCUMW5bPn8C4PbKak2BJQQsmC-K9-mbYBeFZm1ZM2w2GRy40Ew)";
        container.style.backgroundSize = "30px 30px";
        container.style.width = '30px';
        container.style.height = '30px'; 
        
        container.onmouseover = function(){
          container.style.backgroundColor = 'pink'; 
        }
        container.onmouseout = function(){
          container.style.backgroundColor = 'white'; 
        } */
    
        container.onclick = function() {
            stats();
        };
    
        container.innerHTML = `
        <div class=\"geocoder-control-input leaflet-bar\" title=\"Stats\" style=\"    

        background-image: url(); width:35px; \"><img src="https://smartcity.tacc.utexas.edu/FireIncident/assets/images/stats1.png" style="width: 20px;height: 20px;position: absolute;left: 5px;"></div><div class=\"geocoder-control-suggestions leaflet-bar\"><div class=\"\"></div></div>\r\n
        `;

        return container;
      },

    onRemove: function(map) {
        // Nothing to do here
    }
});

/*
L.control.watermark = function(opts) {
    return new L.Control.Watermark(opts);
}


L.control.watermark({ position: 'bottomright' }).addTo(map);
*/
//document.getElementsByClassName("geocoder-control")[0].style = "position:fixed;width: 10px;top: 2.5px;right: 29.5px;"


L.Control.Watermark = L.Control.extend({
    onAdd: function (map) {
        var container = L.DomUtil.create('div');
        container.type="button";
        container.title="No cat";
        container.value = "42";
        container.classList = ["geocoder-control leaflet-control"]
    
        /*container.style.backgroundColor = 'white';     
        //container.style.backgroundImage = "url(https://t1.gstatic.com/images?q=tbn:ANd9GcR6FCUMW5bPn8C4PbKak2BJQQsmC-K9-mbYBeFZm1ZM2w2GRy40Ew)";
        container.style.backgroundSize = "30px 30px";
        container.style.width = '30px';
        container.style.height = '30px'; 
        
        container.onmouseover = function(){
          container.style.backgroundColor = 'pink'; 
        }
        container.onmouseout = function(){
          container.style.backgroundColor = 'white'; 
        } */
    
        //container.onclick = function() {
         //   stats();
        //};
    
        container.innerHTML = `
        <div class=\"dropdown-check-list geocoder-control-input leaflet-bar\" title=\"Layers\" style=\"    background-color: transparent;
        border-color: transparent; background-image: url(); width:35px; \"><img src="assets/images/layers.png" style="width: 20px;height: 20px;position: absolute;left: 5px;"></div><div class=\"geocoder-control-suggestions leaflet-bar\"><div class=\"\"></div></div>\r\n
        `;

        return container;
      },

    onRemove: function(map) {
        // Nothing to do here
    }
});

L.control.watermark = function(opts) {
    return new L.Control.Watermark(opts);
}

// default layer initialization
let eventCheckbox = document.querySelector(".event_likelihood")
if(eventCheckbox.checked) {
    buildEventLayer()
}

// default layer initialization
let subjectivityCheckbox = document.querySelector(".subjectivity")
if(subjectivityCheckbox.checked) {
    buildSubjectivityLayer()
}


L.control.watermark({ position: 'bottomright' }).addTo(map);

//document.getElementsByClassName("geocoder-control")[0].style = "position:fixed;width: 10px;top: 2.5px;right: 67.5px;"


    var spinner = document.getElementById('spinner');
    spinner.style.display = 'none';

    document.getElementsByClassName( 'leaflet-control-attribution' )[0].style.display = 'none';

