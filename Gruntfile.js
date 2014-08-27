'use strict';

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths for the application
    var appConfig = {
        app: require('./bower.json').appPath || 'app',
        src: 'src',
        dist: 'dist'
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: appConfig,

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep']
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

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            src: {
                src: [
                    'Gruntfile.js',
                    '<%= yeoman.src %>/*.js'
                ]
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [
                    {
                        dot: true,
                        src: [
                            '.tmp',
                            '<%= yeoman.dist %>/{,*/}*',
                            '!<%= yeoman.dist %>/.git*'
                        ]
                    }
                ]
            },
            server: '.tmp'
        },

        // Automatically inject Bower components into the app
        wiredep: {
            app: {
                src: ['<%= yeoman.app %>/index.html'],
                dependencies: true,
                devDependencies: true
            }
        },
        concat: {
            options: {
              separator: ';'
            },
            src: {
              src: '<%= yeoman.src %>/*.js',
              dest: '<%= yeoman.app %>/js/formus.js'
            },
            dist: {
              src: '<%= yeoman.src %>/*.js',
              dest: '<%= yeoman.dist %>/formus.js'
            }
        },


        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [
                ]
            },
            styles: {
                expand: true,
                cwd: '<%= yeoman.app %>/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            }
        },
        ngtemplates: {
            app: {
                cwd: '<%= yeoman.app %>',
                src: ['views/**/*.html','views/*.html'],
                dest: '<%= yeoman.app %>/scripts/templates.js',
                options: {
                    htmlmin: { collapseWhitespace: true, collapseBooleanAttributes: true }
                }
            }
        }
    });

    grunt.registerTask('default', [
        'watch'
    ]);
};
