var async = require('async');
var DefaultCacheProvider = require('./providers/simple/MemoryCacheProvider');
var event = require('events');
var net = require('net');
var maxLen = 65536;
var maxListener = 1000;

/**
 * @Class CacheManager
 * @constructor
 * @param options {Object}
 *                .provider {Provider}
 *                .serverPort {Number} default:6969
 *                .serverHost {IP/DomianName} default:localhost
 *                .asyncTaskMax {Integer} 调用者最大的异步并发量
 */
function CacheManager(options) {
    //继承Event对象
    event.EventEmitter.call(this,arguments);

    var self = this;

    this._options = Object.assign({
        provider: new DefaultCacheProvider(),
        serverPort: 6969,
        serverHost: '127.0.0.1',
    }, options);

    this._provider = this._options.provider;

    this._middlewareListBefore = [];

    this._middlewareListAfter = [];

    //异步消息队列并行的最大数量
    this._maxCount = this._options.asyncTaskMax || 10;
    //异步消息队列并行
    this._taskQueue = async.queue(function(task, callback) {
        task();
        callback();
    }, this._maxCount);

    //添加一个使用完cache模块后的异步任务
    this.on('addTask', function (task) {
        self._taskQueue.push(task, function (err) {
            if (err) {
                console.error(err);
            } else {
                console.log(task.name + 'has been exected');
            }
        });
    });

    //error
    this.on('error', function (err) {
        console.log(err);
    })

    this.start();
}

CacheManager.prototype = Object.create(event.EventEmitter.prototype);
CacheManager.prototype.constructor = CacheManager;

/**
 * @Class CacheManagerServer
 * @constructor
 * @param options {Object}
 *                .provider {Provider}
 *                .serverPort {Number} default:6969
 *                .serverHost {IP/DomianName} default:localhost
 *                .asyncTaskMax {Integer} 调用者最大的异步并发量
 */
function CacheManagerServer(options) {
    this._options = Object.assign({
        provider: new DefaultCacheProvider(),
        serverPort: 6969,
        serverHost: '127.0.0.1',
    }, options);

    CacheManager.call(this, this._options);
    var self = this;

    this._query = {};

    this._server = net.createServer(function(sock) {
        sock._reciveData = '';

        //为这个socket实例添加一个"data"事件处理函数
        sock.setMaxListeners(maxListener);
        sock.on('data', function(data) {
            sock._reciveData += data;

            //接收到完整的一条消息时将buffer转化为string，否则当buffer中存在多子节字符时会转码错误
            if (sock._reciveData.toString().indexOf('buffEnd') != -1) {
                console.log('received data.');

                self._server.tmpStr += sock._reciveData.toString('utf8');

                var tmpArr = self._server.tmpStr.split('buffEnd');

                console.log('before while');

                while (self._server.tmpStr.indexOf('buffEnd') != -1) {
                    console.log('sever while');
                    var tmp = tmpArr[0];


                    if (tmp) {
                        try {
                            self._query = JSON.parse(tmp);
                        } catch (err) {
                            console.error('json parse error.');
                        }
                        //self._query = JSON.parse(tmp);
                        tmpArr.shift();
                        self._server.tmpStr = tmpArr.join('buffEnd');

                        //初始化
                        sock._reciveData = '';

                        self._server._parallelTask.push({query: self._query, sock:sock});
                    } else {
                        tmpArr.shift();
                    }
                }
            }
        });

        //为这个socket实例添加一个"close"事件处理函数
        sock.on('close', function(data) {
            console.warn('Server CLOSED');
        });

        //为这个socket实例添加一个"error"事件处理函数
        sock.on('error', function(err) {
            //端口已经被使用
            console.error('error:'+err.code)
            if (err.code === 'EADDRINUSE') {
                console.log('The port (' + port + ') is occupied, please change other port.')
            }
        });

    }).listen(this._options.serverPort, this._options.serverHost);

    this._server.tmpStr = '';

    this._server._parallelTask = async.queue(function (task, callback) {
        console.log('queue start.');

        //回发该数据，客户端将收到来自服务端的数据
        self._handle(task.query, function (result, err) {
            console.log('server send data start');
            socketWrite(task.sock, result);
            callback();
        });

    }, 100);

    this._server.setMaxListeners(maxListener);
    this._server.maxConnections = maxListener;
}
CacheManagerServer.prototype = Object.create(CacheManager.prototype);
CacheManagerServer.prototype.constructor = CacheManagerServer;

