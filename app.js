// Load calculate script
var calculate = require('users/gulandras90/gee_course_2019:calculate');

// Load date method
var date = require('users/gulandras90/gee_course_2019:utils/date');

// Our study area, a big part of Amazonia, center map view to our study area
var amazonia = ee.Geometry.Polygon(
  [[[-62.086887087616674, -5.04266664708591],
    [-62.086887087616674, -8.967430982430537],
    [-53.451633181366674, -8.967430982430537],
    [-53.451633181366674, -5.04266664708591]]], null, false);

// Clear initial map view
ui.root.clear();

// Create a control panel for user input, style it
var controlPanel = ui.Panel({
  layout: ui.Panel.Layout.flow('vertical'),
  style: {
    width: '320px',
  }
});

// Add our control panel to root
ui.root.add(controlPanel);

// Our map view, centered on our study area
var myMap = ui.Map();
myMap.centerObject(amazonia);

// Add our map view to the empty layout
ui.root.add(myMap);

// default value
var year = 2019;
// Get date range
var dateRange = date.getDateRange(year);

// Calculate initial maps
calculate.calculateMaps(myMap, amazonia, dateRange);


// UI elements and their styling
var formLabel = ui.Label('Amazonas monitoring');
formLabel.style().set({
  fontSize: '28px',
  fontWeight: 700,
  color: '#aa3300',
  padding: '0px'
});


var selectYearLabel = ui.Label('Standardizált NDVI számítása erre az évre:');
selectYearLabel.style().set({
  fontSize: '14px',
  fontWeight: 400,
  color: '#444444',
  padding: '0px'
});

// label for the selected year in the legend
var yearLabel = ui.Label(year);
yearLabel.style().set({
  fontSize: '24px',
  fontWeight: 700,
  color: '#444444',
  padding: '0px'
});


// Set position of panel
var myLegend = ui.Panel({
  style: {
    position: 'bottom-right',
    padding: '10px',
    backgroundColor: 'rgb(255, 255, 255)'
  }
});

// Add items to the legend and map
myLegend.add(yearLabel);
myMap.add(myLegend);

// year selection slider
var yearSlider = ui.Slider({
  min: 2013,
  max: new Date().getFullYear(),
  value: new Date().getFullYear(),
  step: 1,
  onChange: function () {
    // Get user selected year value
    var year = yearSlider.getValue();
    
    var dateRange = date.getDateRange(year);
  
    // Clear previous state of the Map
    myMap.clear();
    myLegend.clear();
    
    yearLabel.setValue(year);
    
    // Add panels and widgets to the map
    myLegend.add(yearLabel);
    myMap.add(myLegend);
    
    // Calculate maps
    calculate.calculateMaps(myMap, amazonia, dateRange);
  }
});


// Define min width to the slider
yearSlider.style().set({
  minWidth: '220px'
});

// Add elements to the sidebar / control panel
controlPanel.add(formLabel);
controlPanel.add(selectYearLabel);
controlPanel.add(yearSlider);
