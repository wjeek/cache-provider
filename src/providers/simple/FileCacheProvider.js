var fs = require('fs');
var async = require('async');
var readline = require('readline');
var BaseProvider = require('../BaseProvider');
var CacheData = require('../../structs/CacheData');
var CacheResult = require('../../structs/CacheResult');

//考虑到内存中的队列和数据可能也会备份到本地,设置path方便与本地缓存路径分开存储
/**
 *
 * @param options {Object}
 *        .name {string} 缓存的名称
 *        .maxLength {Integer} 最大长度
 * @constructor
 */
function FileCacheProvider(options) {
    var self = this;
    options = options || {};

    this._name = options.name || 'FileCache';
    this._path = options.path || './cacheFile';
    this._maxLength = options.length || 10000;
    BaseProvider.apply(this, [{
        name: this._name,
        maxLength: this._maxLength
    }]);
    setInterval(self._getQueueSyncFile.bind(self), 600000)
}

FileCacheProvider.prototype = Object.create(BaseProvider.prototype);
FileCacheProvider.prototype.constructor = FileCacheProvider;

/**
 * 批量获取
 * @param values[object]
 *        .key {string}
 *        .meta {object}
 *        .value {string}
 * @param callback {function}
 * @private
 */
FileCacheProvider.prototype._getValues = function (values, callback) {
    if(_getClass(values) == 'Object'){
        values = [values];
    }

    if(!(values instanceof  Array && values.length > 0)){
        callback && callback(new Error('getValues expects en array '), null);
        return;
    }

    var self = this;

    var result = new CacheResult();

    var funcArr = values.map(function (value, index) {
        return function (callback) {
            self._getValue(value, function (err, data) {
                if(err){
                    console.log('第%d个数据获取失败', index);
                    result.failed.push(values[index]);
                }else {
                    result.success.push(data);
                }
                callback && callback(null);
            })
        }
    });

    async.parallelLimit(funcArr, 500, function (error) {
        callback && callback(error, result);
    });
};

/**
 * 重写父类方法
 * @param cacheData {object}
 *        .key {string}
 *        .meta {object}
 *        .value {string}
 * @param callback {function}
 */
FileCacheProvider.prototype._getValue = function(cacheData, callback){
    var self = this;
    var key = cacheData.key || '';
    if(!key){
        callback && callback(new Error('invalid cacheData'), cacheData);
        return;
    }
    var path = self._path;
    setTimeout(function(){
        readStreamFile(key, path, 4, function (err, singleCacheData) {
            if(!err){
                callback && callback(null, singleCacheData);
            } else {
                callback && callback(err, cacheData);
            }
        });
    }.bind(self),0)

};

// 以流的形式读文件
function readStreamFile(key, path, level, callback){
    var key = typeof key == 'string' ?
        key : JSON.stringify(key);
    var streamName = path + '/' + key.replace(/[/]/g,'-');
    var error = null;
    var singleCacheData = new CacheData(key);
    if(fs.existsSync(streamName)){
        var crs = fs.createReadStream(streamName);
        var cReadline = readline.createInterface({
            input: crs,
            output: null
        });
        var index = 1;
        cReadline.on('line', function(line){
            try{
                line = JSON.parse(line);
            }catch(e){
            }
            (index == 1) && (singleCacheData.key = line);
            (index == 2) && (singleCacheData.meta = line);
            (index == 3) && (singleCacheData.extra = line);
            if(index == 4){
                if(line && line.data && line.type == 'Buffer'){
                    line = new Buffer(line.data);
                }
                singleCacheData.value = line;
            }
            if(level <= index){
                cReadline.close();
            }
            index ++;
        });
        cReadline.on('close', function(){
            crs.close();
            callback && callback(null, singleCacheData);
        });
        crs.on('error', function(err){
            crs.close();
            callback && callback(err, singleCacheData);
        });
    } else {
        callback && callback(new Error('no key: ' + key), singleCacheData);
    }
}

/**
 * 批量增加
 * @param values [object]
 *        .key {string}
 *        .meta {object}
 *        .value {string}
 * @param callback {function}
 */
