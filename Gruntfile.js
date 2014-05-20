module.exports = function(grunt) {
  grunt.initConfig({
    bakegeojson: {
      recommendedSpring2014: { 
        spreadsheetId: '0AtLDi9SHMwnrdDVMVWhfUVVNdFBMSlprc0x1YnQ1Vnc', 
        properties: ["schoolname", "scorecard-url", "address", "city", "state", "zip"],
        output: 'data/recommended-k-8-schools-2014-spring.json'
      }
    },

    uglify: {
      dist: {
        options: {
          sourceMap: true
        },
        files: {
          'esdmaps.min.js': ['esdmaps.js'],
          'esdmaps-embed.min.js' : ['esdmaps-embed.js']
        }
      }
    },

    cssmin: {
      dist: {
        files: {
          'esdmaps.min.css': ['esdmaps.css']
        }
      }
    }
  });

  grunt.loadTasks('./tasks');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('build', ['uglify', 'cssmin']);
};
