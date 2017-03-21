/**
 * Created by anna on 2017/3/20.
 */

var Logger = require('../../src/middlewares/Logger');

var logger = new Logger();
var opt = {
    method: "dateFile",
    level: "info",
    debug: true
}
var log = new Logger(opt);

var query = {
    key: 'logggggg',
    value: "loggingggggggg"
};

log.process(query, function () {
    
});