/**
 * CahceData struct
 * @param key
 * @param meta
 * @param value
 * @constructor
 */
function CacheData(key, meta, value) {
	if (!(this instanceof CacheData)) {
		return new CacheData(key, meta, value);
	}
	if ((typeof key == 'string') || (Array.isArray(key))) {
		this.key = key || '';
		this.meta = meta || {};
		this.value = value || {};
	} else if (key instanceof Object) {
		this.key = key.key || '';
		this.meta = key.meta || {};
		this.value = key.value || {};
	} else {
		throw 'error key';
	}

	this.extra = {};
}

exports = module.exports = CacheData;