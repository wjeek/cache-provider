var fs = require('fs');
var defaultFilePath = './cache';
var queueListKey = 'queueList';
var  async = require('async');
var BaseProvider = require('../BaseProvider');
var CacheData = require('../../structs/CacheData');
var exec = require('child_process').exec;

//考虑到内存中的队列和数据可能也会备份到本地,设置path方便与本地缓存路径分开存储
/**
 *
 * @param options {Object}
 *        .name {string} 缓存的名称
 *        .maxLength {Integer} 最大长度
 * @constructor
 */
function FileCacheProvider(options) {
    if (!options) {
        options = {};
    }
    this._name = options.name;
    this._path = '';//预留字段,暂不使用
    this._length = options.length || 10000;
    BaseProvider.apply(this, arguments);
}


FileCacheProvider.prototype = Object.create(BaseProvider.prototype);
FileCacheProvider.prototype.constructor = FileCacheProvider;

/**
 * 重写父类方法
 * @param cacheData {object}
 *        .key {string}
 *        .meta {object}
 *        .value {string}
 * @param callback {function}
 */
FileCacheProvider.prototype._getValue = function(cacheData, callback){
    var key = cacheData.key || '';
    if(key.length == 0){
        var  err = new Error('invalid cacheData');
        callback(err,cacheData);
        return;
    }
    readFile(key,this._path,function (err,value) {
        if(!err){
            callback(null,value);
        }else {
            callback(err,cacheData);
        }
    });
};

/**
 * 批量获取
 * @param values[object]
 *        .key {string}
 *        .meta {object}
 *        .value {string}
 * @param callBack {function}
 * @private
 */
FileCacheProvider.prototype._getValues = function (values,callback) {
    if(!(values instanceof  Array && values.length >0)){
        var err = new Error(
            'getValues expects en array '
        );
        callback(err,null);
        return;
    }

    var self = this;

    var failedArr = [];
    var successArr = [];
    // var error = null
    var funcArr = values.map(function (value,index) {
        return function (callback) {
            self._getValue(value,function (err,data) {
                if(err){
                    console.log('第%d个数据存获取败',index);
                    failedArr.push(values[index]);
                }else {
                    successArr.push(data);
                }
                callback(err);
            })
        }
    });

    async.parallel(funcArr,function (error) {
        callback(error,{
            success:successArr,
            failed:failedArr
        });
    });

};

/**
 * 重写父类方法
 * @param cacheData{object}
 *        .key {string}
 *        .meta {object}
 *        .value {string}
 * @param callBack {function}
 * @private
 */
FileCacheProvider.prototype._setValue = function (cacheData,callback) {
    var key = cacheData.key || '';
    if(key.length == 0){
        var  err = new Error('invalid cacheData');
        callback(err,cacheData);
        return
    }
    writeFile(key,this._path,cacheData,function (err) {
        var callbackData = new CacheData(
            cacheData.key,
            cacheData.meta,
            null
        );
        callback(err,cacheData);
    });
};
/**
 * 批量增加
 * @param values [object]
 *        .key {string}
 *        .meta {object}
 *        .value {string}
 * @param callBack {function}
 */
