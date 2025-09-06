import doMd5 from "./tools/md5.js";// md5加密
import { encodeBase64, decodeBase64 } from "./tools/base64.js";// base64加密/解密
import {createToken, verifyToken} from "./tools/token.js";// 引入token操作函数
import {salt, permission, final} from "./tools/public.js"
// 引入express框架
import express from "express";
var app = express();

// 新增：引入 cookie-parser
import cookieParser from 'cookie-parser';

import multer from "multer";
//设置临时目录 存放上传的图片
const upload = multer({ dest: "tmp/" });

// 引入保存文件操作
import { storeFile } from "./tools/dofs.js";

// 引入数据库相关操作
import { insertDb, deleteData, deleteDatas, findPro, findSort, findLimitSort, updateDb, updateDbs } from "./tools/Mongo.js";

// 引入阿里云oss操作
import { putOSS, delOSS } from "./tools/aliOSS.js";

import bodyParser from "body-parser";// 引入中间件解析body
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false });
// 创建 application/json parser
var jsonParser = bodyParser.json();

// Promise处理
import { isFine, allPro } from "./tools/promise.js";

// 引入路由对象
import all from "./routers/all.js";
import buyr from "./routers/buyr.js";
import seller from "./routers/seller.js";
import admin from "./routers/admin.js";

// 新增：引入 i18n
import i18n from 'i18n';
import path from 'path'; // 用于 __dirname
import { fileURLToPath } from "url"; // 用于获取 __dirname

// 在 ES 模块中定义 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置 i18n
i18n.configure({
  locales: ['en', 'zh'], // 支持的语言
  directory: path.join(__dirname, 'locales'), // 语言文件目录
  defaultLocale: 'en', // 默认语言
  cookie: 'lang', // Cookie 键名，用于持久化语言
  queryParameter: 'lang', // 查询参数，如 ?lang=zh
  autoReload: true, // 开发时自动重载语言文件
  syncFiles: true, // 自动同步缺失的键
  register: global, // 全局注册，便于在非 req 环境中使用
  // 新增：忽略 Accept-Language 头，强制使用默认或查询/Cookie
  updateFiles: false, // 避免自动写文件，如果不需要
});

// 使用 cookie-parser 中间件
app.use(cookieParser());
// 设置 i18n 中间件（放在跨域设置前或后均可，但要在路由前）
app.use(i18n.init);
// 验证使用语言
// app.use((req, res, next) => {// 如果没有查询参数或 Cookie，强制设置为 'zh'
//     if (!req.query.lang && !req.cookies.lang) {
//       req.setLocale('zh');
//     }
//     console.log('Current locale:', req.getLocale()); // 打印当前语言
//     console.log('Translation for hello:', req.__('hello')); // 打印翻译结果
//     next();
//   });
// console.log(__('hello'))

// 设置允许跨域
app.use(function (req, res, next) {
    // 指定允许其他域名访问 *所有
    res.setHeader("Access-Control-Allow-Origin", "*");
    // 允许客户端请求头中带有的
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With, Access-Token, x-custom-header, token");
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    // 允许请求的类型
    res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.setHeader("X-Powered-By", ' 3.2.1')
    next();
});

// 以下为接口相关函数
// 白名单，允许所有用户访问
const whiteList = [
    '/',
    '/all/isToken',
    // 买家
    '/buyr',
    '/buyr/login',
    '/buyr/signin',
    // 卖家
    '/seller',
    '/seller/login',
    '/seller/signin',
    // 管理员
    '/admin',
    '/admin/login',
];
// 设置总体前置路由拦截
app.use((req, res, next) => {
    // 处理优先发出的OPTIONS方法，返回200以便后面执行POST请求
    if (req.method.toLowerCase() === 'options') {
        res.sendStatus(200);
    } else {
        let info = {};
        if (!whiteList.includes(req.url)) {// 如果路径不包括白名单路径就进行token验证
            verifyToken(salt, req.headers.token).then(async (resx) => {// 验证token是否正确
                if(resx.Permission == 0) {
                    info = await findPro('buyr_user', { "EMAIL": resx.EMAIL });
                }else if(resx.Permission == 1) {
                    info = await findPro('seller', { "EMAIL": resx.EMAIL });
                }else if(resx.Permission == 2) {
                    info = await findPro('admin', { "EMAIL": resx.EMAIL });
                }
                if(isFine(info).judge) {
                    throw info.value;
                }
                if(info[0].PASS_SALT == req.headers.token) {
                    next()// 正确就进行路由跳转
                }else {
                    throw resx;
                }
            }).catch(e => {// 不正确就返回401状态token无效
                res.status(401).send('invalid token')
            })
        } else {// 如果路径在白名单内就直接进行跳转
            next()
        }
    }
})

// 拍卖时间结束后的操作
final();

app.get('/', function (req, res) {
    res.send(req.__('hello') + ' Express');
})

app.use('/all', all);
app.use('/buyr', buyr);
app.use('/seller', seller);
app.use('/admin', admin);


// websocket
import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3001 }) // 服务端口3006
var player = new Array()
console.log(__('createWs') + ', ' + __('servicePort') + ': 3001')

// 创建连接
wss.on("connection", ws => {
    let id = Math.floor(Math.random() * (99999999 - 10000000 + 1)) + 10000000;
    player.push(id)
    console.log(__('newClient'))
    // 接收到 client 数据时
    ws.on("message", data => {
        //前台传ping就返回ok
        if (data == 'ping') {
            ws.send('ok')
            return
        }
        let myData = JSON.parse(data.toString());
        myData.TIME = new Date();
        //群发
        wss.clients.forEach(s => {
            if (s.readyState == 1 && s.socketIdxos != id) {
                s.send(JSON.stringify(myData));
            }
        })
    })
    ws.on("close", () => {
        console.log("websocket server: " + __('clientClosed'))
        player = new Array()
    })
    ws.onerror = function () {
        console.log("websocket server: " + __('wrong'))
    }
})


// 监听3000接口
app.listen(3000, function () {
    console.log('app is runing at port 3000');
})