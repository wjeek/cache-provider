var FileCacheProvider = require('../../../../src/providers/simple/FileCacheProvider');
var fs = require('fs');
var tp = new FileCacheProvider();

var ccc = [];
for(var i=1; i<4; i++){
	ccc.push({key:i, value:'99'+i, meta:{updateTime: 1321432+i,csdc:453656546+i,sadsafd:45355+i}});
}
tp._setValues(ccc, function(err, data){
	console.log(err, data);
});

// tp._getValues(ccc, function(err, data){
// 	console.log(err, data);
// });

// tp._deleteValues(ccc, function(err, data){
// 	console.log(err, data);
// });
// try{
// 	var files = fs.readdirSync('./cacheFile');
// 	console.log(files);
// }catch(e){
// 	console.log(e)
// }
// console.log(+new Date());
// for(var i=1; i<400000; i++){
// 	var f = fs.existsSync('./cacheFile/'+i);
// 	console.log(f);
// }
// console.log(+new Date());

// tp._clearValue(function(err){
// 	console.log(err);
// });

// console.log(fs.existsSync('./cacheFile'));


