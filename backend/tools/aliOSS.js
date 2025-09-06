// 引入删除文件操作
import { removeFiles } from "./dofs.js";
// 导入包
import OSS from 'ali-oss';
// 创建client
let client = new OSS({
    // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
    region: 'oss-cn-beijing',
    // 阿里云账号AccessKey拥有所有API的访问权限。
    accessKeyId: '',
    accessKeySecret: '',
    // 填写Bucket名称。
    bucket: ''
});
// 上传
function putOSS(object, localfile) {
    return new Promise((resolve, reject) => {
        try {
            // 'object'填写上传至OSS的object名称,即不包括Bucket名称在内的Object的完整路径。
            // 'localfile'填写上传至OSS的本地文件完整路径。
            // 上传文件
            client.put(object, localfile).then(result => {
                var form = {
                    path: result.name,// 新路径
                    url: result.url// 新url
                }
                removeFiles(localfile);
                resolve(form);
            });
        } catch (e) {
            reject(e);
        }
    })
}
// 删除
function delOSS(object) {
    return new Promise(async (resolve, reject) => {
        try {
            // 'object'填写不包括Bucket名称在内的Object的完整路径。
            let result = await client.delete(object);
            // result值为{ res: { status: 204, statusCode: 204, statusMessage: 'No Content',... } 即为成功但是没有返回任何内容
            resolve(result);
        } catch (e) {
            reject(e);
        }
    })
}
export {
    putOSS,
    delOSS
}