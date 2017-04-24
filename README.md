这个模块主要用来在node层做页面级缓存

包括middleware做数据校验,三个基本provider(MemoryCacheProvider,RedisCacheProvider,FileCacheProvider)存储数据，

还引入了多级缓存MultiCacheProvider. 内存限制用到了基于LFU的缓存策略，针对了访问频率和过期进行了处理。

	//引入node-cache模块

	var nodeCache = require('node-cache');

	var app = express();

	var router = express.Router();

	var events = require('events');

	// 缓存初始化

	var MemoryCacheProvider = new ehsyCache.providers.MemoryCacheProvider({

		maxLength: 5000

	});
	var RedisCacheProvider = {};

	var FileCacheProvider = new ehsyCache.providers.FileCacheProvider();

	if(process.env.NODE_ENV == 'development'){

		RedisCacheProvider = new ehsyCache.providers.RedisCacheProvider(redisConfig['redis-d' + suffix]);

	}else{

		RedisCacheProvider = new ehsyCache.providers.RedisCacheProvider(redisConfig['redis' + suffix]);

	}

	var CacheManager = new ehsyCache.CacheManager({

	    provider: new ehsyCache.providers.MultiCacheProvider({

		providers: [MemoryCacheProvider, RedisCacheProvider]

	    }),

	});

	var hash = new ehsyCache.middlewares.Hash();

	var logger2 = new ehsyCache.middlewares.Logger();

	var compression2 = new ehsyCache.middlewares.Compression({

		algorithm: 'gzip',
		compress: true,
		decompress: true

	});

	var responseTime = new ehsyCache.middlewares.ResponseTime();

	CacheManager.use(hash);
	CacheManager.use(logger2);
	CacheManager.use(compression2);
	CacheManager.use(responseTime);

	app.ehsyCache = CacheManager;

	app.use(router);

	router.get('/example', function (req, res, next) {

	var pid = req.params.pid;

	if (pid) {
		var eventEmitter = new events.EventEmitter();
		eventEmitter.on('getCacheValue', function(){
		    res.app.ehsyCache.get(req.path + customerString , function(result, err) {
			if (result && result.value && !err) {
			    if(result.meta && result.meta.update_time){
				var nowTime = new Date().getTime();
				var needUpdateTime = parseInt(result.meta.update_time) + productUpdateTime;
				if( needUpdateTime <= nowTime ){
				    eventEmitter.emit('renderValue', true);
				}
			    }
			    res.header("Accept-Encoding", "gzip");
			    res.send(result.value);
			} else {
			    eventEmitter.emit('renderValue', false);
			}
		    })
		});

		eventEmitter.on('setCacheValue', function(renderStr){
		    req.app.ehsyCache.set({
			key: req.path + customerString ,
			meta: {
			    update_time: new Date().getTime()
			},
			value: renderStr
		    }, function(result, err){
		    });
		});

		eventEmitter.on('renderValue', function(isRendered){
		    var params = {
			skuCode: pid,
			cityId: cityId,
			token: token || ''
		    };
		    async.parallel([
			function (callback) {
			    store.getProductLine(params, callback);
			},
		    ], function (error, results) {
			if (!error) {	
			    res.render('product', 
			     function(err, str){
				if(!err){
				    eventEmitter.emit('setCacheValue', str);
				    if(!isRendered){
					res.send(str);
				    }
				}else{
				    next();
				}
			    });
			}
			else if (error.mark == 1){
			    next();
			}
			else {
			    res.render('error', Object.assign({}, error));
			}
		    });
		});
		if(preview == 1){
		    eventEmitter.emit('renderValue');
		}else{
		    eventEmitter.emit('getCacheValue');
		}

	} else {
		next();
	}
    });