/**
 * @Class CacheManagerClient
 * @constructor
 * @param options {Object}
 *                .provider {Provider}
 *                .serverPort {Number} default:6969
 *                .serverHost {IP/DomianName} default:localhost
 *                .asyncTaskMax {Integer} 调用者最大的异步并发量
 */
function CacheManagerClient(options) {
    this._options = Object.assign({
        provider: new DefaultCacheProvider(),
        serverPort: 6969,
        serverHost: '127.0.0.1',
    }, options);

    CacheManager.call(this, options);
    var self = this;

    this._client = new net.Socket();

    //socket buffer
    this._client._reciveData = '';

    //object transformed from buffer
    this._query = {};

    //string transformed form buffer
    this._client.tmpStr = '';

    this._client.connect(this._options.serverPort, this._options.serverHost, function() {
        self._client.connectSuccess = true;
        console.log('Connect success');
    });

    //为客户端添加"data"事件处理函数
    //data是服务器发回的数据
    this._client.setMaxListeners(maxListener);

    this._client.on('data', function(data) {
        self._client._reciveData += data;

        if (self._client._reciveData.toString().indexOf('buffEnd') != -1) {
            console.log('client received data.');

            self._client.tmpStr += self._client._reciveData.toString('utf8');

            var tmpArr = self._client.tmpStr.split('buffEnd');

            console.log('before client while');

            while (self._client.tmpStr.indexOf('buffEnd') != -1) {
                console.log('client while');
                var tmp = tmpArr[0];

                if (tmp != '') {
                    try {
                        self._query = JSON.parse(tmp);

                    } catch (err) {
                        console.log('client error.');
                    }
//                    self._query = JSON.parse(tmp);
                    tmpArr.shift();
                    self._client.tmpStr = tmpArr.join('buffEnd');

                    //初始化
                    self._client._reciveData = '';

                    if (self._messageList[0]) {
                        self._messageList[0].callback(self._query, null);
                        self._messageList = self._messageList.slice(1);
                    }
                } else {
                    tmpArr.shift();
                }
            }
        }
    });

    //为客户端添加“close”事件处理函数
    this._client.on('close', function() {
        self._client.destroy();
        self._client.connectSuccess = false;
        console.log('Connection closed');
        setInterval(function () {
            self._client.connect(self._options.serverPort, self._options.serverHost, function() {
                console.log('Connect success');
            });
        }, 100);
    });

    //为这个socket实例添加一个"error"事件处理函数
    this._client.on('error', function(err) {
        self.emit(err);
    });
    this._messageList = [];
}
CacheManagerClient.prototype = Object.create(CacheManager.prototype);
CacheManagerClient.prototype.constructor = CacheManagerClient;

/**
 * Get cached value
 * @method start
 * @param callback {Function}
 */
CacheManager.prototype.start = function (callback) {
    this._provider.start(callback);
};

/**
 * Get cached value
 * @method stop
 * @param callback {Function}
 */
CacheManager.prototype.stop = function (callback) {
    this._provider.stop(callback);
};

/**
 * Get cached value
 * @method get
 * @param key {String}
 * @param callback {Function}
 */
CacheManager.prototype.get = function (key, callback) {
    if (!isValidKey(key)) {
        this.emit('error', new Error('cacheManager.get() requires a key string'));
    }

    if (!isValidFunction(callback)) {
        this.emit('error', new Error('cacheManager.get() requires callback function'));
    }

    var query = {action: 'get'};

    query.data = {key: key, meta:{}};

    this._handleCulster(query, function (result, err) {
        callback && callback(result, err);
    });
};

