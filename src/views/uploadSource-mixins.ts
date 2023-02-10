import { reactive, toRefs } from 'vue';
import { reverseFlat } from '@/utils/utils-function'

export default function (getStatus: any, getMethods: any) {
    const state = reactive({
        statusText: {
            prepare: '准备中',
            complete: '上传成功',
            transcoding: '转码中',
            fail: '上传失败',
            transcodingFail: '转码失败',
            stop: '已暂停'
        },
        fileTypes: getStatus.fileTypes,
        lastTime: new Date().getTime(), //上次上传完时间
        piece: 1024 * 1024 * 5, //分片大小
        fileStop: false
    });
    let sliceOk: any = []
    let spliceArr: any = []
    let count = 0
    const methods = reactive({
        // 上传文件
        fileChange: (file: any, md5Key: string) => {
            getStatus.loading = true
            let fileObject = {
                file: file,
                percentText: Math.ceil(file.size / 1024 / 1024) + 'MB',
                uniqueIdentifier: ''
            };
            if (file.size === 0) {
                fileObject.uniqueIdentifier = 'fail';
                return;
            }
            methods.computeMD5(fileObject, md5Key);
        },
        // 获取文件md5
        computeMD5: (fileObject: any, md5Key: string) => {
            let chunkSize = 1024 * 1024 * 100,
                chunks = Math.ceil(fileObject.file.size / chunkSize),
                currentChunk = 0,
                fileReader = new FileReader();
            let blobSlice = File.prototype.slice;
            let loadNext = () => {
                let start = currentChunk * chunkSize,
                    end = start + chunkSize >= fileObject.file.size ? fileObject.file.size : start + chunkSize;
                let chunk = blobSlice.call(fileObject.file, start, end);
                fileReader.readAsArrayBuffer(chunk);
            };
            fileReader.onload = (e: any) => {
                currentChunk++;
                if (currentChunk < chunks) {
                    loadNext();
                } else {
                    fileObject.uniqueIdentifier = md5Key; //将文件md5赋值给文件唯一标识
                    methods.getToken(fileObject);
                }
            };
            fileReader.onerror = (err) => {
                fileObject.uniqueIdentifier = 'fail';
                getMethods.uploadError(md5Key)
            };
            loadNext();
        },
        // 获取文件上传token
        getToken: (fileObject: any) => {
            let param: any = {
                file_name: fileObject.file.name,
                md5: fileObject.uniqueIdentifier,
                size: fileObject.file.size,
                source: getStatus.source,
                type: getStatus.formInline.type,
                webcast_id: getStatus.formInline.webcast_id
            };
            getStatus.loading = false
            methods.sliceFile(fileObject);
            state.lastTime = new Date().getTime();
        },
        sliceFile: (fileObject: any) => {
            let totalSize = fileObject.file.size; // 文件总大小
            let chunks = Math.ceil(totalSize / state.piece);
            let start = 0; // 每次上传的开始字节
            let end = start + state.piece; // 每次上传的结尾字节
            let chunk = 0;
            fileObject.load = true;
            let arr: any = new Array(chunks).fill(fileObject.uniqueIdentifier);
            sliceOk.push(...arr);
            let sliceArr = []//分成了多少份
            while (start < totalSize) {
                if (!state.fileStop) {
                    chunk = chunk + 1;
                    sliceArr.push({ start, end })
                    // methods.uploadFile(fileObject, start);
                }
                start = end;
                end = start + state.piece;
            }
            spliceArr = reverseFlat(sliceArr, 3)
            methods.beforeUploadFun('', fileObject)
        },
        beforeUploadFun(type: string = '', fileObject: any) {
            if (type == 'finish') {
                spliceArr.shift()
            }
            count = 0
            let arrItem = spliceArr[0]
            if (arrItem) {
                arrItem.forEach((val: any) => {
                    methods.uploadFile(fileObject, val.start, val.end, 3)
                })
            }
        },
        uploadFile: async (fileObject: any, start: any, end: any, chunkNum: number) => {
            let blobSlice = File.prototype.slice; //兼容方式获取slice方法
            let blob = blobSlice.call(fileObject.file, start, end);
            let fd = new FormData();
            fd.append('file', blob);
            let parms = {
                start: start,
                size: state.piece,
                token: fileObject.fileToken
            };
            fd.append('break_upload_param', JSON.stringify(parms));
            try {
                const { data } = await uploadResource(fd);
                if (data.status == 0) {
                    let index = sliceOk.findIndex((val: any) => val == fileObject.uniqueIdentifier)
                    sliceOk.splice(index, 1)
                    count++;
                    if (count == chunkNum) {
                        methods.beforeUploadFun('finish', fileObject)
                    }
                    if (!sliceOk.some((val: any) => val == fileObject.uniqueIdentifier)) {
                        methods.finish(fileObject);
                    }
                }
            } catch {
                getMethods.uploadError(fileObject.uniqueIdentifier)
            }
        },
        finish: (fileObject: any) => {
            count = 0
            let param = {
                token: fileObject.fileToken,
                md5: fileObject.uniqueIdentifier,
                size: fileObject.file.size
            };
            fileObject.percentText = Math.ceil(fileObject.file.size / 1024 / 1024) + 'MB';
            getMethods.getList('uploadFinish')

        },
    });
    return {
        ...toRefs(state),
        ...toRefs(methods)
    };
}