FileCacheProvider.prototype._setValues = function (values, callback) {
    if(!(values instanceof  Array && values.length >0)){
        callback && callback(new Error('setValues expects en array '));
        return;
    }

    var self = this;

    var result = new CacheResult();

    var funcArr = values.map(function (value, index) {
        return function (callback) {
            self._setValue(value, function (err) {
                if(err){
                    console.log('第%d个数据存储失败', index);
                    result.failed.push(values[index]);
                } else {
                    result.success.push(values[index]);
                }
                callback && callback(null);
            })
        }
    });

    async.parallelLimit(funcArr, 500, function (error) {
        callback && callback(error, result);
    });
};

/**
 * 重写父类方法
 * @param cacheData{object}
 *        .key {string}
 *        .meta {object}
 *        .value {string}
 * @param callback {function}
 * @private
 */
FileCacheProvider.prototype._setValue = function (cacheData, callback) {
    var key = cacheData.key || '';
    if(!key){
        callback && callback(new Error('invalid cacheData'), cacheData);
        return;
    }
    var level = 4;
    (Object.getOwnPropertyNames(cacheData.value || {}).length == 0) && (level = 3);

    writeStreamFile(key, this._path, cacheData, level, function(err){
        var callbackData = new CacheData(
            cacheData.key,
            cacheData.meta || {},
            null
        );

        callbackData.extra = {};
        Object.assign(callbackData.extra, cacheData.extra, {name: 'FileCacheProvider'});

        callback && callback(err, callbackData);
    });
};

// 以流的形式写文件
function writeStreamFile(key, path, cacheData, level, callback){
    var key = typeof key == 'string' ?
        key : JSON.stringify(key);

    var meta = typeof cacheData.meta == 'string' ?
        cacheData.meta : JSON.stringify(cacheData.meta || {});

    var extra = cacheData.extra || {};
    extra.name = 'FileCacheProvider';
    extra = JSON.stringify(extra);

    var value = cacheData.value;
    if(value){
        value = typeof cacheData.value == 'string' ? cacheData.value : JSON.stringify(cacheData.value);
    }else{
        value = JSON.stringify(null);
    }

    var streamName = path + '/' + key.replace(/[/]/g,'-');
    var error = null;

    if(fs.existsSync(path)){
        writeStreamWrite();
    } else {
        fs.mkdir(path, function(err){
            writeStreamWrite();
        });
    }
    function writeStreamWrite(){
        if(level < 4){
            var writeStream = fs.createWriteStream(streamName,{flags: 'r+'});
        }else{
            var writeStream = fs.createWriteStream(streamName);
        }

        (level >= 1) && writeStream.write(key + '\r\n');
        (level >= 2) && writeStream.write(meta + '\r\n');
        (level >= 3) && writeStream.write(extra + '\r\n');
        (level >= 4) && writeStream.write(value + '\r\n');
        writeStream.end();

        writeStream.on('error', function(err) {
            callback && callback(err);
        });
        writeStream.on('finish', function(data) {
            callback && callback(error);
        });
    }
}

/**
 * 批量删除
 * @param values [object]
 *        .key {string}
 *        .meta {object}
 *        .value {string}
 * @param callback {function}
 * @private
 */
FileCacheProvider.prototype._deleteValues = function (values, callback) {
    if(!(values instanceof  Array && values.length >0)){
        var err = new Error(
            'deleteValues expects en array '
        );
        callback && callback(err);
        return;
    }

    var self = this;

    var result = new CacheResult();
    // var error = null
    var funcArr = values.map(function (value,index) {
        return function (callback) {
            self._deleteValue(value,function (err, data) {
                if(err){
                    console.log('第%d个数据删除失败',index);
                    result.failed.push(data);
                }else {
                    result.success.push(data);
                }
                callback && callback(null);
            })
        }
    });

    async.parallelLimit(funcArr, 500, function (error) {
        callback && callback(error, result);
    })
};
/**
 * 重写父类方法
 * @param cacheData {object}
 *        .key {string}
 *        .meta {object}
 *        .value {string}
 * @param callback {function}
 */
