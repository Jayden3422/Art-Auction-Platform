import path from "path";
import fs from "fs"; //导入文件操作模块
// 删除存放临时文件文件夹
function removeFiles(filePath = "./tmp") {
    let stats = fs.statSync(filePath);
    // 判断是否是文件
    if (stats.isFile()) {
        // 删除文件
        fs.unlinkSync(filePath)
    } else if (stats.isDirectory()) {
        let filesArr = fs.readdirSync(filePath);
        filesArr.forEach(file => {
            removeFiles(path.resolve(filePath, file));
        })
        fs.rmdirSync(filePath);
    }
}
// 上传文件
function storeFile(file) {
    let fileCont = file;//获取图片上传的资源
    var tmp = fileCont.path;//获取临时资源路径
    let ext = path.extname(fileCont.originalname);//利用path模块获取 用户上传图片的 后缀名
    let newName = ""+(new Date().getTime())+Math.round(Math.random()*10000) + ext;  //给用户上传的图片重新命名 防止重名
    let form = [
        "liujinqi/pic/" + newName,
        tmp
    ]
    return form;
}
export {
    removeFiles,
    storeFile
}