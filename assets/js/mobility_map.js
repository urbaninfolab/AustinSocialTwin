let transitLocations = new L.FeatureGroup();
let scooterLocations = new L.FeatureGroup();
let incidentLocations = new L.FeatureGroup();
let waterPollution = new L.FeatureGroup();


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

var transit_markers = L.markerClusterGroup({
    showCoverageOnHover: false,
    //zoomToBoundsOnClick: false,
    iconCreateFunction: function(cluster) {
        var childCount = cluster.getChildCount();
        var markers = cluster.getAllChildMarkers();
        return new L.DivIcon({ html: '<div><span><b>' + childCount + '</b></span></div>', className: 'marker-cluster marker-cluster-black', iconSize: new L.Point(40, 40) });
    }
});

var scooter_markers = L.markerClusterGroup({
    showCoverageOnHover: false,
    //zoomToBoundsOnClick: false,
    iconCreateFunction: function(cluster) {
        var childCount = cluster.getChildCount();
        var markers = cluster.getAllChildMarkers();
        return new L.DivIcon({ html: '<div><span><b>' + childCount + '</b></span></div>', className: 'marker-cluster marker-cluster-darkgreen', iconSize: new L.Point(40, 40) });
    }
});

var archived_incident_markers = L.markerClusterGroup({
    showCoverageOnHover: false,
    //zoomToBoundsOnClick: false,
    iconCreateFunction: function(cluster) {
        var childCount = cluster.getChildCount();
        var markers = cluster.getAllChildMarkers();
        return new L.DivIcon({ html: '<div><span><b>' + childCount + '</b></span></div>', className: 'marker-cluster marker-cluster-darkorange', iconSize: new L.Point(40, 40) });
    }
});

