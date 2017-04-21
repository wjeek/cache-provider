module.exports = {
    CacheManager: require('./CacheManager').cacheManager,
    CacheManagerClient: require('./CacheManager').client,
    CacheManagerServer: require('./CacheManager').server,
    providers: {
        MultiCacheProvider: require('./providers/complex/MultiCacheProvider'),
        MemoryCacheProvider: require('./providers/simple/MemoryCacheProvider'),
        RedisCacheProvider: require('./providers/simple/RedisCacheProvider'),
        FileCacheProvider: require('./providers/simple/FileCacheProvider')
    },
    middlewares: {
        Compression: require('./middlewares/Compression'),
        Logger:require('./middlewares/Logger'),
        Hash:require('./middlewares/Hash'),
        Validation:require('./middlewares/Validation'),
        ResponseTime:require('./middlewares/ResponseTime')
    }
};