CacheManager.prototype.getInfo = function (callback) {
    if (!isValidFunction(callback)) {
        this.emit('error', new Error('cacheManager.getInfo() requires callback function'));
    }

    var query = {action: 'getInfo'};

    query.data = {key: 'getInfo', meta:{}};

    this._handleCulster(query, function (result, err) {
        callback && callback(result, err);
    });
};

/**
 * Set cached value
 * @method set
 * @param data {Object} Or [{Object}]
 *             .key
 *             .value
 *             .meta
 * @param callback {Function}
 */
CacheManager.prototype.set = function (data, callback) {
    var self = this;

    if (!Array.isArray(data)) {
        data = [data];
    }

    data.forEach(function (queryObj) {
        if (!isValidKey(queryObj.key)) {
            self.emit('error', new Error('cacheManager.set() requires a "{key:key, value:value}" object or "[{key:key, value:value}]" array'));
        }

        if (!isValidValue(queryObj.value)) {
            self.emit('error', new Error('cacheManager.set() requires a "{key:key, value:value}" object or "[{key:key, value:value}]" array'));
        }
    });

    data = data.map(function (queryObj) {
        if (!queryObj.meta) {
            queryObj.meta = {};
        }

        return queryObj;
    });

    var query = {action: 'set'};

    query.data = data;

    this._handleCulster(query, function (result, err) {
        callback && callback(result, err);
    });
};

/**
 * Delete cached value
 * @method delete
 * @param key {String}
 * @param callback {Function}
 */
CacheManager.prototype.delete = function (key, callback) {
    if (!isValidKey(key)) {
        this.emit('error', new Error('cacheManager.delete() requires a key string'));
    }

    var query = {action: 'delete'};

    query.data = {key: key, meta:{}};

    this._handleCulster(query, function (result, err) {
        callback && callback(result, err);
    });
};


/**
 * Clear all cached values
 * @method clear
 * @param callback {Function}
 */
CacheManager.prototype.clear = function (callback) {

    var query = {action: 'clear'};

    query.data = {};

    this._handleCulster(query, function (result, err) {
        callback && callback(result, err);
    });
};

/**
 * Call the middleware
 * @method use
 * @param middleware {Object}
 */
CacheManager.prototype.use = function use(middleware) {
    if (!isValidObject(middleware)) {
        this.emit('error', new Error('cacheManager.use() requires middleware object'));
    }

    this._middlewareListBefore.push(middleware);
    this._middlewareListAfter = [middleware].concat(this._middlewareListAfter);
};

/**
 * handle cluster
 * @method _handleCulster
 * @param query {Object}
 *              .action{String}             当前的处理逻辑（eg:get）
 *              .stage {String}             当前的处理逻辑阶段（eg:get前）
 *              .data  {Object}             缓存数据对象
 *                  .key   {String}         缓存数据的key
 *                  .value {String/Object}  缓存数据的value
 *                  .meta  {Object}         缓存数据的其它信息
 * @param callback {Function}
 */
CacheManager.prototype._handleCulster = function _handleCulster(query, callback) {
    var client = this._client;
    this._callback = callback;

    if (client) {
        if (client.connectSuccess) {
            this._messageList.push({
                callback:callback,
            });
            //建立连接后立即向服务器发送数据，服务器将收到这些数据
            socketWrite(client, query);
        } else {
            client.connect(this._options.serverPort, this._options.serverHost, function() {
                client.connectSuccess = true;
                console.log('Connect success');
            });
            callback(null,'connect fail');
        }
    } else {
        this._handle(query, callback);
    }
};

/**
 * handle middlewares and get data from providers
 * @method handle
 * @param query {Object}
 *              .action{String}             当前的处理逻辑（eg:get）
 *              .stage {String}             当前的处理逻辑阶段（eg:get前）
 *              .data  {Object}             缓存数据对象
 *                  .key   {String}         缓存数据的key
 *                  .value {String/Object}  缓存数据的value
 *                  .meta  {Object}         缓存数据的其它信息
 * @param callback {Function}
 */
