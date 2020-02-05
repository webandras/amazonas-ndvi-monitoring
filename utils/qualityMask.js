/* Returns an image containing just the specified QA bits.
 * little-endian encoding
 *
 * Args:
 *   image - The QA Image to get bits from.
 *   start - The first bit position, 0-based.
 *   end   - The last bit position, inclusive.
 *   name  - A name for the output image.
 */
var getQABits = function(image, start, end, newName) {
  // Compute the bits we need to extract.
  // here we get a pattern full of 1111...
  var pattern = 0;
  for (var i = start; i <= end; i++) {
    pattern += Math.pow(2, i);
  }
  return image.select([0], [newName])
    .bitwiseAnd(pattern) // &, extracting bits from the QA band.
    .rightShift(start); // >>, for positioning in the bitfield.
};


// function to obtain the quality mask 
var qualityMask = function(image) {
  // pixel quality attributes generated from the CFMASK algorithm
  var QA = image.select('pixel_qa');
  
  // where data quality is appropiate.
  var noCloudShadow = getQABits(QA, 3, 3, 'cloud_shadow').eq(0);
  var noClouds = getQABits(QA, 5, 5, 'cloud_cover').eq(0);

  // Store mask
  var mask = noCloudShadow.and(noClouds);

  // Return the mask, 1 = keep pixels, 0 = exclude pixels
  return mask;
};

exports.addMask = function(image) {
  return function(image) {
      return image.addBands(qualityMask(image).rename('QA_mask'));
  };
};

exports.addMaskedBands = function(image) {
  return function(image) { 
    return image.addBands(image.updateMask(image.select('QA_mask')));
  };
};
