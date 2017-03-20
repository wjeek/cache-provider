
module.exports = {
    test : {
        system : require('./process/system') ,
        integration : require('./process/integration'),
        unit : require('./process/unit')
    },
    run : {
        manager : require('./support/manager')
    }
} ;