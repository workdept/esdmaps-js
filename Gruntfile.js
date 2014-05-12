module.exports = function(grunt) {
  grunt.initConfig({
    bakegeojson: {
      recommendedSpring2014: { 
        spreadsheetId: '0AtLDi9SHMwnrdDVMVWhfUVVNdFBMSlprc0x1YnQ1Vnc', 
        properties: ["schoolname", "scorecard-url", "address", "city", "state", "zip"],
        output: 'data/recommended-k-8-schools-2014-spring.json'
      }
    }
  });

  grunt.loadTasks('./tasks');
};
