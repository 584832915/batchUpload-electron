// 生成随机数
export const randomNumber = (n: number) => {
    let sString = "";
    let strings = "0123456789";
    for (let i = 0; i < n; i++) {
        let ind = Math.floor(Math.random() * strings.length);
        sString += strings.charAt(ind);
    }
    return sString
}

// 过滤文件大小
export function filterFileSize(val: number) {
    if (val) {
        let k = (val / 1024).toFixed(2)
        let m = (val / 1024 / 1024).toFixed(2)
        let g = (val / 1024 / 1024 / 1024).toFixed(2)
        return g == "0.00" ? m == '0.00' ? `${k}K` : `${m}M` : `${g}G`
    }
    else {
        return ''
    }
}

// 一维数组转二维数组
export function reverseFlat(arr: any, num: number) {
    var newArr = [];
    let len = arr.length;
    for (let i = 0, j = 0; i < len; i += num, j++) {
        newArr[j] = arr.splice(0, num);
    }
    return newArr;
}