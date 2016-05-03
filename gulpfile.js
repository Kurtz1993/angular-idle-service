var gulp = require('gulp');
var webpackStream = require('webpack-stream');
var webpackConfig = require('./webpack.config.js');

var paths = {
    wp: {
        entry: './src/app.ts',
        destPath: './dist/'
    }
};

gulp.task('build', function () {
    webpackConfig.devtool = 'source-map';
    return gulp.src(paths.wp.entry)
        .pipe(webpackStream(webpackConfig))
        .pipe(gulp.dest(paths.wp.destPath));
});