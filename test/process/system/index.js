var　systemConfig　=　require('../../config/config.js').system　;

function SystemProcess(){

}

SystemProcess.prototype.init = function(){

}

SystemProcess.prototype.run = function(){
    console.log( '系统测试' ) ;
}

module.exports = new SystemProcess() ;