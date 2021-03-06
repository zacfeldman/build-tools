/**
 * Created by Nikolay Glushchenko <nick@nickalie.com> on 08.09.2015.
 */

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var flatten = require('gulp-flatten');
var common = require('./common');
var sourcemaps = require('gulp-sourcemaps');
var handlebars0 = require('handlebars');

module.exports = function()
{
    console.log('compiling templates with handlebars', handlebars0.VERSION);
    return gulp.src("src/**/*.hbs")
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(handlebars({
            handlebars: handlebars0
        }))
        .pipe(wrap('Handlebars.template(<%= contents %>)'))
        .pipe(declare({
            namespace: 'TEMPLATES',
            root: 'window'
        }))
        .pipe(flatten())
        .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: '../../../src'}))
        .pipe(gulp.dest(common.dist.main + '/templates'));
};
