var RedisCacheProvider = require('../providers/simple/RedisCacheProvider');

// test code
var tp = new RedisCacheProvider();
// tp.setValue({key:'foo',value:'fvfdb'}, function(data){
// 	console.log(data)
// });
// tp.getValue({key:'foo'}, function (data) {
// 	console.log(data)
// });
// tp.deleteValue({key:'foo'}, function(data){
// 	console.log(data)
// });

// tp.setValue({key:'bar1',value:'fvfdb'}, function(data){
// 	console.log(data)
// });
// tp.setValue({key:'bar2',value:'scdsc'}, function(data){
// 	console.log(data)
// });
// setTimeout(function(){
// 	tp.deleteValue({key:["bar2"]}, function(data){
// 		console.log(data)
// 	});
// },2000);
setTimeout(function(){
	tp._getValue({key:'testRedis'}, function (err,data) {
		console.log(err,data)
	});
},100);
