exports.calculateMaps = function(myMap, studyArea, dateRange) {
  // Load quality mask methods
  var qm = require('users/gulandras90/gee_course_2019:utils/qualityMask');

  // Load indices methods
  var indices = require('users/gulandras90/gee_course_2019:utils/indices');

  // Add masked NDVI band to the images in the collection
  var addNDVIMaskedBand = function(image) {
    return function (image) {
      return image.addBands(indices.getNDVI(image).rename('NDVI_masked'));
    };
  };

  var cloudFilter = ee.Filter.lessThanOrEquals('CLOUD_COVER', 20);
  var product = 'LANDSAT/LC08/C01/T1_SR';

  // Get images for user defined year and month (monthly data)
  var landsat = ee.ImageCollection(product)
    .filterBounds(studyArea)
    .filterDate(dateRange.start, dateRange.end)
    .filter(cloudFilter)
    .map(qm.addMask(product))
    .map(qm.addMaskedBands(product))
    .map(addNDVIMaskedBand(product))
    ;

  print(landsat);


  // color palettes
  var ndviColors = ['#3461FF', '#E86303', '#C6EE53', '#59CE46','#00440F'];
  var standardizedColors =  ['#ff0200', '#e2ff08', '#005e0b', '#15fff6', '#0011ff'];

  // Get visualization settings
  // arrayParams: array of band names or palette colors
  function getVisuals(type, min, max, arrayParams) {
    if (type === 'composite') {
      return {
        bands: arrayParams,
        min: min,
        max: max,
        gamma: 1.3
      };
    } else if (type === 'palette') {
      return {
        min: min,
        max: max,
        palette: arrayParams
      };
    } else {
      return null;
    }
  }

  // Create a mean annual composite, add to map
  var annualComposite = landsat.mean().clip(studyArea);
  
  // Add RGB composite to map
  myMap.addLayer(annualComposite, getVisuals('composite', 150, 1500,  ['B4_1', 'B3_1', 'B2_1']), 'RGB543 kompozit');

  // Add NDVI to map
  myMap.addLayer(annualComposite.select(['NDVI_masked']), getVisuals('palette', -0.1, 1, ndviColors), 'NDVI monthly map');


  // reference period is 2014-2018
  var referencePeriod = ee.ImageCollection(product)
    .filterBounds(studyArea)
    .filterDate('2014-01-01', '2018-12-31')
    .filter(cloudFilter)
    .map(qm.addMask(product))
    .map(qm.addMaskedBands(product))
    .map(addNDVIMaskedBand(product))
    ;
  
  print(referencePeriod);

  var referenceNDVIMean = referencePeriod.select('NDVI_masked').mean().clip(studyArea);
  var referenceNDVIStdev = referencePeriod.select('NDVI_masked').reduce(ee.Reducer.stdDev()).clip(studyArea);

  // Standardize dataset
  // anomalies: Subtract the mean of the reference period from the current value
  var anomaly = annualComposite.select('NDVI_masked').subtract(referenceNDVIMean);
  
  // Divide the anomalies with the standard deviation of the reference period
  // Apply a smoothing median kernel (1.5 pixel)
  var standardizedNDVI = anomaly.divide(referenceNDVIStdev).focal_median();

  myMap.addLayer(standardizedNDVI, getVisuals('palette', -3, 3, standardizedColors), 'standardized NDVI map');

  // Create a colored outline for our study area on the map view
  var empty = ee.Image().byte();
  var outline = empty.paint({
    featureCollection: studyArea,
    color: 1,
    width: 3
  });

  myMap.addLayer(outline, {palette: 'FF6600'}, 'Study area');
};
