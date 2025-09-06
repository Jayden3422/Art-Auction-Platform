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


const seller = express.Router();
seller.get('/', (req,res)=>{
    res.send("seller");
});

// 注册
seller.post('/signin', jsonParser, (req, res) => {
    var form = {
        SELLER_ID: Date.now(),
        SELLER_NAME: req.body.name,
        EMAIL: req.body.email,
        SELLER_PASS: req.body.pass,
        PHONE: req.body.phone,
        USER_STATUS: 0,
        USER_SCORE: 10,
        TOTAL_COST_AMT: 0
    }
    allPro([insertDb('seller', form)], res);
})

// 登录
seller.post('/login', jsonParser, async (req, res) => {
    var info = req.body.EMAIL;
    try {
        let sellerList = await findPro('seller', { EMAIL: info });
        if(isFine(sellerList).judge) {
            throw sellerList.value;
        }
        if (!sellerList[0]) {
            res.status(401).send('invalid seller');
            return;
        }
        // 获取基本登录信息
        var data = {
            EMAIL: sellerList[0].EMAIL,
            SELLER_PASS: sellerList[0].SELLER_PASS
        }
        var userForm = {
            SELLER_ID: sellerList[0].SELLER_ID,
            SELLER_NAME: sellerList[0].SELLER_NAME,
            EMAIL: sellerList[0].EMAIL,
            SELLER_PASS: sellerList[0].SELLER_PASS,
            POSITION: sellerList[0].POSITION,
            SELLER_INTRO: sellerList[0].SELLER_INTRO,
            AVATAR_URL: sellerList[0].AVATAR_URL,
            AVATAR_PATH: sellerList[0].AVATAR_PATH,
            PHONE: sellerList[0].PHONE,
            PASS_SALT: sellerList[0].PASS_SALT,
            SELLER_STATUS: sellerList[0].SELLER_STATUS,
            SELLER_SCORE: sellerList[0].SELLER_SCORE,
            TOTAL_SELL_AMT: sellerList[0].TOTAL_SELL_AMT
        }
        // 生成唯一md5识别码
        var md5 = doMd5('', data);
        if (md5 == req.body.md5) {
            // 将权限信息写入token
            permission(userForm, res, 1);// 卖家权限为1
        } else {
            res.status(401).send('invalid seller')
        }
    }catch(e) {
        res.status(500).send('Registration failed')
    }
})

