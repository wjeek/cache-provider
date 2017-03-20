var gulp = require('gulp');
var mocha = require('gulp-mocha');

var config　=　require('../../config/config.js')　;
var unitConfig = config.process.unit ;

var assert = require('assert') ;

function UnitProcess(){
    this.Queue = unitConfig.structs.Queue.src ;
    
}

UnitProcess.prototype.init = function () {

}

UnitProcess.prototype.run = function () {

    return gulp.src([ __dirname + '/*.test.js'],{
        read : false
    }).pipe(mocha({
        reporter : 'spec'
    }));

}

module.exports　= new UnitProcess() ;