FileCacheProvider.prototype._setValues = function (values,callback) {
    if(!(values instanceof  Array && values.length >0)){
        var err = new Error(
            'setValues expects en array '
        );
        callback(err);
        return;
    }

    var self = this;

    var failedArr = [];
    var successArr = [];
    var funcArr = values.map(function (value,index) {
        return function (callback) {
            self._setValue(value,function (err) {
                if(err){
                    console.log('第%d个数据存储失败',index);
                    // error = err
                    failedArr.push(values[index]);
                }else {
                    successArr.push(values[index]);
                }
                callback(err);
            })
        }
    });

    async.parallel(funcArr,function (error) {
        callback(error,{
            success:successArr,
            failed:failedArr
        });
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
FileCacheProvider.prototype._deleteValue = function(cacheData,callback) {
    var key = cacheData.key || '';
    if(key.length == 0){
        var  err = new Error('invalid cacheData');
        callback(err,cacheData);
        return;
    }
    deleteFile(key,this._path,function (err) {
        var callbackData = new CacheData(
            cacheData.key,
            cacheData.meta,
            null
        );
        callback(err,callbackData);
    })
};
/**
 * 批量删除
 * @param values [object]
 *        .key {string}
 *        .meta {object}
 *        .value {string}
 * @param callback {function}
 * @private
 */
FileCacheProvider.prototype._deleteValues = function (values,callback) {
    if(!(values instanceof  Array && values.length >0)){
        var err = new Error(
            'deleteValues expects en array '
        );
        callback(err);
        return;
    }

    var self = this;
    var failedArr = [];
    var successArr = [];
    // var error = null
    var funcArr = values.map(function (value,index) {
        return function (callback) {
            self._deleteValue(value,function (err) {
                if(err){
                    console.log('第%d个数据删除失败',index);
                    // error = err
                    successArr.push(values[index]);
                }else {
                    failedArr.push(values[index]);
                }
                callback(err);
            })
        }
    });

    async.parallel(funcArr,function (error) {
        callback(error,{
            success:successArr,
            failed:failedArr
        });
    })
};

/**
 * 重写父类方法
 * @param callback {function}
 */
FileCacheProvider.prototype._load = function(callback) {
    readFile(queueListKey,defaultFilePath,callback);
};
/**
 * 重写父类方法
 */
/**
 *
 * @param queue [object]
 *        .key {string}
 *        .meta {object}
 * @param callback {function}
 * @private
 */
FileCacheProvider.prototype._save = function (queue,callback){
    writeFile(queueListKey,defaultFilePath,queue,function (err) {
        if(err){
            callback(err);
            console.log(err);
        }else {
            callback(null)
        }
    })
};

FileCacheProvider.prototype._clearValue = function (callback) {
    removeDir(this._path,callback)
};



/**
 * 读取本地文件
 * @param key {string}
 * @param path {string}
 * @param callBack {function}
 */
function readFile(key,path,callBack) {
    var filePath = path.length > 0 ? path  : defaultFilePath;
    var  wholePath = filePath + '/' + key;
    fs.open(wholePath,'r',function (err,fd) {
        if(err){
            callBack(err,null);
            return;
        }
        var buff = new Buffer(1024);
        fs.read(fd,buff,0,buff.length,0,function (err,bytes) {
            if(err){
                callBack(err,null);
                return;
            }
            if(bytes > 0){
                var result =  JSON.parse(buff.slice(0,bytes));
                if(result.value && result.value.data && result.value.type == 'Buffer'){//value是字符串的情况,转换后有问题
                    result.value = new Buffer(result.value.data);
                }
                callBack(null,result);
            }
            fs.close(fd, function(err){
                if (err){
                    console.log(err);
                }
                // console.log("读取文件关闭成功");
            });
        })
    })
}
/**
 * 向本地写入文件
 * @param key {string}
 * @param path {string}
 * @param value {string}
 * @param callBack {function}
 */
function writeFile(key,path,value,callBack) {
    var filePath = path.length > 0 ? path  : defaultFilePath;
    var  wholePath = filePath + '/' + key;
    fs.exists(filePath,function (exist) {
        if(exist){
            fs.open(wholePath,'w',function (err,fd) {
                if(err){
                    callBack(err);
                    return;
                }
                var buff = new Buffer(JSON.stringify(value));

                fs.write(fd,buff,0,buff.length,0,function (err) {
                    callBack(err);
                    fs.close(fd, function(err){
                        if (err){
                            console.log(err);
                        }
                        // console.log("写入文件关闭成功");
                    });
                })
            })
        }else {
            //如果没有指定的目录,则创建文件目录
            fs.mkdir(filePath,function (err) {
                if(err){
                    callBack(err);
                    return;
                }

                //打开文件
                fs.open(wholePath,'w',function (err,fd) {
                    if(err){
                        callBack(err);
                        return;
                    }
                    //写入内容
                    var buff = new Buffer(JSON.stringify(value));
                    fs.write(fd,buff,0,buff.length,0,function (err) {
                        callBack(err);
                        //关闭文件
                        fs.close(fd, function(err){
                            if (err){
                                console.log(err);
                                return;
                            }
                            // console.log("写入文件关闭成功");
                        });
                    })
                })
            })
        }
    })
}

/**
 * 删除本地的指定文件
 * @param key {string}
 * @param path {string}
 * @param callBack {function}
 */
function deleteFile(key,path,callBack) {
    var filePath = path.length > 0 ? path  : defaultFilePath;
    var  wholePath = filePath + '/' + key;
    fs.unlink(wholePath,function (err) {
        callBack(err);
    })
}

function removeDir(dir,callback) {
    //删除所有的文件(将所有文件夹置空)
    var fileUrl = dir;
    var files = fs.readdirSync(fileUrl);//读取该文件夹
    files.forEach(function(file){
        var stats = fs.statSync(fileUrl+'/'+file);
        if(stats.isDirectory()){
            removeDir(fileUrl+'/'+file,function () {
                fs.rmdirSync(fileUrl+'/'+file);//删除内容之后将文件夹删除
                // console.log("删除文件夹"+fileUrl+'/'+file+"成功");
            });
        }else{
            deleteFile(fileUrl,file,function () {
                // console.log("删除文件"+fileUrl+'/'+file+"成功");
            });
        }
    });
    callback(null);
}



exports = module.exports = FileCacheProvider;