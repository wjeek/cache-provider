# node_cache



这个模块主要用来在node层做页面级缓存

包括middleware做数据校验,三个基本provider(MemoryCacheProvider,RedisCacheProvider,FileCacheProvider)存储数据，

还引入了多级缓存MultiCacheProvider. 内存限制用到了基于LFU的缓存策略，针对了访问频率和过期进行了处理。

//引入node-cache模块

var nodeCache = require('node-cache');

var app = express();

var router = express.Router();

// 缓存初始化
var MemoryCacheProvider = new nodeCache.providers.MemoryCacheProvider();

var RedisCacheProvider = new nodeCache.providers.RedisCacheProvider({

    port: 6379,
    
    host: '120.27.199.181'
    
});

var FileCacheProvider = new nodeCache.providers.FileCacheProvider();

app.nodeCache = new nodeCache.CacheManager({

    provider: new nodeCache.providers.MultiCacheProvider({
    
        providers: [MemoryCacheProvider, RedisCacheProvider, FileCacheProvider]
        
    })
    
});

app.use(router);

router.get('/example', function (req, res, next) {

	var pid = req.params.pid;

	if (pid) {

		req.app.ehsyCache.get('example', function(result, err){
			if(result && result.value && !err){
				res.send(result.value);
			}else{
				async.parallel([],function(error, result){
					if(!error){
						res.render('example', {
							bodyData: result
						}, function(err, str){
							if(!err){
								req.app.ehsyCache.set({
									key: 'example',
									value: str
								}, function(result, err){});
								res.send(str);
							}else{
								next();
							}
						});
					}else if (error.mark == 1){
						next();
					}else {
						res.render('error', Object.assign({}, error));
					}
				})

			}

		});
		
	} else {
		next();
	}
});
