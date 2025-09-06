// 判断是不是所有请求都成功
function isFine(resx) {
    if(resx.length) {
        for(let i = 0; i < resx.length; i++) {
            if(resx[i].status == "rejected") {
                return {
                    judge: true,
                    item: i
                };
            }else {
                return {
                    judge: false
                };
            }
        }
    }else {
        if(resx.status == "rejected") {
            return true;
        }else {
            return false;
        }
    }
}
// 处理所有promise请求
async function allPro(arr, res, fun) {
    await Promise.allSettled(arr).then(resx => {
        var judge = isFine(resx);
        if(judge.judge) {
            // 发生错误的操作
            res.status(401).send(resx[judge.item].value);
        }else {
            if(fun) {
                // 存在函数fun就执行函数
                fun(resx, res);
            }else {
                // 不存在函数fun直接返回结果
                if(resx[0]) {
                    res.send(resx[0].value)
                }else {
                    res.send("Success")
                }
            }
        }
    })
}
export {
    allPro,
    isFine
}