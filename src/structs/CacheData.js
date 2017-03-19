function CacheData(key, meta, value){
    this.key = key || '';
    this.meta = meta || {};
    this.value = value || {};
}

exports = module.exports = CacheData;