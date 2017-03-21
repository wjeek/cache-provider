/**
 * Created by wands on 2017/3/20.
 */

var Compression = require('../../src/middlewares/Compression');

var compression = new Compression();

var txt = {
    key: 'hello, worldaaaaaaaaaaaaaaaaaaa',
    value: "hello, worldaaaaaaaaaaaaaaaaaaaaaaaaaafdddddddddddddddddddddddddddddddd"
};

compression.beforeset(txt, function () {
    
});

console.log("beforeset" + txt.value);

compression.afterget(txt, function () {
    
});

console.log("afterget():" + txt.value);