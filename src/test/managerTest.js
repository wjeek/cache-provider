var app = require('../index');

var provider = new app.providers.MemoryCacheProvider();
var format = new app.middlewares.Format();
var logger = new app.middlewares.Logger();
var manager = new app.CacheManager();
var validation = new app.middlewares.Validation();
var hash = new app.middlewares.Hash();

manager.use(format);
manager.set('111','hahha',function (err,data) {
    console.log(data);
});
manager.get('111',function (err,data) {
    console.log(data);
});

//test Validation
var obj = {key:21,c:'3122'};
var arr = [{key:21,c:'3122'},{key:221,c:'3122'}]
var reg = {key:/21/,c:/3/};
var aa = validation.isObjectValid(obj);
var bb = validation.isObjectValid(obj,reg);
var cc = validation.isArrayValid(arr,reg);
console.log('校验结果结果:'+ aa + ' '+ bb + ' ' + cc);

//test Hash
var beforeHash = [
    {
        value:2,
        key:'21312313123123asdasdasdasdasdasdasdasdasdasd'
    },
    {
        value:2,
        key:'http://www-local.ehsy.com/usercenter/invoice_info'
    },
];
hash.hashArray(beforeHash,function (data) {
    console.log('hash后为:');
    console.log(data);
 });