FileCacheProvider.prototype._deleteValue = function(cacheData, callback) {
    var key = cacheData.key || '';
    if(!key){
        callback && callback(new Error('invalid cacheData'), cacheData);
        return;
    }
    deleteFile(key, this._path, function (err) {
        var callbackData = new CacheData(
            cacheData.key,
            cacheData.meta,
            null
        );
        callbackData.extra = {};
        Object.assign(callbackData.extra, cacheData.extra, {name: 'FileCacheProvider', message: 'FileCache: delete successfully!'});

        callback && callback(err, callbackData);
    })
};

/**
 * 删除本地的指定文件
 * @param key {string}
 * @param path {string}
 * @param callBack {function}
 */
function deleteFile(key, path, callBack) {
    var key = typeof key == 'string' ?
        key : JSON.stringify(key);
    var filePath = path + '/' + key.replace(/[/]/g,'-');
    if(fs.existsSync(filePath)){
        fs.unlink(filePath, function (err) {
            callBack && callBack(err);
        })
    } else {
        callBack && callBack(null);
    }
}


/**
 * 重写父类方法
 * @param callback {function}
 */
FileCacheProvider.prototype._load = function(callback) {
    var files = [], self = this, path = this._path;
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        var queueObj = {}, _queue = {}, noMetaKeys = [];
        (files.length == 0) && callback && callback(null, queueObj);
        files.forEach(function(file, index){
            var curPath = path + "/" + file;
            if(fs.existsSync(curPath)){
                readStreamFile(file, path, 3, function (err, singleCacheData) {
                    if(singleCacheData && singleCacheData.key && singleCacheData.meta && singleCacheData.meta.update_time){
                        try{
                            singleCacheData.key = JSON.parse(singleCacheData.key);
                        }catch(e){}
                        try{
                            singleCacheData.meta = JSON.parse(singleCacheData.meta);
                        }catch(e){}
                        _queue[singleCacheData.key] = singleCacheData.meta;
                    }else{
                        noMetaKeys.push(singleCacheData);
                    }

                    if(files.length == index + 1){
                        queueObj = {
                            _queue: _queue,
                            _length: Object.getOwnPropertyNames(_queue).length
                        };
                        callback && callback(null, queueObj);
                        console.log("load success from fileCache to queue: length " + queueObj._length);
                        if(noMetaKeys.length){
                            self._deleteValues(noMetaKeys);
                        }
                    }
                });
            }
        });
    }
};


FileCacheProvider.prototype._clearValue = function (callback) {
    clearDir(this._path, callback)
};

function clearDir(path, callback){
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file, index){
            var curPath = path + "/" + file;
            if(fs.existsSync(curPath)){
                fs.unlink(curPath, function(err){
                    err && console.log(err);
                });
            }
        });
    }
    callback && callback(null)
}

// 得到信息 queue 及 自身索引
FileCacheProvider.prototype._getInfo = function(cacheData, callback){
    var self = this,
        result = new CacheResult(),
        getQueueQueue = {},
        getFileQueue = {};

    getQueueQueue = JSON.parse(JSON.stringify(self._queue || {}));

    if(getQueueQueue._queue){

        delete getQueueQueue._queue;
    }

    result.success.push({"FileCache queue of Queue": getQueueQueue});
    self._load(function(err, loadResult){
        getFileQueue = JSON.parse(JSON.stringify(loadResult));

        if(getFileQueue._queue){

            delete getFileQueue._queue;
        }
        result.success.push({"FileCache queue of Cache": getFileQueue});
        callback && callback(err, result);
    })
};

FileCacheProvider.prototype._getQueueSyncFile = function(callback){
    var self = this, subArr  = [];
    if(self._queue && self._queue._queue){
        var queueReference = self._queue._queue;
        for(var x in queueReference){
            if(queueReference.hasOwnProperty(x)){
                subArr.push(new CacheData(x, JSON.stringify(queueReference[x] || {})));
            }
        }
    }
    self._setValues(subArr);
};

function _getClass(object){
    return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
};

exports = module.exports = FileCacheProvider;
