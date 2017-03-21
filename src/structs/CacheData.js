function CacheData(key, meta, value){
    if(key instanceof String){
        this.key = key || '';
        this.meta = meta || {};
        this.value = value || {};
    }else{
        this.key = key.toString();
        this.meta = meta || {};
        this.value = value || {};
        //throw "key must be type of String"
    }
}

exports = module.exports = CacheData;