function new_transit_cluster_layer() {
    let cluster_layer = L.markerClusterGroup({
        showCoverageOnHover: false,
        //zoomToBoundsOnClick: false,
        iconCreateFunction: function(cluster) {
            var childCount = cluster.getChildCount();
            var markers = cluster.getAllChildMarkers();
            return new L.DivIcon({ html: '<div><span><b>' + childCount + '</b></span></div>', className: 'marker-cluster marker-cluster-black', iconSize: new L.Point(40, 40) });
        }
    });
    return cluster_layer
};
function new_scooter_cluster_layer() {
    let cluster_layer = L.markerClusterGroup({
        showCoverageOnHover: false,
        //zoomToBoundsOnClick: false,
        iconCreateFunction: function(cluster) {
            var childCount = cluster.getChildCount();
            var markers = cluster.getAllChildMarkers();
            return new L.DivIcon({ html: '<div><span><b>' + childCount + '</b></span></div>', className: 'marker-cluster marker-cluster-darkgreen', iconSize: new L.Point(40, 40) });
        }
    });
    return cluster_layer
};
function new_archived_incident_cluster_layer() {
    let cluster_layer = L.markerClusterGroup({
        showCoverageOnHover: false,
        //zoomToBoundsOnClick: false,
        iconCreateFunction: function(cluster) {
            var childCount = cluster.getChildCount();
            var markers = cluster.getAllChildMarkers();
            return new L.DivIcon({ html: '<div><span><b>' + childCount + '</b></span></div>', className: 'marker-cluster marker-cluster-darkorange', iconSize: new L.Point(40, 40) });
        }
    });
    return cluster_layer
};


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

    function getToday() {
        document.getElementById("CurrentSelectedDate").textContent = "&#12288;&#12288;Today";
        var datePicker = document.querySelector('.date-picker');
        datePicker.style.display = 'none';
                                // clear all markers and rebuild map layer
                                /*map.eachLayer(function (layer) {
                                    map.removeLayer(layer);
                                });
                                addMapLayer(map);*/
                                // map today's fire data
                                dateArray = [];
                                var today = new Date();
                                var date = today.getFullYear() + '-' + ("0" + (today.getMonth() + 1)).slice(-2) + '-' + ("0" + today.getDate()).slice(-2);
                                dateArray.push(date);
                                // show status toggle button and uncheck checkbox
                                //statusToggle.style.display = 'flex';
                                //checkbox.checked = false;
    }

    function getYesterday() {
        document.getElementById("CurrentSelectedDate").textContent = "&#12288;&#12288;Yesterday";
        var datePicker = document.querySelector('.date-picker');
        datePicker.style.display = 'none';
                        // clear all markers and rebuild map layer
                        /*map.eachLayer(function (layer) {
                            map.removeLayer(layer);
                        });
                        addMapLayer(map);*/
                        // map yesterday's fire data
                        dateArray = [];
                        var today = new Date();
                        var date = today.getFullYear() + '-' + ("0" + (today.getMonth() + 1)).slice(-2) + '-' + ("0" + (today.getDate() - 1)).slice(-2);
                        dateArray.push(date);
                        mapFireIncident(map, dateArray, inactive_flag, shapefile_display_flag, purple_air_diaplay_flag, microsoft_air_display_flag);
                        //statusToggle.style.display = 'none';

                    }


    function get3Days() {
        document.getElementById("CurrentSelectedDate").textContent = "&#12288;&#12288;Last 3 Days";
        var datePicker = document.querySelector('.date-picker');
        datePicker.style.display = 'none';
                        // clear all markers and rebuild map layer
                        /*map.eachLayer(function (layer) {
                            map.removeLayer(layer);
                        });
                        addMapLayer(map);*/
                        // map fire data of past 3 days 
                        dateArray = [];
                        var today = new Date();
                        for (let i = 0; i < 3; i++) {
                            var date = today.getFullYear() + '-' + ("0" + (today.getMonth() + 1)).slice(-2) + '-' + ("0" + (today.getDate() - i)).slice(-2);
                            dateArray.push(date);
                        }
                        mapFireIncident(map, dateArray, inactive_flag, shapefile_display_flag, purple_air_diaplay_flag, microsoft_air_display_flag);
                        //statusToggle.style.display = 'none';

    }

    function getCustom() {
        document.getElementById("CurrentSelectedDate").textContent = "&#12288;&#12288;Custom";

        var datePicker = document.querySelector('.date-picker');
        datePicker.style.display = 'none';
        // add event listener
        datePicker.addEventListener('change', (event) => {
            // clear all markers and rebuild map layer
            /*map.eachLayer(function (layer) {
                map.removeLayer(layer);
            });
            addMapLayer(map);*/
        })
                                // show date selector
                                datePicker.style.display = 'block';
                                //statusToggle.style.display = 'none';
    }

    function buildSelectBar(map) {
        var checkList = document.getElementById('filter-menu');
        checkList.getElementsByClassName('anchor')[0].onclick = function (evt) {
            if (checkList.classList.contains('visible'))
                checkList.classList.remove('visible');
            else
                checkList.classList.add('visible');
        }
        // set up value of date picker
        var dateControl = document.querySelector('input[type="date"]');
        dateControl.value = date;
        dateControl.max = date;
        // hide date picker
        var datePicker = document.querySelector('.date-picker');
        datePicker.style.display = 'none';
        // add event listener
        datePicker.addEventListener('change', (event) => {
            // clear all markers and rebuild map layer
            /*map.eachLayer(function (layer) {
                map.removeLayer(layer);
            });
            addMapLayer(map);*/
        })

        //build select button
        const barOuter = document.querySelector(".bar-outer");
        const options = document.querySelectorAll(".bar-grey .option");
        let current = 1;
        options.forEach((option, i) => (option.index = i + 1));
        options.forEach(option =>
            option.addEventListener("click", function () {
                barOuter.className = "bar-outer";
                barOuter.classList.add(`pos${option.index}`);
                if (option.index > current) {
                    barOuter.classList.add("right");
                } else if (option.index < current) {
                    barOuter.classList.add("left");
                }
                current = option.index;
                // console.log('index: ', current)

                datePicker.style.display = 'none';
                // define button onclick action
                switch (current) {
                    // Today Button
                    case 1:
                        // clear all markers and rebuild map layer
                        /*map.eachLayer(function (layer) {
                            map.removeLayer(layer);
                        });
                        addMapLayer(map);*/
                        // map today's fire data
                        dateArray = [];
                        var today = new Date();
                        var date = today.getFullYear() + '-' + ("0" + (today.getMonth() + 1)).slice(-2) + '-' + ("0" + today.getDate()).slice(-2);
                        dateArray.push(date);
                        mapFireIncident(map, dateArray, inactive_flag, shapefile_display_flag, purple_air_diaplay_flag, microsoft_air_display_flag);
                        // show status toggle button and uncheck checkbox
                        statusToggle.style.display = 'flex';
                        checkbox.checked = false;
                        break;

                    // Yesterday Button
                    case 2:
                        // clear all markers and rebuild map layer
                        /*map.eachLayer(function (layer) {
                            map.removeLayer(layer);
                        });
                        addMapLayer(map);*/
                        // map yesterday's fire data
                        dateArray = [];
                        var today = new Date();
                        var date = today.getFullYear() + '-' + ("0" + (today.getMonth() + 1)).slice(-2) + '-' + ("0" + (today.getDate() - 1)).slice(-2);
                        dateArray.push(date);
                        mapFireIncident(map, dateArray, inactive_flag, shapefile_display_flag, purple_air_diaplay_flag, microsoft_air_display_flag);
                        statusToggle.style.display = 'none';
                        break;

                    // Past 3 days Button
                    case 3:
                        // clear all markers and rebuild map layer
                        /*map.eachLayer(function (layer) {
                            map.removeLayer(layer);
                        });
                        addMapLayer(map);*/
                        // map fire data of past 3 days 
                        dateArray = [];
                        var today = new Date();
                        for (let i = 0; i < 3; i++) {
                            var date = today.getFullYear() + '-' + ("0" + (today.getMonth() + 1)).slice(-2) + '-' + ("0" + (today.getDate() - i)).slice(-2);
                            dateArray.push(date);
                        }
                        mapFireIncident(map, dateArray, inactive_flag, shapefile_display_flag, purple_air_diaplay_flag, microsoft_air_display_flag);
                        statusToggle.style.display = 'none';
                        break;

                    // Custom Button
                    case 4:
                        // show date selector
                        datePicker.style.display = 'block';
                        statusToggle.style.display = 'none';
                        break;
                }
            }));
    }

    async function mapTransitData(map) {
        // Delete all markers
        for (let i = 0; i < transit_markers.length; i++) {
            transit_markers[i].remove();
        }
        for (let i = 0; i < transitLocations.length; i++) {
            transitLocations[i].remove();
        }
        if (!document.querySelector(".transit").checked) {
            return
        }
        url = "https://smartcity.tacc.utexas.edu/data/transportation/transitposition.json"
        let response = await fetch(url);
        let transit_json = response.json();
        console.log(transit_json)
        for (let i = 0; i < transit_json["entity"].length; i++) {
            if (!transit_json["entity"][i]["vehicle"].hasOwnProperty("trip")) {
                continue;
            }
            let y = transit_json["entity"][i]["vehicle"]["position"]["latitude"];
            let x = transit_json["entity"][i]["vehicle"]["position"]["longitude"];
            let transit_marker = new L.marker([y,x]);
            let iconLink = "assets/images/bus_icon.png";
            transit_marker.setIcon(L.icon({
                iconUrl: iconLink,
                iconSize: [24, 32],
                iconAnchor: [12, 32],
                popupAnchor: [0, -30]
            }));
            var route_id = transit_json["entity"][i]["vehicle"]["trip"]["routeId"]
            var vehicle_id = transit_json["entity"][i]["id"]
            var speed = transit_json["entity"][i]["vehicle"]["position"]["speed"]
            transit_marker.bindPopup(" Vehicle ID: " + vehicle_id + ", Route: " + route_id + ", Speed: " + speed + "m/s");

            transit_markers.addLayer(transit_marker)
            transitLocations.addLayer(transit_marker)
        }
    }

    async function mapScooterData(map) {
        // Delete all markers
        for (let i = 0; i < scooter_markers.length; i++) {
            scooter_markers[i].remove();
        }
        for (let i = 0; i < scooterLocations.length; i++) {
            scooterLocations[i].remove();
        }
        if (!document.querySelector(".micromobility").checked) {
            return
        }
        url = "https://smartcity.tacc.utexas.edu/data/transportation/freebike.json"
        let response = await fetch(url);
        let scooter_json = response.json();
        console.log(scooter_json)
        for (let i = 0; i < scooter_json["data"]["bikes"].length; i++) {
            let y = scooter_json["data"]["bikes"][i]["lat"];
            let x = scooter_json["data"]["bikes"][i]["lon"];
            let scooter_marker = new L.marker([y,x]);
            let iconLink = "assets/images/scooter_icon.png";
            scooter_marker.setIcon(L.icon({
                iconUrl: iconLink,
                iconSize: [24, 32],
                iconAnchor: [12, 32],
                popupAnchor: [0, -30]
            }));
            var bike_id = scooter_json["data"]["bikes"][i]["bike_id"]
            var bike_type = scooter_json["data"]["bikes"][i]["vehicle_type_id"]
            scooter_marker.bindPopup(" ID: " + bike_id + ", Type: " + bike_type);

            scooter_markers.addLayer(scooter_marker)
            scooterLocations.addLayer(scooter_marker)
        }
    }


    function addMore() {
        console.log("hey")
        var moreButton = document.getElementById("moreButton");
        
        if(moreButton.textContent == "More...") {
        document.getElementById("more").style.display = "block";
        document.getElementById("moreButton").textContent = "Less...";
        } else {
        document.getElementById("more").style.display = "none";
        document.getElementById("moreButton").textContent = "More...";
        }
        //airMarkerPopup += `<a href="#">More...</a>`
    }

    var poiMarkers = [];
    let current_waterpollution_map = null;

    function buildWaterPollutionMap() {

        if(current_waterpollution_map != null) {
            map.removeLayer(current_waterpollution_map);
            current_waterpollution_map = null;
        }
        if (!document.querySelector(".water").checked) {
            return;
        }



        fetch('https://data.austintexas.gov/resource/5tye-7ray.json?$where=(date_extract_y(sample_date)%20%3E%202019)&$limit=100000&$select=lat_dd_wgs84,lon_dd_wgs84,sample_date,project,parameter,result,unit')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json(); 
                }).then(water_json => {
               
                    scale = 1;
                    for (var i = 0; i < water_json.length; i++) {

                        water_data = water_json[i];

                        const lat = parseFloat(water_data.lat_dd_wgs84);
                        const lon = parseFloat(water_data.lon_dd_wgs84);

                        if(isNaN(lat) || isNaN(lon)) {
                            continue;
                        }
                        
                        var marker = L.circleMarker([lat, lon], {
                            color: 'dodgerblue',
                            radius: 5
                            
                        });
           
                        // marker.setIcon(L.icon({
                        //     iconUrl: "./assets/images/water_icon.png",
                        //     iconSize: [10 * scale, 10],
                        //     iconAnchor: [10, 10],
                        //     popupAnchor: [-5, 0]
                        // }));


                        let date = new Date(water_data.sample_date);
                      

                        marker.bindPopup(`<b style="color:#191970; font-size:16px">Water Information</b> <br> 
                        <b>Date:</b> ${date.getMonth()}/${date.getDay()}/${date.getFullYear()} <br> 
                        <b>Project:</b> ${water_data.project} <br>
                        <b>Parameter:</b> ${water_data.parameter} <br>
                        <b>Result:</b> ${water_data.result} ${water_data.unit} <br>` );

                        waterPollution.addLayer(marker)
                        

                    }

                });

                waterPollution.addTo(map);
                current_waterpollution_map = waterPollution;

                console.log("got all pollution")

                
            
    }

    function buildPOIMap() {

        // Delete all markers
        for (var i = 0; i < poiMarkers.length; i++) {
            poiMarkers[i].remove();
        }

        var fireDept = document.querySelector(".firedept").checked;

        if (!fireDept) {
            return;
        }


        var mechanical_permits = [];

        let scale = 1.278
        // https://data.austintexas.gov/resource/3syk-w9eu.json

        fetch('https://data.austintexas.gov/resource/3syk-w9eu.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json(); 
                }).then(construction_json => {

                    for (var i = 0; i < construction_json.length; i++) {
                        permit = construction_json[i];
                        
                        // filter permits
                        if(permit.permittype == "MP" && permit.status_current == "Active") {

                            var marker = L.marker([permit.latitude, permit.longitude]).addTo(map);
                            // Change the icon to a custom icon
                      
                            marker.setIcon(L.icon({
                                iconUrl: "./assets/images/construction.png",
                                iconSize: [20 * scale, 20],
                                iconAnchor: [10, 10],
                                popupAnchor: [-5, 0]
                            }));

                            marker.bindPopup(`<b style="color:#191970; font-size:16px">Construction</b> <br> 
                            <b>Description:</b> ${permit.description} <br> ` );
                            poiMarkers.push(marker);

                        } 
                    }
                  
                });
        
    }


    function buildTranMap() {
        for (let i = 0; i < transitLocations.length; i++) {
            transitLocations[i].remove();
        }
        if (!document.querySelector(".transit").checked) {
            return
        }
        let transit = document.querySelector(".transit").checked;
        // mobility JSON data
        if (transit) {
            transit_markers = new_transit_cluster_layer();
            fetch('https://smartcity.tacc.utexas.edu/data/transportation/transitposition.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json(); 
                })
                .then(transit_json => {
                    console.log(transit_json);
                    
                    for (let i = 0; i < transit_json["entity"].length; i++) {
                        if (!transit_json["entity"][i]["vehicle"].hasOwnProperty("trip")) {
                            continue;
                        }
                        let y = transit_json["entity"][i]["vehicle"]["position"]["latitude"];
                        let x = transit_json["entity"][i]["vehicle"]["position"]["longitude"];
                        let transit_marker = new L.marker([y,x]);
                        let iconLink = "assets/images/bus_icon.png";
                        transit_marker.setIcon(L.icon({
                            iconUrl: iconLink,
                            iconSize: [24, 32],
                            iconAnchor: [12, 32],
                            popupAnchor: [0, -30]
                        }));
                        var route_id = transit_json["entity"][i]["vehicle"]["trip"]["routeId"]
                        var vehicle_id = transit_json["entity"][i]["id"]
                        var speed = transit_json["entity"][i]["vehicle"]["position"]["speed"]
                        transit_marker.bindPopup(" Vehicle ID: " + vehicle_id + ", Route: " + route_id + ", Speed: " + speed + "m/s");
            
                        transit_markers.addLayer(transit_marker)
                        transitLocations.addLayer(transit_marker)
                    }
                })
                .catch(error => {
                    console.log('Error:', error);
                });
            map.addLayer(transit_markers)
        }
        
    }


    function buildScooterMap() {
        for (let i = 0; i < scooterLocations.length; i++) {
            scooterLocations[i].remove();
        }
        if (!document.querySelector(".micromobility").checked) {
            return
        }

        let micromobility = document.querySelector(".micromobility").checked;

        // mobility JSON data
        if (micromobility) {
            scooter_markers = new_scooter_cluster_layer();
            fetch('https://smartcity.tacc.utexas.edu/data/transportation/freebike.json')
              .then(response => {
                // Check if the response is ok (status code in the range 200-299)
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
                return response.json(); // Parse the response body as JSON
              })
              .then(scooter_json => {
                console.log(scooter_json);
                for (let i = 0; i < scooter_json["data"]["bikes"].length; i++) {
                    let y = scooter_json["data"]["bikes"][i]["lat"];
                    let x = scooter_json["data"]["bikes"][i]["lon"];
                    let scooter_marker = new L.marker([y,x]);
                    let iconLink = "assets/images/scooter_icon.png";
                    scooter_marker.setIcon(L.icon({
                        iconUrl: iconLink,
                        iconSize: [24, 32],
                        iconAnchor: [12, 32],
                        popupAnchor: [0, -30]
                    }));
                    var bike_id = scooter_json["data"]["bikes"][i]["bike_id"]
                    var bike_type = scooter_json["data"]["bikes"][i]["vehicle_type_id"]
                    scooter_marker.bindPopup(" ID: " + bike_id + ", Type: " + bike_type);
        
                    scooter_markers.addLayer(scooter_marker)
                    scooterLocations.addLayer(scooter_marker)
                }
            })
            .catch(error => {
                console.log('Error:', error);
            });
            map.addLayer(scooter_markers)
        }
    }

    let incident_markers = []
    function buildLiveIncidentMap() {
        // Delete all markers
        for (var i = 0; i < incident_markers.length; i++) {
            incident_markers[i].remove();
        }
        let incident = document.querySelector(".active_incident").checked;
        if (incident) {
            console.log("Active Incident checked")
            // let incident_json = JSON.parse('[{"Published Date": "09/26/2023 09:27:10 PM +0000", "Issue Reported": "Crash Service", "Address": "4000-4017 S 1st St", "Latitude": 30.225932, "Longitude": -97.769825, "Status": "ACTIVE", "time": "2023-09-26 16:27:10"}, {"Published Date": "09/26/2023 10:33:20 PM +0000", "Issue Reported": "Crash Urgent", "Address": "13318-13534 N Sh 45 W Wb", "Latitude": 30.471481, "Longitude": -97.788028, "Status": "ACTIVE", "time": "2023-09-26 17:33:20"}, {"Published Date": "09/26/2023 10:54:35 PM +0000", "Issue Reported": "Crash Service", "Address": "Provines Dr / N Lamar Blvd", "Latitude": 30.376738, "Longitude": -97.689309, "Status": "ACTIVE", "time": "2023-09-26 17:54:35"}, {"Published Date": "09/26/2023 11:35:47 PM +0000", "Issue Reported": "COLLISION", "Address": "19503 Old Burnet Rd", "Latitude": 30.46461, "Longitude": -97.959907, "Status": "ACTIVE", "time": "2023-09-26 18:35:47"}, {"Published Date": "09/26/2023 11:54:22 PM +0000", "Issue Reported": "Crash Service", "Address": "COLINTON AVE / HARRIS BRANCH PKWY", "Latitude": 30.372672, "Longitude": -97.611924, "Status": "ACTIVE", "time": "2023-09-26 18:54:22"}, {"Published Date": "09/26/2023 11:54:33 PM +0000", "Issue Reported": "Crash Service", "Address": "1971-1975 S Pleasant Valley Rd", "Latitude": 30.233645, "Longitude": -97.723418, "Status": "ACTIVE", "time": "2023-09-26 18:54:33"}]')
            fetch('https://smartcity.tacc.utexas.edu/data/transportation/incident_active.json')
              .then(response => {
                // Check if the response is ok (status code in the range 200-299)
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                  }
                  return response.json(); // Parse the response body as JSON
              })
              .then(incident_json => {
                console.log(incident_json)
                for (let i = 0; i < incident_json.length; i++) {
                    let y = incident_json[i]["Latitude"];
                    let x = incident_json[i]["Longitude"];
                    let incident_marker = new L.marker([y,x]).addTo(map);
                    let iconLink = "assets/images/active_incident_icon.png"
                    incident_marker.setIcon(L.icon({
                        iconUrl: iconLink,
                        iconSize: [22, 32],
                        iconAnchor: [11, 32],
                        popupAnchor: [0, -30]
                    }));
                    let issue = incident_json[i]["Issue Reported"];
                    let address = incident_json[i]["Address"];
                    let pub_time = incident_json[i]["time"];
                    let status = incident_json[i]["Status"];
                    incident_marker.bindPopup(" Issue: " + issue + ", Address: " + address + ", Time: " + pub_time + ", Status: " + status);
                    incident_markers.push(incident_marker);
                }
              })
              .catch(error => {
                console.log('Error:', error);
              });
        }
    }

    function buildArchivedIncidentMap() {
        for (let i = 0; i < incidentLocations.length; i++) {
            incidentLocations[i].remove();
        }
        if (!document.querySelector(".archived_incident").checked) {
            return
        }

        let archived_incident = document.querySelector(".archived_incident").checked;

        // mobility JSON data
        if (archived_incident) {
            archived_incident_markers = new_archived_incident_cluster_layer();
            fetch('https://smartcity.tacc.utexas.edu/data/transportation/incident_archived.json')
              .then(response => {
                // Check if the response is ok (status code in the range 200-299)
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
                return response.json(); // Parse the response body as JSON
              })
              .then(archived_incident_json => {
                console.log(archived_incident_json);
                for (let i = 0; i < archived_incident_json.length; i++) {
                    let y = archived_incident_json[i]["Latitude"];
                    let x = archived_incident_json[i]["Longitude"];
                    let archived_incident_marker = new L.marker([y,x]);
                    let iconLink = "assets/images/archived_incident_icon.png"
                    archived_incident_marker.setIcon(L.icon({
                        iconUrl: iconLink,
                        iconSize: [22, 32],
                        iconAnchor: [11, 32],
                        popupAnchor: [0, -30]
                    }));
                    let issue = archived_incident_json[i]["Issue Reported"];
                    let address = archived_incident_json[i]["Address"];
                    let pub_time = archived_incident_json[i]["time"];
                    let status = archived_incident_json[i]["Status"];
                    archived_incident_marker.bindPopup(" Issue: " + issue + ", Address: " + address + ", Time: " + pub_time + ", Status: " + status);
                    
                    archived_incident_markers.addLayer(archived_incident_marker)
                    incidentLocations.addLayer(archived_incident_marker)
                }
            })
            .catch(error => {
                console.log('Error:', error);
            });
            map.addLayer(archived_incident_markers)
        }
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

    


    let current_watershed_shapefile = null;


    function buildWatershedShapefile() {
        

        if(current_watershed_shapefile != null) {
            map.removeLayer(current_watershed_shapefile);
            current_watershed_shapefile = null;
        }
        if (!document.querySelector(".watershed").checked) {
            return;
        }

        let shpfile = new L.Shapefile('../data/Watershed_Reach_Integrity_Scores.zip', {
            onEachFeature: function(feature,layer){
                console.log(feature);

                let props = feature.properties;
                console.log(props);

              

                let watershedInformationColor = (text) => {
                    let trimmed_text = text.trim();
                    if(trimmed_text == "BAD") {
                        return "crimson";
                    } 
                    if(trimmed_text == "POOR") {
                        return "lightred";
                    } 
                    if(trimmed_text == "MARGINAL") {
                        return "darkorange";
                    }
                    if(trimmed_text == "FAIR") {
                        return "gold";
                    }
                    if(trimmed_text == "GOOD") {
                        return "lightgreen";
                    }
                    if(trimmed_text == "VERY GOOD") {
                        return "mediumturquoise";
                    } 
                    if(trimmed_text == "EXCELLENT") {
                        return "fuchsia";
                    }
                    if(trimmed_text == "NO DATA") {
                        return "lightgray";
                    }
                    
                    return "lightpurple";
                };

                console.log(watershedInformationColor(props.wqcd));
                
                let popup = `<b style="color:#191970; font-size:16px">${props.wshednm} Watershed</b> <br> 
                        <b>Overall Quality:</b> <span style="background-color:${watershedInformationColor(props.ovcd)}"> ${props.ovcd} </span> <br>
                        <b>Aquatic Life:</b> <span style="background-color:${watershedInformationColor(props.alcd)}">${props.alcd} </span>  <br>
                        <b>Eutrophication:</b> <span style="background-color:${watershedInformationColor(props.eucd)}">${props.eucd}  </span> <br>
                        <b>Habitat Quality:</b> <span style="background-color:${watershedInformationColor(props.habcd)}">${props.habcd}  </span> <br>
                        <b>Sediment Quality:</b> <span style="background-color:${watershedInformationColor(props.sedcd)}">${props.sedcd}  </span> <br>
                        <b>Vegetation:</b> <span style="background-color:${watershedInformationColor(props.vegcd)}">${props.vegcd} </span>  <br>
                        <b>Water Chemistry:</b> <span style="background-color:${watershedInformationColor(props.wqcd)}">${props.wqcd}  </span> <br>` 
                layer.options.color = watershedInformationColor(props.ovcd);
                layer.options.outline = 'black';
                layer.options.weight = 2;
                console.log(props);

                layer.bindPopup(popup);
                
            }
        });


      

        shpfile.addTo(map);
        current_watershed_shapefile = shpfile;

    
        
        
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

    

    let current_road_incident = null
    function buildRoadIncident() {
        if (current_road_incident != null){
            map.removeLayer(current_road_incident)
            current_road_incident = null
        }
        if (!document.querySelector(".road_incident").checked) {
            return
        }
        let shapefile_path = "data/road_incident.zip";
        let popupContent = ``;
        function getColor(d) {
            return d > 1000 ? '#800026' :
                   d > 500  ? '#BD0026' :
                   d > 300  ? '#E31A1C' :
                   d > 100  ? '#FC4E2A' :
                   d > 50   ? '#FD8D3C' :
                   d > 10   ? '#FEB24C' :
                   d > 0   ? '#FED976' :
                              '#FFEDA0';
        }
        let shpfile = new L.Shapefile(shapefile_path, {
            onEachFeature: function(feature,layer){
                let count = Number(feature.properties["count"]);
                if(count >= 10) {
                    popupContent = `
                    <div class="basic-info">
                        <span>ID: ${feature.properties["LINEARID"]}</span><BR>
                        <span>Name: ${feature.properties["FULLNAME"]} </span><BR>
                    </div>
                    <div class="stats-info">
                        <span>Incident Count: ${feature.properties["count"]} </span><BR>
                    </div>
                    `;
                }
                else {
                    popupContent = `
                    <div class="stats-info">
                        <span>Incident Count: ${feature.properties["count"]} </span><BR>
                    </div>
                    `;
                }
                layer.bindPopup(popupContent);
                layer.options.color = getColor(count)
                layer.options.weight = 2
            }
        })
        shpfile.addTo(map);
        current_road_incident = shpfile;
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
        checkList.getElementsByClassName('anchor')[0].onclick = function (evt) {
            if (checkList.classList.contains('visible'))
                checkList.classList.remove('visible');
            else
                checkList.classList.add('visible');
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

    var currentLon = -1;
    var currentLat = -1;
    var predictedNoise = -1;
    var selectedNoise = 40;

    function openNoiseMore() {
        console.log("hey")
        var moreButton = document.getElementById("openSurveyButton");
        
        if(moreButton.textContent != "Close") {
            document.getElementById("noiseSurvey").style.display = "block";
            document.getElementById("openSurveyButton").style.display = "none";
            document.getElementById("noiseDescrip").style.display = "none";
        }
        //airMarkerPopup += `<a href="#">More...</a>`
    }

    function slide(amount) {

        var comparison = "a whisper"
        selectedNoise = amount;
        if(amount < 40) {
            comparison = "a whisper (or quieter)"
        } else if(amount < 50) {
            comparison = "rain"
        } else if(amount < 60) {
            comparison = "an average indoor room"
        } else if(amount < 70) {
            comparison = "an average office room"
        } else if(amount < 80) {
            comparison = "landscaping equipment (from inside a home)"
        } else if(amount < 85) {
            comparison = "an electric vacuum"
        } else if(amount < 90) {
            comparison = "a noisy restaurant"
        } else if(amount < 95) {
            comparison = "a hairdryer"
        } else if(amount < 100) {
            comparison = "a professional sports game"
        } else if(amount < 110) {
            comparison = "a lawn mower"
        } else if(amount < 120) {
            comparison = "an ambulance"
        }  else if(amount < 130) {
            comparison = "a jackhammer"
        } else {
            comparison = "a gun firing (or louder)"
        }

    
        document.getElementById("noiseScaleLabel").innerText = comparison + " (" + amount + " db)";
    }

    
    function onSubmit() {
        const db = app.database();
    
        // A post entry.
        const postData = {
            date: new Date(),
            longitude: currentLon,
            latitude: currentLat,
            predictedNoiseLevel: predictedNoise,
            userSubmittedNoiseLevel: parseInt(selectedNoise)
        };
    
        // Get a key for a new Post.
        db.ref("user_noise_submission/").push(postData).then(() => {
            document.getElementById("noiseSurvey").style.display = "none";
            document.getElementById("noiseDescrip").style.display = "block";
            document.getElementById("noiseDescrip").style.fontSize = "16px";
            document.getElementById("noiseDescrip").innerText = "Thank you for your input!"
        });
    }

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
            const noise_level = eventPoint[2];
           
            // calculate distance from noise point, if less than 20 meters (20 / 111139), use as noise level, if not consider noise level normal
            const dist = ((Math.abs(e.latlng.lat - latitude) + Math.abs(e.latlng.lng - longitude)) / 2);
            if(dist <= degreePerMeter * pointRadiusDetection) {
                if(dist <= bestPointDistance) {
                    bestPointDistance = dist;
                    bestEventLevel = noise_level;
                    currentLon = longitude;
                    currentLat = latitude;
                    predictedNoise = noise_level;
                }
        
            }

            
        }

        var extraInformation = "The noise levels around you are as loud as a whisper. These levels of noise are <i>safe!</i>"
        if(bestEventLevel < 40) {
            extraInformation = "The noise levels around you are as loud as a whisper. These levels of noise are <i>safe!</i>"
        } else if(bestEventLevel < 60) {
            extraInformation = "The noise levels around you are as loud as an average indoor room. These levels of noise are <i>safe!</i>"
        } else if(bestEventLevel < 70) {
            extraInformation = "The noise levels around you are as loud as an average office room. These levels of noise are <i>safe!</i>"
        } else if(bestEventLevel < 80) {
            extraInformation = "The noise levels around you are as loud as landscaping equipment (from inside a home). These levels of noise can be <i>dangerous</i> if you are exposed to them over time. "
        } else if(bestEventLevel < 85) {
            extraInformation = "The noise levels around you are as loud as an electric vacuum. These levels of noise can be <i>dangerous</i> if you are exposed to them over time. "
        } else if(bestEventLevel < 85) {
            extraInformation = "The noise levels around you are as loud as an electric vacuum. These levels of noise can be <i>dangerous</i> if you are exposed to them over time. "
        } else if(bestEventLevel < 90) {
            extraInformation = "The noise levels around you are as loud as a noisy restaurant. These levels of noise can be <i>dangerous</i> if you are exposed to them over time. "
        } else if(bestEventLevel < 95) {
            extraInformation = "The noise levels around you are as loud as a hairdryer. These levels of noise can be <i>dangerous</i> if you are exposed to them over time. "
        } else if(bestEventLevel < 100) {
            extraInformation = "The noise levels around you are as loud as a pro sports game. These levels of noise can be <i>dangerous</i> if you are exposed to them over time. "
        } else if(bestEventLevel < 100) {
            extraInformation = "The noise levels around you are as loud as a pro sports game. These levels of noise can be <i>dangerous</i> if you are exposed to them over time. "
        } else if(bestEventLevel < 110) {
            extraInformation = "The noise levels around you are as loud as a lawn mower. These levels of noise are dangerous and can cause pain. If you are exposed to these levels, please wear sound protection."
        } else if(bestEventLevel < 120) {
            extraInformation = "The noise levels around you are as loud as an ambulance. These levels of noise are dangerous and can cause pain. If you are exposed to these levels, please wear sound protection."
        }  else if(bestEventLevel < 130) {
            extraInformation = "The noise levels around you are as loud as a jackhammer. These levels of noise are dangerous and can cause pain. If you are exposed to these levels, please wear sound protection."
        } else {
            extraInformation = "The noise levels around you are as loud or louder than a gun firing. These levels of noise are dangerous and can cause pain. If you are exposed to these levels, please wear sound protection."
        }
        
        const submitContent = 
                            `<div style="display:none" id="noiseSurvey">
    
                                <span style="font-size:12px">What does the noise around you (outside) sound like? </span><br>
                                As loud as <b id="noiseScaleLabel">rain (40 db)</b>
                                <div class="slidecontainer">
                                    <input type="range" min="25" max="130" value="40" class="slider" id="myRange" onChange="slide(this.value)">
                                </div>
                                <a id="" href="#" onclick="onSubmit()" ><b>Submit</b></a>

                            </div>`

        


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

    // map today's dp
    let dateArray = [];
    var today = new Date();
    var date = today.getFullYear() + '-' + ("0" + (today.getMonth() + 1)).slice(-2) + '-' + ("0" + today.getDate()).slice(-2);
    dateArray.push(date);
    // mapFireIncident(map, dateArray, inactive_flag, shapefile_display_flag, purple_air_diaplay_flag, microsoft_air_display_flag);
    // addShapefileRadioListener(map);
    buildSelectBar(map);
    buildDropdownMenu(map);




    map._layersMaxZoom = 19;

    document.querySelector('.afd-legend').style.display = 'none';
    document.querySelector('.air-quality-legend').style.display = 'none';
    document.querySelector('.fire-risk-legend').style.display = 'none';
    document.querySelector('.hvi-legend').style.display = 'none';




    // add zostera legend
    L.control.legend({
        position: 'bottomleft',
        items: [
            {color: 'white', label: '<b>Fire Risk</b>'},
            {color: 'red', label: 'Highest'},
            {color: 'orange', label: 'Elevated'},
            {color: 'yellow', label: 'Low'},
            {color: 'white', label: ''},
            {color: 'white', label: '<b>Smoke Levels</b>'},
            {color: '#9cd74e', label: 'Good'},
            {color: '#facf39', label: 'Moderate'},
            {color: '#f68f47', label: 'Unhealthy for Sensitive Groups'},
            {color: '#f55e5f', label: 'Unhealthy'},
            {color: '#a070b5', label: 'Very Unhealthy'},
            {color: '#a06a7b', label: 'Hazardous'},
        ],
        collapsed: true,
        // insert different label for the collapsed legend button.
        buttonHtml: 'Legend'
    }).addTo(map);

    document.getElementsByClassName("leaflet-left")[1].style.left = "5px"
    document.getElementsByClassName("leaflet-legend-list")[0].style = "text-align: left;"

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

// default for noise map
let eventCheckbox = document.querySelector(".event_likelihood")
if(eventCheckbox.checked) {
    buildEventLayer()
}

// default for noise map
let subjectivityCheckbox = document.querySelector(".subjectivity")
if(subjectivityCheckbox.checked) {
    buildSubjectivityLayer()
}


L.control.watermark({ position: 'bottomright' }).addTo(map);

//document.getElementsByClassName("geocoder-control")[0].style = "position:fixed;width: 10px;top: 2.5px;right: 67.5px;"


    var spinner = document.getElementById('spinner');
    spinner.style.display = 'none';

    document.getElementsByClassName( 'leaflet-control-attribution' )[0].style.display = 'none';



    //buildWeeklyLineChart();
    //buildWeeklyColumnChart();
    //buildPerHourBoxChart();

    // fetch('../data/AverageFire.json').then(response => {
    //     // Replace all instances of "NaN" with 0
    //     return response.text().then(text => text.replace(/NaN/g, 0));
    //     }).then(jsondata => {

    //     result = JSON.parse(jsondata)
    //     console.log(result)

    //     window.AverageFire = result;
    // });

   
