// This function gets user input to construct date range for filtering
exports.getDateRange = function(year) {
  // year = parseInt(year, 10);
  return { // returns object, invoke ee.Date() constructor
    start: ee.Date(year + '-01-01'),
    end: ee.Date(year + '-12-31'),
  };
};
