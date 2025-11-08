/**
 * social_twin_map.js
 * 
 * AustinSocialTwin project-specific map functionality
 * Contains social media data-related features such as event prediction, sentiment analysis, tweet density, etc.
 */

// ============================================
// Firebase Configuration and Initialization
// ============================================

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

// ============================================
// Marker Cluster Configuration (if needed)
// ============================================

var markers = L.markerClusterGroup({
    showCoverageOnHover: false,
    iconCreateFunction: function (cluster) {
        var childCount = cluster.getChildCount();
        var markers = cluster.getAllChildMarkers();
        var sum = 0;
        for (var i = 0; i < markers.length; i++) {
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

        return new L.DivIcon({ 
            html: '<div><span><b>' + Math.round(avg) + '</b></span></div>', 
            className: 'marker-cluster' + c, 
            iconSize: new L.Point(40, 40) 
        });
    }
});

// ============================================
// Data Variable Declarations
// ============================================

let eventPoints = [];
let current_event_layer = null;
let current_subjectivity_layer = null;
let current_polarity_layer = null;
let current_tweet_density_layer = null;
let isEventPredictionMap = false;

let sentimentPoints = [];
let polarityPoints = [];
let xDensityPoints = [];

// ============================================
// 1. Event Prediction Related Functionality
// ============================================

/**
 * Build event prediction heatmap
 */
function buildEventHeatmap() {
    eventPoints = [];
    fetch('./data/points.json').then(response => {
        return response.json();
    }).then(points => {
        var min_point = 1000000;
        var max_point = -1000;
        console.log(points);
        
        for (var i = 0; i < points.features.length; i++) {
            eventPoint = points.features[i].properties;
            max_point = Math.max(max_point, eventPoint.score);
            min_point = Math.min(min_point, eventPoint.score);
            eventPoints.push([eventPoint.LATITUDE, eventPoint.LONGITUDE, Math.max(0.001, 2 * eventPoint.score)]);
        }
        
        console.log('Min point:', min_point);
        console.log('Max point:', max_point);
        
        var heat = L.heatLayer(
            eventPoints,
            { radius: 10, min: 0.001, max: 0.02, maxZoom: 2, blur: 10 }
        );

        heat.addTo(map);
        current_event_layer = heat;
    });
}

/**
 * Build event prediction layer
 */
function buildEventLayer() {
    if (current_event_layer != null) {
        map.removeLayer(current_event_layer);
        current_event_layer = null;
        eventPoints = [];
    }
    
    if (!document.querySelector(".event_likelihood") || !document.querySelector(".event_likelihood").checked) {
        return;
    }

    buildEventHeatmap();
    isEventPredictionMap = true;
}

// ============================================
// 2. Subjectivity Analysis Related Functionality
// ============================================

/**
 * Build subjectivity heatmap
 */
function buildSubjectivityHeatmap() {
    sentimentPoints = [];
    fetch('./data/points.json').then(response => {
        return response.json();
    }).then(points => {
        console.log(points);
        
        for (var i = 0; i < points.features.length; i++) {
            eventPoint = points.features[i].properties;
            sentimentPoints.push([eventPoint.LATITUDE, eventPoint.LONGITUDE, eventPoint.AVG_SUBJECTIVITY]);
        }

        var heat = L.heatLayer(
            sentimentPoints,
            { radius: 10, min: 0.3, max: 0.8, maxZoom: 3, blur: 5 }
        );

        heat.addTo(map);
        current_subjectivity_layer = heat;
    });
}

/**
 * Build subjectivity layer
 */
function buildSubjectivityLayer() {
    if (current_subjectivity_layer != null) {
        map.removeLayer(current_subjectivity_layer);
        current_subjectivity_layer = null;
        sentimentPoints = [];
    }
    
    if (!document.querySelector(".subjectivity") || !document.querySelector(".subjectivity").checked) {
        return;
    }

    buildSubjectivityHeatmap();
    isEventPredictionMap = false;
}

// ============================================
// 3. Polarity (Sentiment) Analysis Related Functionality
// ============================================

/**
 * Build polarity heatmap
 */
function buildPolarityHeatmap() {
    polarityPoints = [];
    fetch('./data/points.json').then(response => {
        return response.json();
    }).then(points => {
        console.log(points);
        
        for (var i = 0; i < points.features.length; i++) {
            eventPoint = points.features[i].properties;
            polarityPoints.push([eventPoint.LATITUDE, eventPoint.LONGITUDE, eventPoint.AVG_POLARITY]);
        }

        var heat = L.heatLayer(
            polarityPoints,
            { radius: 10, min: 0.3, max: 0.8, maxZoom: 3, blur: 5 }
        );

        heat.addTo(map);
        current_polarity_layer = heat;
    });
}

/**
 * Build polarity layer
 */
function buildPolarityLayer() {
    if (current_polarity_layer != null) {
        map.removeLayer(current_polarity_layer);
        current_polarity_layer = null;
        polarityPoints = [];
    }
    
    if (!document.querySelector(".polarity") || !document.querySelector(".polarity").checked) {
        return;
    }

    buildPolarityHeatmap();
    isEventPredictionMap = false;
}

// ============================================
// 4. Tweet Density Related Functionality
// ============================================

/**
 * Build tweet density heatmap
 */
function buildTweetDensityHeatmap() {
    xDensityPoints = [];
    fetch('./data/points.json').then(response => {
        return response.json();
    }).then(points => {
        console.log(points);
        
        for (var i = 0; i < points.features.length; i++) {
            eventPoint = points.features[i].properties;
            xDensityPoints.push([eventPoint.LATITUDE, eventPoint.LONGITUDE, Math.log(eventPoint.TWEET_COUNT)]);
        }

        var heat = L.heatLayer(
            xDensityPoints,
            { radius: 10, min: 0, max: 11, maxZoom: 3, blur: 5 }
        );

        heat.addTo(map);
        current_tweet_density_layer = heat;
    });
}

/**
 * Build tweet density layer
 */
function buildTweetDensityLayer() {
    if (current_tweet_density_layer != null) {
        map.removeLayer(current_tweet_density_layer);
        current_tweet_density_layer = null;
        xDensityPoints = [];
    }
    
    if (!document.querySelector(".tweet_density") || !document.querySelector(".tweet_density").checked) {
        return;
    }

    buildTweetDensityHeatmap();
    isEventPredictionMap = false;
}

// ============================================
// 5. Traffic Layer (Project-Specific Implementation)
// ============================================

let current_traffic_layer = null;

/**
 * Build traffic map layer
 * Note: This is a project-specific implementation, the generic buildTrafficMap can also be used
 */
function builtTrafficMap() {
    if (current_traffic_layer != null) {
        map.removeLayer(current_traffic_layer);
        current_traffic_layer = null;
    }
    
    if (!document.querySelector(".traffic_condition") || !document.querySelector(".traffic_condition").checked) {
        return;
    }
    
    let traffic_layer = L.gridLayer.googleMutant({
        type: "roadmap",
        styles: [
            { featureType: "all", stylers: [{ visibility: "off" }] },
        ],
    }).addTo(map);
    
    traffic_layer.addGoogleLayer("TrafficLayer");
    current_traffic_layer = traffic_layer;
}

// ============================================
// 6. Dropdown Menu Event Binding (Project-Specific)
// ============================================

/**
 * Build dropdown menu (includes project-specific event listeners)
 * This function combines the generic menu framework with project-specific event bindings
 */
function buildDropdownMenu(map) {
    // Use generic menu framework
    var menuBase = buildDropdownMenuBase(map, 'filter-menu', 'filter-menu-overlay');
    
    if (!menuBase) {
        console.error('Failed to initialize dropdown menu');
        return;
    }

    // ============================================
    // Project-specific: Bind checkbox event listeners
    // ============================================
    
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

// ============================================
// 7. Map Click Event Handling (Project-Specific)
// ============================================

/**
 * Setup map click event handler
 * Handles event prediction popup display
 */
function setupMapClickHandler(map) {
    map.on('click', function (e) {
        if (current_event_layer == null) {
            return;
        }

        // Ensure it's the event prediction layer
        if (!isEventPredictionMap) {
            return;
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

            // Calculate distance
            const dist = ((Math.abs(e.latlng.lat - latitude) + Math.abs(e.latlng.lng - longitude)) / 2);
            if (dist <= degreePerMeter * pointRadiusDetection) {
                if (dist <= bestPointDistance) {
                    bestPointDistance = dist;
                    bestEventLevel = eventScore;
                }
            }
        }

        // Generate content based on event level
        var content;
        if (bestEventLevel < 0.01) {
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
}

// ============================================
// 8. Initialize Default Layers
// ============================================

/**
 * Initialize default displayed layers
 */
function initDefaultLayers() {
    // Check and initialize event prediction layer
    let eventCheckbox = document.querySelector(".event_likelihood");
    if (eventCheckbox && eventCheckbox.checked) {
        buildEventLayer();
    }

    // Check and initialize subjectivity layer
    let subjectivityCheckbox = document.querySelector(".subjectivity");
    if (subjectivityCheckbox && subjectivityCheckbox.checked) {
        buildSubjectivityLayer();
    }
}

// ============================================
// 9. Custom Control Creation (Project-Specific)
// ============================================

/**
 * Create location button control
 */
function createLocationButton(map) {
    return createCustomControl({
        title: "Check My Location",
        position: 'bottomright',
        html: `<div class="geocoder-control-input leaflet-bar" title="Check My Location" style="position:absolute;top:0px; background-image: url(https://smartcity.tacc.utexas.edu/FireIncident/assets/images/location.png)"></div><div class="geocoder-control-suggestions leaflet-bar"><div class=""></div></div>`,
        onClick: function() {
            getUserLocation();
        }
    });
}

/**
 * Create layers button control
 */
function createLayersButton(map) {
    return createCustomControl({
        title: "Layers",
        position: 'bottomright',
        html: `<div class="dropdown-check-list geocoder-control-input leaflet-bar" title="Layers" style="background-color: transparent; border-color: transparent; background-image: url(); width:35px;"><img src="assets/images/layers.png" style="width: 20px;height: 20px;position: absolute;left: 5px;"></div><div class="geocoder-control-suggestions leaflet-bar"><div class=""></div></div>`,
        onClick: null  // Layer button is triggered by dropdown menu anchor, no click event needed here
    });
}