CacheManager.prototype._handle = function (query, callback) {
    var self = this;

    //处理provider前
    var beforeMiddlewareList = self._handleMiddleware('before', query);

    //处理provider
    var handleProvider = [
        function (callback) {
            self._handleProvider(query, callback);
        }
    ];

    //处理provider后
    var afterMiddlewareList = self._handleMiddleware('after', query);

    var handleList = beforeMiddlewareList.concat(handleProvider).concat(afterMiddlewareList);
    async.series(handleList, function(err){
        callback(query.data, err);
    });
};

/**
 * handle middlewares
 * @method _handleMiddleware
 * @param query {Object}
 *              .action{String}             当前的处理逻辑（eg:get）
 *              .stage {String}             当前的处理逻辑阶段（eg:get前）
 *              .data  {Object}             缓存数据对象
 *                  .key   {String}         缓存数据的key
 *                  .value {String/Object}  缓存数据的value
 *                  .meta  {Object}         缓存数据的其它信息
 */
CacheManager.prototype._handleMiddleware = function (stage, query) {
    //处理前后的middleWare
    if (stage == 'before') {
        var middlewareList = this._middlewareListBefore;
    } else {
        var middlewareList = this._middlewareListAfter;
    }

    return middlewareList.map(function (middleware) {
        return function (callback) {
            query.stage = stage + query.action;
            middleware.process(query.stage, query.data, callback);
        }
    });
};

/**
 * get data from providers
 * @method _handleProvider
 * @param query {Object}
 *              .action{String}             当前的处理逻辑（eg:get）
 *              .stage {String}             当前的处理逻辑阶段（eg:get前）
 *              .data  {Object}             缓存数据对象
 *                  .key   {String}         缓存数据的key
 *                  .value {String/Object}  缓存数据的value
 *                  .meta  {Object}         缓存数据的其它信息
 * @param callback {Function}
 */
CacheManager.prototype._handleProvider = function (query, callback) {
    var action = query.action;

    if (this._provider[action]) {
        this._provider[action](query.data, function (err, providerResult) {
            if (providerResult) {
                if (Array.isArray(providerResult.success)) {
                    if (providerResult.success.length > 1) {
                        query.data = providerResult.success;
                    } else {
                        query.data = providerResult.success[0] || query.data;
                    }
                }
                callback(null);
            } else {
                callback(err);
            }
        })
    } else {
        var err = new Error('provider can not support "' + query.action + '"' );
        this.emit('error', err);
        callback(err);
    }
};

/**
 * @Function isValidKey
 * @param str {String}
 */
function isValidKey(str) {
    return (str && (Object.prototype.toString.call(str) == "[object String]" || Object.prototype.toString.call(str) == "[object Array]"));
}

/**
 * @Function isValidValue
 * @param value
 */
function isValidValue(value) {
    return !!value;
}

/**
 * @Function isValidObject
 * @param obj {Object}
 */
function isValidObject(obj) {
    return (obj && Object.prototype.toString.call(obj) == "[object Object]");
}

/**
 * @Function isValidFunction
 * @param fn {Function}
 */
function isValidFunction(fn) {
    return (fn && Object.prototype.toString.call(fn) == "[object Function]");
}

/**
 * @Function socketWrite
 * @param data {String Object} socket发送的数据
 */
function socketWrite(service, data) {
    var queryDataStr = JSON.stringify(data);
    var len = queryDataStr.length;
    var sendTime = Math.ceil(len/maxLen);

    //Nodejs 默认一个Buffer 16KB
    for (var i=0; i<sendTime; i++) {
        service.write(new Buffer(queryDataStr.slice(i*maxLen, (i+1)*maxLen),'utf8'));

        if (i == sendTime-1) {
            service.write(new Buffer('buffEnd'));
        }
    }
}

module.exports = {
    server:CacheManagerServer,
    client:CacheManagerClient,
    cacheManager:CacheManager,
};