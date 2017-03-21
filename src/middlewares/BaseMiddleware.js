/**
 * @Class BaseMiddleware
 * @constructor
 * @param options {Object}
 */
function BaseMiddleware(options) {
    this._options = Object.assign({}, options);
}

/**
 * 处理经过中间件的数据
 * @method process
 * @param query {Object}
 *              .action{String}         当前的处理逻辑（eg:get）
 *              .stage {String}         当前的处理逻辑阶段（eg:get前）
 *              .key   {String}         缓存数据的key
 *              .value {String/Object}  缓存数据的value
 *              .meta  {Object}         缓存数据的其它信息
 * @param next {Funtionc}
 */
BaseMiddleware.prototype.process = function (query, next) {
    var stage = query.stage || '';

    if (this[stage]) {
        this[stage](query, next);
    } else {
        next();
    }
}

/**
 * 各生命周期中，中间件的处理逻辑
 * @method beforeget
 * @param query {Object}
 *              .action{String}         当前的处理逻辑（eg:get）
 *              .stage {String}         当前的处理逻辑阶段（eg:get前）
 *              .key   {String}         缓存数据的key
 *              .value {String/Object}  缓存数据的value
 *              .meta  {Object}         缓存数据的其它信息
 * @param next {Function}
 */
BaseMiddleware.prototype.beforeget = function (query, next) {
    next();
};

BaseMiddleware.prototype.afterget = function (query, next) {
    next();
};

BaseMiddleware.prototype.beforeset = function (query, next) {
    next();
};

BaseMiddleware.prototype.afterset = function (query, next) {
    next();
};

BaseMiddleware.prototype.beforedelete = function (query, next) {
    next();
};

BaseMiddleware.prototype.afterdelete = function (query, next) {
    next();
};

BaseMiddleware.prototype.beforeclear = function (query, next) {
    next();
};

BaseMiddleware.prototype.afterclear = function (query, next) {
    next();
};

module.exports = BaseMiddleware;
