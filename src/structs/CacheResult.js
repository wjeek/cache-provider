/**
 * CacheResult struct
 * @constructor
 */
function CacheResult() {
    if (!(this instanceof CacheResult)) {
        return new CacheResult();
    }

    this.success = [];
    this.failed = [];

}

exports = module.exports = CacheResult;