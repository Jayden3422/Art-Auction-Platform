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


const buyr = express.Router();
buyr.get('/', (req,res)=>{
    res.send("buyr");
});

// 注册
buyr.post('/signin', jsonParser, (req, res) => {
    var form = {
        USER_ID: Date.now(),
        USER_NAME: req.body.name,
        EMAIL: req.body.email,
        USER_PASS: req.body.pass,
        PHONE: req.body.phone,
        USER_STATUS: 0,
        USER_SCORE: 10,
        TOTAL_COST_AMT: 0
    }
    allPro([insertDb('buyr_user', form)], res);
})

// 登录
buyr.post('/login', jsonParser, async (req, res) => {
    var info = req.body.EMAIL;
    try {
        let buyrList = await findPro('buyr_user', { EMAIL: info });
        if(isFine(buyrList).judge) {
            throw buyrList.value;
        }
        if (!buyrList[0]) {
            res.status(401).send('invalid buyr');
            return;
        }
        // 获取基本登录信息
        var data = {
            EMAIL: buyrList[0].EMAIL,
            USER_PASS: buyrList[0].USER_PASS
        }
        var userForm = {
            USER_ID: buyrList[0].USER_ID,
            USER_NAME: buyrList[0].USER_NAME,
            EMAIL: buyrList[0].EMAIL,
            USER_PASS: buyrList[0].USER_PASS,
            POSITION: buyrList[0].POSITION,
            USER_INTRO: buyrList[0].USER_INTRO,
            AVATAR_URL: buyrList[0].AVATAR_URL,
            AVATAR_PATH: buyrList[0].AVATAR_PATH,
            PHONE: buyrList[0].PHONE,
            PASS_SALT: buyrList[0].PASS_SALT,
            USER_STATUS: buyrList[0].USER_STATUS,
            USER_SCORE: buyrList[0].USER_SCORE,
            TOTAL_COST_AMT: buyrList[0].TOTAL_COST_AMT
        }
        // 生成唯一md5识别码
        var md5 = doMd5('', data);
        if (md5 == req.body.md5) {
            // 将权限信息写入token
            permission(userForm, res, 0);// 买家权限为0
        } else {
            res.status(401).send('invalid buyr')
        }
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 出价
buyr.post('/postPrice', jsonParser, async (req, res) => {
    try {
        var form = {
            INFO_ID: Date.now(),
            BUYR_ID: req.body.BUYR_ID,
            GOOD_ID: parseInt(req.body.GOOD_ID),
            PRICE: req.body.PRICE,
            TIME: new Date()
        }
        let insertRes = await insertDb("price_info", form);
        if(isFine(insertRes).judge) {
            throw insertRes.value;
        }
        res.send(form);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 更新个人信息
buyr.post('/updateInfo', jsonParser, (req, res) => {
    var form = {
        USER_NAME: req.body.name,
        EMAIL: req.body.email,
        USER_PASS: req.body.pass,
        POSITION: req.body.position,
        USER_INTRO: req.body.intro,
        // AVATAR_URL: ,
        // AVATAR_PATH: ,
        PHONE: req.body.phone,
    }
    allPro([updateDb('buyr_user', {USER_ID: req.body.id}, {$set: form})], res);
})

// 获取个人订单
buyr.post('/getOrders', jsonParser, async(req, res) => {
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

// 更新订单信息
buyr.post('/updateOrder', jsonParser, (req, res) => {
    var form = {
        ADDRESS: req.body.ADDRESS,
        NAME: req.body.NAME,
        PHONE: req.body.PHONE,
        LEAVE_COMMENT: req.body.LEAVE_COMMENT,
        CREATED_BY: req.body.USER_ID,
        CREATED_TIME: new Date(),
        ORDER_STATUS: 0,
        PD: 0
    };
    allPro([updateDb('buyr_order', {ORDER_ID: req.body.ORDER_ID}, {$set: form})], res);
})

// 支付订单
buyr.post('/payOrder', jsonParser, (req, res) => {
    allPro([updateDb('buyr_order', {ORDER_ID: req.body.ORDER_ID}, {$set: {PD: 1}})], res);
})

// 确认收货
buyr.post('/getGood', jsonParser, (req, res) => {
    allPro([updateDb('buyr_order', {ORDER_ID: req.body.ORDER_ID}, {$set: {PD: 3}})], res);
})

// 搜索
buyr.post('/searchGoods', jsonParser, async (req, res) => {
    try {
        let goodsList = await findPro("goods", req.body);
        if(isFine(goodsList).judge) {
            throw goodsList.value;
        }
        res.send(goodsList);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

export default buyr;