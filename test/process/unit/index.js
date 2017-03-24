var gulp = require('gulp');
var mocha = require('gulp-mocha');

var config　=　require('../../config/config.js')　;
var unitConfig = config.process.unit ;

var assert = require('assert') ;

function UnitProcess(){
    this.CacheData = unitConfig.structs.CacheData.src ;
    this.Queue = unitConfig.structs.Queue.src ;

    this.BaseMiddleware = unitConfig.middlewares.BaseMiddleware.src ;
    this.Compression = unitConfig.middlewares.Compression.src ;
    this.Hash = unitConfig.middlewares.Hash.src ;
    // this.Logger = unitConfig.middlewares.Logger.src ;
    this.Validation = unitConfig.middlewares.Validation.src ;

    this.BaseProvider = unitConfig.providers.BaseProvider.src ;
    this.FileCacheProvider = unitConfig.providers.FileCacheProvider.src ;
    this.MemoryCacheProvider = unitConfig.providers.MemoryCacheProvider.src ;
    this.RedisCacheProvider = unitConfig.providers.RedisCacheProvider.src ;
    this.MultiCacheProvider = unitConfig.providers.MultiCacheProvider.src ;
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