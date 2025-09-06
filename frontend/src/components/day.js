/**
 * @desc 格式化日期字符串
 * @param { Nubmer} - 时间戳
 * @returns { String } 格式化后的日期字符串
 */
export function formatDate(timestamp) {
    let minute = 1000 * 60;
    let hour = minute * 60;
    let day = hour * 24;
    let month = day * 30;
    let now = new Date().getTime();
    let diffValue = now - timestamp;
    // 如果本地时间反而小于变量时间
    if (diffValue <= 0) {
        return 'Not long ago';
    }
    // 计算差异时间的量级
    let monthC = diffValue / month;
    let weekC = diffValue / (7 * day);
    let dayC = diffValue / day;
    let hourC = diffValue / hour;
    let minC = diffValue / minute;
    // 数值补0方法
    let zero = function (value) {
        if (value < 10) {
            return '0' + value;
        }
        return value;
    };
    // 使用
    if (monthC > 12) {
        // 超过1年，直接显示年月日
        return (function () {
            let date = new Date(timestamp);
            return date.getFullYear() + '.' + zero(date.getMonth() + 1) + '.' + zero(date.getDate()) + '';
        })();
    } else if (monthC >= 1) {
        return parseInt(monthC) + 'months ago';
    } else if (weekC >= 1) {
        return parseInt(weekC) + 'weeks ago';
    } else if (dayC >= 1) {
        return parseInt(dayC) + 'days ago';
    } else if (hourC >= 1) {
        return parseInt(hourC) + 'hours ago';
    } else if (minC >= 1) {
        return parseInt(minC) + 'minutes ago';
    }
    return 'just now';
}
