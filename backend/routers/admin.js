import doMd5 from "../tools/md5.js";// md5加密
import { encodeBase64, decodeBase64 } from "../tools/base64.js";// base64加密/解密
import {createToken, verifyToken} from "../tools/token.js";// 引入token操作函数
import {salt, permission, final} from "../tools/public.js"
// 引入express框架
import express from "express";
var app = express();

import multer from "multer";
//设置临时目录 存放上传的图片
const upload = multer({ dest: "../tmp/" });

// 引入保存文件操作
import { storeFile } from "../tools/dofs.js";

// 引入数据库相关操作
import { insertDb, deleteData, deleteDatas, findPro, findSort, findLimitSort, updateDb, updateDbs } from "../tools/Mongo.js";

// 引入阿里云oss操作
import { putOSS, delOSS } from "../tools/aliOSS.js";

import bodyParser from "body-parser";// 引入中间件解析body
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false });
// 创建 application/json parser
var jsonParser = bodyParser.json();

// Promise处理
import { isFine, allPro } from "../tools/promise.js";


const admin = express.Router();
admin.get('/', (req,res)=>{
    res.send("admin");
});

// 登录
admin.post('/login', jsonParser, async (req, res) => {
    var info = req.body.EMAIL;
    try {
        let adminList = await findPro('admin', { EMAIL: info });
        if(isFine(adminList).judge) {
            throw adminList.value;
        }
        if (!adminList[0]) {
            res.status(401).send('invalid admin');
            return;
        }
        // 获取基本登录信息
        var data = {
            EMAIL: adminList[0].EMAIL,
            ADMIN_PASS: adminList[0].ADMIN_PASS
        }
        var userForm = {
            ADMIN_ID: adminList[0].ADMIN_ID,
            ADMIN_NAME: adminList[0].ADMIN_NAME,
            EMAIL: adminList[0].EMAIL,
            ADMIN_PASS: adminList[0].ADMIN_PASS,
            ADMIN_INTRO: adminList[0].ADMIN_INTRO,
            AVATAR_URL: adminList[0].AVATAR_URL,
            AVATAR_PATH: adminList[0].AVATAR_PATH,
            PHONE: adminList[0].PHONE,
            PASS_SALT: adminList[0].PASS_SALT,
            ADMIN_STATUS: adminList[0].ADMIN_STATUS
        }
        // 生成唯一md5识别码
        var md5 = doMd5('', data);
        if (md5 == req.body.md5) {
            // 将权限信息写入token
            permission(userForm, res, 2);// 管理员权限为2
        } else {
            res.status(401).send('invalid admin')
        }
    }catch(e) {
        res.status(500).send('Registration failed')
    }
})

// 添加通知
admin.post('/addAn', jsonParser, (req, res) => {
    var form = {
        ANNOUNCEMENT_ID: Date.now(),
        UPLOADER_ID: req.body.UPLOADER_ID,
        TITLE: req.body.TITLE,
        CONTENT: req.body.CONTENT,
        TIME: new Date()
    }
    allPro([insertDb('announcement', form)], res);
})

// 删除通知
admin.post('/delAn', jsonParser, (req, res) => {
    allPro([deleteData('announcement', req.body)], res);
})

