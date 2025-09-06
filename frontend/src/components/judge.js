export default {
    isPhone: (str) => {// 11-digit mobile phone number verification
        const phoneReg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/
        return phoneReg.test(str);
    },
    isMail: (str) => {// Email format verification
        const emailReg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/
        return emailReg.test(str)
    },
    isDate: (str) => {// Date YYYY-MM-DD
        const dateReg = /^\d{4}(\-)\d{1,2}\1\d{1,2}$/
        return dateReg.test(str)
    },
    isQQ: (str) => {// 5-11 digits
        const qqReg = /^[1-9][0-9]{4,10}$/
        return qqReg.test(str)
    },
    isWechat: (str) => {// 6 to 20 characters, starting with a letter, letters, numbers, minus signs, underscores
        const wxReg = /^[a-zA-Z]([-_a-zA-Z0-9]{5,19})+$/
        return wxReg.test(str)
    }
}