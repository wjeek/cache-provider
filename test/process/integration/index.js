var　integrationConfig　=　require('../../config/config.js').integration　;

function IntegrationProcess(){
    
}

IntegrationProcess.prototype._init = function(){

}

IntegrationProcess.prototype.run = function(){
    console.log( '集成测试' ) ;
    console.log( integrationConfig ) ;
}

module.exports　=　new IntegrationProcess() ;