// 获取订单
admin.post('/getOrders', jsonParser, async (req, res) => {
    try {
        let orderList = await findSort("buyr_order", req.body, {CREATED_TIME: -1});
        if(isFine(orderList).judge) {
            throw orderList.value;
        }
        var list = [];// 所有要查的GOOD_ID
        orderList.forEach((item, index) => {
            list.push(item.GOOD_ID);
        })
        var list1 = [];// 所有返回有结果的Promise
        list.forEach((item, index) => {
            list1.push(findPro("goods", {GOOD_ID: item}));
        })
        Promise.allSettled(list1).then(resx => {
            resx.forEach((item, index) => {
                for(let i = 0; i < list.length; i++){
                    if(orderList[i].GOOD_ID == item.value[0].GOOD_ID){
                        orderList[i].GOOD_INFO = item.value[0];
                    }
                }
            })
            res.send(orderList);
        })
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 更新管理员信息
admin.post('/updateAdmin', jsonParser, (req, res) => {
    var form = {
        ADMIN_NAME: req.body.ADMIN_NAME,
        AVATAR_URL: req.body.AVATAR_URL,
        PHONE: req.body.PHONE,
        ADMIN_PASS: req.body.ADMIN_PASS,
        PASS_SALT: req.body.PASS_SALT,
        ADMIN_STATUS: req.body.ADMIN_STATUS,
        EMAIL: req.body.EMAIL
    }
    allPro([updateDb("admin", {ADMIN_ID: req.body.ADMIN_ID}, {$set: form})], res);
})

// 更新买家信息
admin.post('/updateUser', jsonParser, (req, res) => {
    var form = {
        USER_NAME: req.body.USER_NAME,
        AVATAR_URL: req.body.AVATAR_URL,
        PHONE: req.body.PHONE,
        USER_PASS: req.body.USER_PASS,
        PASS_SALT: req.body.PASS_SALT,
        USER_STATUS: req.body.USER_STATUS,
        EMAIL: req.body.EMAIL,
        USER_INTRO: req.body.USER_INTRO,
        POSITION: req.body.POSITION
    }
    allPro([updateDb("buyr_user", {USER_ID: req.body.USER_ID}, {$set: form})], res);
})

// 更新卖家信息
admin.post('/updateSeller', jsonParser, (req, res) => {
    var form = {
        SELLER_NAME: req.body.SELLER_NAME,
        AVATAR_URL: req.body.AVATAR_URL,
        PHONE: req.body.PHONE,
        SELLER_PASS: req.body.SELLER_PASS,
        PASS_SALT: req.body.PASS_SALT,
        SELLER_STATUS: req.body.SELLER_STATUS,
        EMAIL: req.body.EMAIL,
        SELLER_INTRO: req.body.SELLER_INTRO,
        POSITION: req.body.POSITION
    }
    allPro([updateDb("seller", {SELLER_ID: req.body.SELLER_ID}, {$set: form})], res);
})

// 添加新管理员
admin.post('/postAdmin', jsonParser, (req, res) => {
    var form = {
        ADMIN_ID: parseInt(Date.now()),
        ADMIN_NAME: req.body.ADMIN_NAME,
        AVATAR_URL: req.body.AVATAR_URL,
        PHONE: req.body.PHONE,
        ADMIN_PASS: req.body.ADMIN_PASS,
        PASS_SALT: req.body.PASS_SALT,
        ADMIN_STATUS: 0,
        EMAIL: req.body.EMAIL
    }
    allPro([insertDb("admin", form)], res);
})

// 添加新买家
admin.post('/postUser', jsonParser, (req, res) => {
    var form = {
        USER_ID: parseInt(Date.now()),
        USER_NAME: req.body.USER_NAME,
        AVATAR_URL: req.body.AVATAR_URL,
        PHONE: req.body.PHONE,
        USER_PASS: req.body.USER_PASS,
        PASS_SALT: req.body.PASS_SALT,
        USER_STATUS: 0,
        EMAIL: req.body.EMAIL,
        USER_INTRO: req.body.USER_INTRO,
        POSITION: req.body.POSITION
    }
    allPro([insertDb("buyr_user", form)], res);
})

// 添加新卖家
admin.post('/postSeller', jsonParser, (req, res) => {
    var form = {
        SELLER_ID: parseInt(Date.now()),
        SELLER_NAME: req.body.SELLER_NAME,
        AVATAR_URL: req.body.AVATAR_URL,
        PHONE: req.body.PHONE,
        SELLER_PASS: req.body.SELLER_PASS,
        PASS_SALT: req.body.PASS_SALT,
        SELLER_STATUS: 0,
        EMAIL: req.body.EMAIL,
        SELLER_INTRO: req.body.SELLER_INTRO,
        POSITION: req.body.POSITION
    }
    allPro([insertDb("seller", form)], res);
})

// 上传文件
admin.post('/uploadFile', upload.single("file"), (req, res) => {
    var arr = storeFile(req.file);
    Promise.allSettled([putOSS(arr[0], arr[1])]).then(resx => {
        if(resx[0].status == 'fulfilled') {
            res.send(resx[0].value);
        }else {
            res.status(500).send('Upload failed');
        }
    })
})

// 删除文件
admin.post('/delFile', jsonParser, (req, res) => {
    allPro([delOSS(req.body.path)], res);
})

// 获取所有管理员信息
admin.get('/allAdmin', jsonParser, async (req, res) => {
    try {
        let adminList = await findSort("admin", {});
        if(isFine(adminList).judge) {
            throw adminList.value;
        }
        res.send(adminList);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 获取所有买家
admin.get('/allUsers', jsonParser, async (req, res) => {
    try {
        let buyrList = await findSort("buyr_user", {});
        if(isFine(buyrList).judge) {
            throw buyrList.value;
        }
        res.send(buyrList);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 获取所有卖家
admin.get('/allSeller', jsonParser, async (req, res) => {
    try {
        let sellerList = await findSort("seller", {});
        if(isFine(sellerList).judge) {
            throw sellerList.value;
        }
        res.send(sellerList);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 删除某一管理员
admin.delete('/delAdmin', jsonParser, (req, res) => {
    allPro([deleteData("admin", {ADMIN_ID: parseInt(req.url.slice(req.path.length + 1))})], res);
})

// 删除某一买家
admin.delete('/delUser', jsonParser, (req, res) => {
    allPro([deleteData("buyr_user", {USER_ID: parseInt(req.url.slice(req.path.length + 1))})], res);
})

// 删除某一卖家
admin.delete('/delSeller', jsonParser, (req, res) => {
    allPro([deleteData("seller", {SELLER_ID: parseInt(req.url.slice(req.path.length + 1))})], res);
})

// 删除某一商品
admin.delete('/delGood', jsonParser, async (req, res) => {
    let goodID = parseInt(req.url.slice(req.path.length + 1));
    let goodInfo = await findPro("goods", {GOOD_ID: goodID});
    if(isFine(goodInfo).judge) {
        throw goodInfo.value;
    }
    allPro([
        deleteDatas("goods", {GOOD_ID: goodID}),
        deleteDatas("price_info", {GOOD_ID: goodID}),
        deleteDatas("buyr_order", {GOOD_ID: goodID})
    ], res);
})

export default admin;