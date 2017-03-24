var path = require('path') ;

var BASE_PATH = '../../' ;



module.exports　=　{
    process : {
        system : {

        },
        integration : {

        },
        unit : {
            //数据结构
            structs : {
                CacheData : {
                    src : require( path.join(BASE_PATH,'src/structs/CacheData') )
                },
                Queue : {
                    src : require( path.join(BASE_PATH,'src/structs/Queue') )
                }
            },
            middlewares : {
                BaseMiddleware : {
                    src : require( path.join(BASE_PATH,'src/middlewares/BaseMiddleware') )
                },
                Compression : {
                    src : require( path.join(BASE_PATH,'src/middlewares/Compression') )
                },
                Hash : {
                    src : require( path.join(BASE_PATH,'src/middlewares/Hash') )
                },
                // Logger : {
                //     src : require( path.join(BASE_PATH,'src/middlewares/Logger') )
                // },
                Validation : {
                    src : require( path.join(BASE_PATH,'src/middlewares/Validation') )
                }
            },
            providers : {
                BaseProvider　: {
                    src : require( path.join(BASE_PATH,'src/providers/BaseProvider') )
                },
                FileCacheProvider　: {
                    src : require( path.join(BASE_PATH,'src/providers/simple/FileCacheProvider') )
                },
                MemoryCacheProvider　: {
                    src : require( path.join(BASE_PATH,'src/providers/simple/MemoryCacheProvider') )
                },
                RedisCacheProvider　: {
                    src : require( path.join(BASE_PATH,'src/providers/simple/RedisCacheProvider') )
                },
                MultiCacheProvider　: {
                    src : require( path.join(BASE_PATH,'src/providers/complex/MultiCacheProvider') )
                }
            }
        }
    },
    manager : {

    },
    report : {
        open : false
    }
}　;