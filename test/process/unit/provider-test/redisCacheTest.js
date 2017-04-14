var RedisCacheProvider = require('../../../../src/providers/simple/RedisCacheProvider');

// test code
var tp = new RedisCacheProvider({
	host: '120.27.199.181'
});

// tp._setValues([{key:'a',value:{a:11,b:33}},{key:'b',value:'two'}], function(err, data){
// 	console.log(err, data, 333)
// });

var ccc = [];
for(var i=1; i<30000; i++){
	ccc.push({key:i,value:'99',meta:{updateTime: 1321432+i,csdc:453656546+i,sadsafd:45355+i}});
}
tp._setValues(ccc, function(err, data){
	console.log(err, data, 333)
});
// var preTime1 = new Date();
// tp._load(function(err, data){
// 	console.log(err, data);
// 	console.log(preTime1, new Date())
// });
//
// var preTime2 = new Date();
// tp._synchronizeQueue(function(err, data){
// 	console.log(err, data);
// 	console.log(preTime2, new Date())
// });
// // tp._clearValues();
// tp._getValues(ccc,function(err, data){
// 	console.log(err, data)
// });
// tp._deleteValues(ccc,function(err, data){
// 	console.log(err, data)
// });

// setTimeout(function(){
// 	tp._deleteValues([{key:'a',value:'one'},{key:'b',value:'two'}], function(err, data){
// 		console.log(err, data, 111)
// 	});
// }, 1000);
// setTimeout(function(){
// 	tp._getValues([{key:'a',value:'one'},{key:'a',value:'two'}], function(err, data){
// 		console.log(err, data)
// 	});
// }, 2000);



// tp.__client.expire(['a','b'], 10, function(err, data){
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

// tp.__client.hget('only_node_1', 'meta', function (err,data) {
// 	console.log(err,data)
// });

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
