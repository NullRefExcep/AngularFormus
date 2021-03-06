/** Gulp Modules */
var gulp = require('gulp'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    ngmin = require('gulp-ngmin'),
    connect = require('gulp-connect'),
    minifyHTML = require('gulp-minify-html'),
    karma = require('gulp-karma'),
    wiredep = require('wiredep'),
    templateCache = require('gulp-angular-templatecache');

/** Pathes */
var scriptsGlob = ['src/formus.js', 'src/*.js'];
var viewsGlob = ['src/views/**/*.html'];
var buildDir = './build/';
var testDir = './tests/';
var appDir = './app/';
var distDir = './dist/';
var buildGlob = [buildDir + 'formus.js', buildDir + 'templates.js'];

/** Tasks  */
gulp.task('scripts', function() {
    return gulp.src(scriptsGlob)
        .pipe(concat('formus.js'))
        .pipe(header('(function () {\n'))
        .pipe(footer('})();'))
        .pipe(gulp.dest(buildDir));
});

gulp.task('views', function() {
    return gulp.src(viewsGlob)
        .pipe(minifyHTML({
            empty: true
        }))
        .pipe(templateCache({
            module: 'formus',
            root: 'formus'
        }))
        .pipe(gulp.dest(buildDir));
});

gulp.task('build', ['scripts', 'views']);

gulp.task('app', ['build'], function() {
    gulp.src(buildGlob)
        .pipe(gulp.dest(appDir + 'js'))
        .pipe(connect.reload());
});

gulp.task('dist', ['build'], function() {
    gulp.src(buildGlob)
        .pipe(concat('formus.js'))
        .pipe(ngmin())
        .pipe(gulp.dest(distDir))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest(distDir));

});

gulp.task('connect', function() {
    connect.server({
        root: appDir,
        port: 8081,
        livereload: true
    });
});

gulp.task('html', function() {
    gulp.src(appDir + '**/*')
        .pipe(connect.reload());
});

gulp.task('watch', function() {
    gulp.watch(scriptsGlob, ['scripts', 'app']);
    gulp.watch(viewsGlob, ['views', 'app']);
    gulp.watch(appDir + '**/*', ['html']);
});

gulp.task('test', function() {
    var bowerDeps = wiredep({
        directory: appDir + 'vendors',
        dependencies: true,
        devDependencies: true
    });
    var testGlob = bowerDeps.js.concat(scriptsGlob, [testDir + 'unit/*']);
    return gulp.src(testGlob)
        .pipe(karma({
            basePath: '..',
            configFile: testDir + 'karma.conf.js',
            action: 'run'
        }))
        .on('error', function(err) {
            throw err;
        });
});

gulp.task('default', ['app', 'connect', 'watch']);
