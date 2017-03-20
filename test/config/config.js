var path = require('path') ;

var BASE_PATH = '../../' ;



module.exports　=　{
    process : {
        system : {

        },
        integration : {

        },
        unit : {
            //数据结构
            structs : {
                Queue : {
                    src : require( path.join(BASE_PATH,'src/structs/Queue') )
                }
            }
        }
    },
    manager : {

    },
    report : {

    }
}　;