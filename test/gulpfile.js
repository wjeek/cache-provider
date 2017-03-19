var gulp = require('gulp');
var testApp = require('./index');

gulp.task('systemTest', function () {
    return testApp.systemTest ;
});
gulp.task('integrationTest', function () {
    return testApp.integrationTest ;
});
gulp.task('unitTest', function () {
    return testApp.unitTest ;
});

gulp.task('default', ['systemTest', 'integrationTest','unitTest'] , function () {
    console.log( 'test task finish.' ) ;
});