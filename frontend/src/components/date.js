export function fullDate(str) {
    var current = new Date(str);//实例化Date对象
    console.log("current", current)
    var nowYear = current.getFullYear();//获取当前的年份
    var nowMonth = current.getMonth() + 1;//默认显示的是0-11月，比我们正常的月份少一个月，所以要+1
    var nowdates = current.getDate();//获取日期
    var arr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var day = current.getDay();//因为西方人的习惯是周日第一，周一第二这样的排列
    //而且getDate（）返回的是 1 、 2这样的数字，我们想要获取星期几的话，可以自己先写好数组存放
    //然后通过数组的索引来获取星期几
    // 具体时间：
    var dateInfo = current.toLocaleString('chinese',{hour12:false}).split(' ')
    var startDate = nowYear + '.' + nowMonth + '.' + nowdates + '-' + arr[day] + dateInfo[1];
    return startDate;
}