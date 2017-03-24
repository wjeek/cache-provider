var app = require('../../../../src/index');

var provider = new app.providers.MemoryCacheProvider();
//var format = new app.middlewares.Format();
var logger = new app.middlewares.Logger();
var manager = new app.CacheManager();
var validation = new app.middlewares.Validation();
var hash = new app.middlewares.Hash();
manager.use(logger);
//manager.use(format);
manager.set('111','hahha',function (err,data) {
    console.log(data);
});
manager.get('111',function (err,data) {
    console.log(data);
});


//test Validation and Hash
var setQuery = [
    {
        value:2,
        key:'21312313123123asdasdasdasdasdasdasdasdasdasd'
    },
    {
        value:2,
        key:'http://www-local.ehsy.com/usercenter/invoice_info'
    },
];
var getQuery = {
    key:['http://www-local.ehsy.com/usercenter/invoice_info']
};

validation.beforeset(setQuery,function () {
    console.log('检验合格');
});

validation.beforeget(getQuery,function () {
    console.log('检验合格');
});

hash.beforeset(setQuery,function () {
    console.log(setQuery);
});

hash.beforeget(getQuery,function () {
    console.log(getQuery);
});
