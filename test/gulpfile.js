var gulp = require('gulp');

var testApp = require('./index');

gulp.task('systemTest', function () {
    return testApp.test.system.run() ;
});
gulp.task('integrationTest', function () {
    return testApp.test.integration.run() ;
});
gulp.task('unitTest', function () {
    return testApp.test.unit.run() ;
});

gulp.task('default', ['systemTest', 'integrationTest','unitTest'] , function () {
    console.log( 'test task finish.' ) ;
});