// 获取自己的物品
seller.post('/getGoods', jsonParser, async (req, res) => {
    try {
        let goodsList = await findSort("goods", req.body, { START_TIME: -1 });
        if(isFine(goodsList).judge) {
            throw goodsList.value;
        }
        res.send(goodsList);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 即将拍卖
seller.post('/getAllNear', jsonParser, async (req, res) => {
    var nowDate = new Date();
    var year = nowDate.getFullYear();
    var month = nowDate.getMonth() + 1;
    var dates = nowDate.getDate();
    var newDate = dates + 4;
    var nearDate = new Date([year, month, newDate].join('-'))
    try {
        let goodsList = await findSort("goods", {START_TIME: {$gt: nowDate}, UPLOADER_ID: req.body.UPLOADER_ID}, { START_TIME: -1 });
        if(isFine(goodsList).judge) {
            throw goodsList.value;
        }
        res.send(goodsList);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 正在拍卖
seller.post('/getAllSale', jsonParser, async (req, res) => {
    var nowDate = new Date();
    try {
        let goodsList = await findSort("goods", {START_TIME: {$lte: nowDate}, END_TIME: {$gt: nowDate}, UPLOADER_ID: req.body.UPLOADER_ID}, { END_TIME: 1 });
        if(isFine(goodsList).judge) {
            throw goodsList.value;
        }
        res.send(goodsList);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 拍卖结束
seller.post('/getAllEnd', jsonParser, async (req, res) => {
    var nowDate = new Date();
    try {
        let goodsList = await findSort("goods", {END_TIME: {$lte: nowDate}, UPLOADER_ID: req.body.UPLOADER_ID}, { END_TIME: -1 });
        if(isFine(goodsList).judge) {
            throw goodsList.value;
        }
        res.send(goodsList);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 更新物品信息
seller.post('/updateGood', jsonParser, async (req, res) => {
    var form = {
        NAME: req.body.NAME,
        UPSET_PRICE: parseFloat(req.body.UPSET_PRICE),
        PRICE: parseFloat(req.body.UPSET_PRICE),
        COUNT: parseInt(req.body.COUNT),
        CLASS: parseInt(req.body.CLASS),
        STEP: parseInt(req.body.STEP),
        START_TIME: new Date(req.body.START_TIME),
        END_TIME: new Date(req.body.END_TIME),
        INTRODUCTION: req.body.INTRODUCTION,
        IMG_URL: req.body.IMG_URL,
        IMG_PATH: req.body.IMG_PATH,
        UPLOAD_TIME: new Date(),
        GOOD_STATE: 0,
        ARTIST: req.body.ARTIST,
        CERTIFICATE: req.body.CERTIFICATE
    }
    await allPro([updateDb('goods', {GOOD_ID: parseInt(req.body.GOOD_ID)}, {$set: form})], res);
    final();
})

// 添加物品
seller.post('/addGood', jsonParser, async (req, res) => {
    var form = {
        GOOD_ID: parseInt(Date.now()),
        NAME: req.body.NAME,
        UPSET_PRICE: parseFloat(req.body.UPSET_PRICE),
        PRICE: 0,
        COUNT: parseInt(req.body.COUNT),
        CLASS: parseInt(req.body.CLASS),
        STEP: parseInt(req.body.STEP),
        START_TIME: new Date(req.body.START_TIME),
        END_TIME: new Date(req.body.END_TIME),
        INTRODUCTION: req.body.INTRODUCTION,
        IMG_URL: req.body.IMG_URL,
        IMG_PATH: req.body.IMG_PATH,
        UPLOAD_TIME: new Date(),
        UPLOADER_ID: req.body.UPLOADER_ID,
        GOOD_STATE: 0,
        ARTIST: req.body.ARTIST,
        CERTIFICATE: req.body.CERTIFICATE
    }
    await allPro([insertDb('goods', form)], res);
    final();
})

// 删除物品
seller.post('/delGood', jsonParser, (req, res) => {
    allPro([deleteData('goods', {GOOD_ID: parseInt(req.body.GOOD_ID)})], res);
})

// 更新卖家信息
seller.post("/updateInfo", jsonParser, (req, res) => {
    var form = {
        SELLER_NAME: req.body.name,
        EMAIL: req.body.email,
        SELLER_PASS: req.body.pass,
        PHONE: parseInt(req.body.phone),
        POSITION: req.body.position,
        SELLER_INTRO: req.body.intro,
    }
    allPro([updateDb('seller', {SELLER_ID: req.body.id}, {$set: form})], res);
})

// 获取卖家订单
seller.post('/getOrders', jsonParser, async (req, res) => {
    try {
        let orderList = await findSort("buyr_order", req.body, {CREATED_TIME: -1});
        if(isFine(orderList).judge) {
            throw orderList.value;
        }
        var list = [];// 所有要查的GOOD_ID
        for(let i = 0; i < orderList.length; i++) {
            list.push(orderList[i].GOOD_ID);
        }
        var list1 = [];// 所有返回有结果的Promise
        for(let i = 0; i < list.length; i++) {
            list1.push(findPro("goods", {"GOOD_ID": list[i]}));
        }
        Promise.allSettled(list1).then(resx => {
            for(let i = 0; i < resx.length; i++) {
                for(let i = 0; i < list.length; i++){
                    if(orderList[i].GOOD_ID == resx[i].value[0].GOOD_ID){
                        orderList[i].GOOD_INFO = resx[i].value[0];
                    }
                }
            }
            res.send(orderList);
        }).catch(e => {
            res.status(500).send('Failed to obtain')
        })
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 更新卖家订单
seller.post('/updateOrder', jsonParser, (req, res) => {
    var form = {
        ORDER_STATUS: 0,
        PD: parseInt(req.body.PD),
        UPDATED_BY: req.body.UPDATED_BY,
        EMS: req.body.EMS,
        UPDATED_TIME: new Date()
    };
    allPro([updateDb('buyr_order', {ORDER_ID: req.body.ORDER_ID}, {$set: form})], res);
})

export default seller;