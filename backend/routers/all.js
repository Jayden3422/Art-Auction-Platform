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


const all = express.Router();
all.get('/', (req,res)=>{
    res.send("all");
});

// 验证token
all.post('/isToken', jsonParser, async (req, res) => {
    await verifyToken(salt, req.headers.token).then(async (result) => {
        let info = [];
        try {
            if (result.Permission == 0) {
                info = await findPro('buyr_user', { "EMAIL": result.EMAIL });
            } else if (result.Permission == 1) {
                info = await findPro('seller', { "EMAIL": result.EMAIL });
            } else {
                info = await findPro('admin', { "EMAIL": result.EMAIL });
            }
            
            if(isFine(info).judge) {
                throw info.value;
            }
        }catch(e) {
            res.status(500).send('Failed to obtain')
        }
        res.send(info[0]);
    }).catch(e => {
        res.status(401).send('invalid token')
    });
})

// 获取所有物品
all.get('/getAllGoods', async (req, res) => {
    try {
        let goodsList = await findSort("goods", req.body, {TIME: -1});
        if(isFine(goodsList).judge) {
            throw goodsList.value;
        }
        res.send(goodsList);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 获取物品详情
all.post('/getGood', jsonParser, async (req, res) => {
    try {
        let good = await findPro("goods", req.body);
        if(isFine(good).judge) {
            throw good.value;
        }
        res.send(good[0]);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 即将拍卖
all.get('/getAllNear', async (req, res) => {
    var nowDate = new Date();
    var year = nowDate.getFullYear();
    var month = nowDate.getMonth() + 1;
    var dates = nowDate.getDate();
    var newDate = dates + 4;
    var nearDate = new Date([year, month, newDate].join('-'));
    try {
        let goodsList = await findSort("goods", {START_TIME: {$gt: nowDate}}, { START_TIME: -1 });
        if(isFine(goodsList).judge) {
            throw goodsList.value;
        }
        res.send(goodsList);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 正在拍卖
all.get('/getAllSale', async (req, res) => {
    var nowDate = new Date();
    try {
        let goodsList = await findSort("goods", {START_TIME: {$lte: nowDate}, END_TIME: {$gt: nowDate}}, { END_TIME: 1 });
        if(isFine(goodsList).judge) {
            throw goodsList.value;
        }
        res.send(goodsList);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 拍卖结束
all.get('/getAllEnd', async (req, res) => {
    var nowDate = new Date();
    try {
        let goodsList = await findSort("goods", {END_TIME: {$lte: nowDate}}, { END_TIME: -1 });
        if(isFine(goodsList).judge) {
            throw goodsList.value;
        }
        res.send(goodsList);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 获取所有通知
all.get('/getAllAn', async (req, res) => {
    try {
        let annList = await findSort("announcement", {}, { TIME: -1 });
        if(isFine(annList).judge) {
            throw annList.value;
        }
        res.send(annList);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 获取所有通知
all.get('/getDics', async (req, res) => {
    try {
        let dicList = await findPro("dictionary", {});
        if(isFine(dicList).judge) {
            throw dicList.value;
        }
        res.send(dicList);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 出价信息
all.post('/getPriceList', jsonParser, async (req, res) => {
    var GOOD_ID = parseInt(req.body.GOOD_ID);
    try {
        let priceList = await findSort("price_info", {GOOD_ID: GOOD_ID}, { TIME: -1 });
        if(isFine(priceList).judge) {
            throw priceList.value;
        }
        res.send(priceList);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 最近30天统计数据
all.get('/getNewStat', async (req, res) => {
    try {
        var now = new Date();
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

export default all;