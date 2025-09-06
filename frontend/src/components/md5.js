import md5 from "js-md5";
export default function (salt, str) {// 密码盐 要加密的字段
    var md5Str = md5(salt + JSON.stringify(str)); // 将密码和字段合并，然后进行md5加密
    return md5Str;// 返回加密后的字段
}