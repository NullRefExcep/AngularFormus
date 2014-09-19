'use strict';

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    require('time-grunt')(grunt);

    var appConfig = {
        app: require('./bower.json').appPath || 'app',
        src: 'src',
        dist: 'dist'
    };

    grunt.initConfig({

        yeoman: appConfig,

        watch: {
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep']
            },
            app: {
                options: {
                    livereload: true
                },
                files: ['<%= yeoman.app %>/**/*'],
            },
            beauty: {
                files: ['<%= yeoman.src %>/*.js', '<%= yeoman.app %>/**/*', 'Gruntfile.js'],
                tasks: ['jsbeautifier']
            },
            js: {
                files: ['<%= yeoman.src %>/*.js'],
                tasks: ['concat:src']
            },
            dist: {
                files: ['<%= yeoman.app %>/js/formus.js'],
                tasks: ['concat:dist']
            }
        },

        jshint: {
            options: {
                globals: {},
                predef: [
                    'angular',
                    '_'
                ]
            },
            src: {
                src: [
                    '<%= yeoman.src %>/*.js'
                ]
            }
        },

        wiredep: {
            app: {
                src: ['<%= yeoman.app %>/index.html'],
                dependencies: true,
                devDependencies: true
            }
        },

        jsbeautifier: {
            default: {
                src: ["<%= yeoman.src %>/*.js"]
            },
            grunt: {
                src: ["Gruntfile.js"]
            },
            app: {
                src: ['<%= yeoman.app %>/*.*']
            }
        },

        concat: {
            options: {
                separator: ';\n'
            },
            src: {
                options: {
                    banner: ";(function( window, undefined ){ \n'use strict'; \n",
                    footer: "\n}( window ));"
                },
                src: ['<%= yeoman.src %>/formus.js', '<%= yeoman.src %>/*.js'],
                dest: '<%= yeoman.app %>/js/formus.js'
            },
            dist: {
                src: '<%= yeoman.src %>/*.js',
                dest: '<%= yeoman.dist %>/formus.js'
            }
        },

        connect: {
            all: {
                options: {
                    open: true,
                    port: 9009,
                    hostname: '*',
                    keepalive: true,
                    livereload: true,
                    useAvailablePort: true,
                    base: '<%= yeoman.app %>'

                }
            }
        }
    });

    grunt.registerTask('default', [
        'watch'
    ]);
    grunt.registerTask('hint', [
        'jshint'
    ]);
    grunt.registerTask('beauty', [
        'jsbeautifier'
    ]);
    grunt.registerTask('server', [
        'connect'
    ]);
};
