// 编码
function encodeBase64 (salt, str) {// 密码盐 待加密的字符串
    var strBase64 = Buffer.from(salt + str).toString('base64');
    return strBase64;
}
// 解码
function decodeBase64 (salt, strBase64) {// 密码盐 待解密的字符串
    var str = Buffer.from(strBase64, 'base64').toString('utf8').slice(salt.length);// 最后一个函数同时将密码盐删除，获得原本数据
    return str;
}
export {
    encodeBase64,
    decodeBase64
}