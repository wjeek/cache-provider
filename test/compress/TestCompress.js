/**
 * Created by wands on 2017/3/20.
 */

var Compression = require('../../src/middlewares/Compression');

var compression = new Compression();

var txt = {
    key: 'hello, worldaaaaaaaaaaaaaaaaaaa',
    value: "hello, worldaaaaaaaaaaaaaaaaaaaaaaaaaafdddddddddddddddddddddddddddddddd"
    // value: {a:1,b:2,c:3}
};

compression.beforeset(txt, function () {
    
});

console.log("beforeset" + txt.value);

compression.afterget(txt, function () {
    
});

console.log("afterget():" + txt.value);