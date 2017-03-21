var RedisCacheProvider = require('../../../../src/providers/simple/RedisCacheProvider');

// test code
var tp = new RedisCacheProvider();
// tp._setValue({key:'foo',value:'fvfdssb'}, function(data){
// 	console.log(data)
// });
// tp._getValue({key:'foo'}, function (data) {
// 	console.log(data)
// });
// tp._deleteValue({key:'foo'}, function(data){
// 	console.log(data)
// });

tp._setValue({key:'bar1',value:'fvfdb'}, function(data){
	console.log(data)
});
tp._setValue({key:'bar2',value:'scdsc'}, function(data){
	console.log(data)
});
// tp._setExpirationTime({key:'bar2',value:'scdsc'}, function(data){
// 	console.log(data)
// });
// setTimeout(function(){
// 	tp._deleteValue({key:["bar2","bar1"]}, function(data){
// 		console.log(data)
// 	});
// },1000);
setTimeout(function(){
	tp._getValue({key:'bar1'}, function (err,data) {
		console.log(err,data)
	});
},5000);
