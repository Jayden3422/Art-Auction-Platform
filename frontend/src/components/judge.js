export default {
    isPhone: (str) => {// 手机号验证
        const phoneReg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/
        return phoneReg.test(str);
    },
    isMail: (str) => {// 邮箱格式验证
        const emailReg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/
        return emailReg.test(str)
    },
    isDate: (str) => {// 日期 YYYY-MM-DD
        const dateReg = /^\d{4}(\-)\d{1,2}\1\d{1,2}$/
        return dateReg.test(str)
    },
    isQQ: (str) => {// 5-11位数字
        const qqReg = /^[1-9][0-9]{4,10}$/
        return qqReg.test(str)
    },
    isWechat: (str) => {// 6至20位，以字母开头，字母，数字，减号，下划线
        const wxReg = /^[a-zA-Z]([-_a-zA-Z0-9]{5,19})+$/
        return wxReg.test(str)
    }
}