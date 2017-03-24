var RedisCacheProvider = require('../../../../src/providers/simple/RedisCacheProvider');

// test code
var tp = new RedisCacheProvider({
	host: '120.27.199.181'
});

tp._setValues([{key:'a',value:{a:11,b:33}},{key:'b',value:'two'}], function(err, data){
	console.log(err, data, 333)
});
tp._clearValues();

// setTimeout(function(){
// 	tp._deleteValues([{key:'a',value:'one'},{key:'b',value:'two'}], function(err, data){
// 		console.log(err, data, 111)
// 	});
// }, 1000);
// setTimeout(function(){
// 	tp._getValues([{key:'a',value:'one'},{key:'b',value:'two'}], function(err, data){
// 		console.log(err, data)
// 	});
// }, 2000);



// tp.__client.set('bar1', 'df', function(err, data){
// 	console.log(err, data)
// });
// tp.__client.set('bar2', 'scdsc', function(err, data){
// 	console.log(err, data)
// });

// setTimeout(function(){
// 	tp.__client.mget(["bar1","bar2"],function(err, data){
// 		console.log(err, data, 444)
// 	});
// },1000);

// setTimeout(function(){
// 	tp._deleteValue({key:["bar1","bar2"]}, function(data){
// 		console.log(data)
// 	});
// },1000);
// setTimeout(function(){
// 	tp._getValue({key:'bar1'}, function (err,data) {
// 		console.log(err,data)
// 	});
// },5000);
// tp.__client.set("a", "one");
// tp.__client.set("b", "five");
// tp.__client.set("c", "six");

// setTimeout(function(){
// 	tp.__client.del(['a',{},'c'], function (err,data) {
// 		console.log(err,data)
// 	});
// },1000);
// setTimeout(function(){
// 	tp.__client.mget(['a','c'], function (err,data) {
// 		console.log(err,data)
// 	});
// },2000);

//var all_parts = {};

// tp.__client.keys("*", function(err, keys) {
// 	console.log(keys);
// 	var count = keys.length;
// 	keys.forEach( function(key) {
// 		tp.__client.hgetall(key, function(err, obj) {
// 			all_parts[key] = obj;
// 			--count;
// 			if (count <= 0) {
// 				console.log(all_parts);
// 			} else {
// 				console.log('waiting');
// 			}
// 		});
// 	});
// });
