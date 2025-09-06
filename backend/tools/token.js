import jwt from "jsonwebtoken";
// 生成token
function createToken(salt, info) {// 传入密码盐和要生成token的信息
    let token = jwt.sign(
        info,
        salt,// 密码盐
        {
            expiresIn: "15d"// 过期时间，15天
        }
    );
    return token
}
// 验证/解析Token
function verifyToken(salt, token) {// 传入密码盐和要验证的token
    return new Promise((resolve, reject) => {// 使用promise实现异步验证
        jwt.verify(token, salt, (error, result) => {
            if (error) {
                reject(error)
            } else {
                resolve(result)
            }
        })
    })
}
// 暴露token操作函数
export {
    createToken,
    verifyToken
}