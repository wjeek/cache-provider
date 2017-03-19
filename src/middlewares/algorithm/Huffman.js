/**
 * Created by ehsy-it on 2017/3/13.
 */

function Huffman() {

}

Huffman.prototype.compress = function (source) {
    //todo: Huffman编码
    console.log("Huffman compress " + source);

    return 'huffman compressed';
};

Huffman.prototype.decompress = function () {
    //todo: Huffman解码
    console.log("Huffman decompress");

    return 'huffman decoded';
};

module.exports = Huffman;