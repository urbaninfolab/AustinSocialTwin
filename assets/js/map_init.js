/**
 * map_init.js
 * 
 * Main map initialization script
 * Integrates generic functionality and project-specific features
 */

// ============================================
// Global Variables
// ============================================

var map; // Map object, available in global scope

// ============================================
// Main Initialization Function
// ============================================

/**
 * Initialize map and all features
 */
function initMapAndFeatures() {
    // 1. Initialize map
    map = initMap('map', [30.356635, -97.701180], 12);
    
    // 2. Add base layer
    addMapLayer(map);
    
    // 3. Initialize geocoding search
    var esriApiKey = 'AAPK88fbee9b41364fc28314cabcb5108702X4OOHT6TEoflnY2xPNIuDPA8zi_zSGHg0weTJJzjiOFWugapHwRA5DvZw7Uht0eR';
    initGeocodingSearch(map, esriApiKey);
    
    // 4. Build dropdown menu (includes project-specific event bindings)
    buildDropdownMenu(map);
    
    // 5. Setup map click event handler
    setupMapClickHandler(map);
    
    // 6. Create custom control buttons
    createLocationButton(map).addTo(map);
    createLayersButton(map).addTo(map);
    
    // 7. Initialize default layers
    initDefaultLayers();
    
    // 8. Hide loading spinner
    hideSpinner();
    
    console.log('Map and features initialized successfully');
}

// ============================================
// Initialize After Page Load
// ============================================

// Ensure initialization after DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMapAndFeatures);
} else {
    // DOM already loaded
    initMapAndFeatures();
}

