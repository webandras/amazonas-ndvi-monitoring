exports.getNDVI = function(image) {
  return image.normalizedDifference(['B5_1', 'B4_1']);
};
