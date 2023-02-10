const {app, BrowserWindow, ipcMain, dialog,sender} = require("electron")
const path = require('path')
const fs = require('fs')
let crypto = require('crypto')

const NODE_ENV = process.env.NODE_ENV
// 关闭警告
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true"
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (NODE_ENV !== "development") {
  global.__static = path.join(__dirname, "/static").replace(/\\/g, "\\\\");
}

let mainWindow;
const winURL =
  NODE_ENV === "development"
    ? `http://localhost:9080`
    : `file://${path.join(__dirname,'../dist/index.html')}`;

function createWindow() {
    mainWindow = new BrowserWindow({
        height: 863,
        useContentSize: true,
        width: 1400,
        webPreferences:{
          nodeIntegration: true,
          contextIsolation: false,
          nodeIntegrationInWorker: true,
        },
    });

    mainWindow.loadURL(winURL);
    // 开发环境，自动打开控制台
    if(NODE_ENV === "development"){
        mainWindow.webContents.openDevTools()
    }

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.on("ready", createWindow);
// 解决本地跨域
app.whenReady().then(()=>{
    mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details,callback)=>{
      callback({
        requestHeaders:{Origin:'',...details.requestHeaders}
      })
    });
    mainWindow.webContents.session.webRequest.onHeadersReceived((details,callback)=>{
      callback({
        responeseHeaders:{
          'Access-Control-Allow-Origin':['*'],
          ...details.responeseHeaders
        }
      })
    })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

let fileJson = {}
let cid = ''
ipcMain.on('readJson',function(event,p){
  cid = p;
  fs.stat(path.join(__dirname,'uploaded.json'),function(err,statObj){
    // 如果文件存在
    if(statObj){
       const readJson =  fs.readFileSync(path.join(__dirname,'uploaded.json'),{encoding:'utf8'})
       fileJson = JSON.parse(readJson)
       if(fileJson[cid]){
        event.sender.send("selectedItem",fileJson[cid]);
       }else{
        fileJson[cid] = {}
        event.sender.send("selectedItem",fileJson[cid]);
       }
    }else{
      fileJson[cid] = {}
    }
  })
})

let uploadArr = []
// 开始上传
ipcMain.on('uploadStart',function(event,p){
  uploadArr =Array.from(new Set([...uploadArr,...JSON.parse(p)]))
  uploadArr.forEach((val)=>{
    fileJson[cid][val].status = 2
  })
  // 更新选中上传文件状态
    event.sender.send("selectedItem",fileJson[cid]);
    writeJson(JSON.stringify(fileJson)) 
    uploadItem()
})

// 上传单个
function uploadItem(){
  let item = uploadArr[0];
  fs.stat(fileJson[cid][item].filePath,function(err,statObj){
    if(statObj){
      fileJson[cid][item].status = 4
      mainWindow.webContents.send("selectedItem",fileJson[cid]);
      writeJson(JSON.stringify(fileJson))
      const videoBuffer = fs.readFileSync(fileJson[cid][item].filePath)
      mainWindow.webContents.send("uploadItem", videoBuffer,fileJson[cid][item].fileName,item)
    }else{
      fileJson[cid][item].status = 3
      mainWindow.webContents.send("selectedItem",fileJson[cid]);
      writeJson(JSON.stringify(fileJson))
    }
  })
}

// 上传完成
ipcMain.on("uploadFinish",function(event,p){
    const item = uploadArr[0]
    fileJson[cid][item].status = 1
    mainWindow.webContents.send("selectedItem",fileJson[cid]);
    writeJson(JSON.stringify(fileJson))
    uploadArr.shift()
    if(uploadArr.length){
      uploadItem()
    }
})

// 重置状态
ipcMain.on('resetStatus',function(event,p){
    fileJson[cid][p].status = 0
    mainWindow.webContents.send("selectedItem",fileJson[cid]);
    writeJson(JSON.stringify(fileJson))
})

// 上传失败
ipcMain.on('uploadError',function(event,p){
    fileJson[cid][p].status = 3
    mainWindow.webContents.send("selectedItem",fileJson[cid]);
    writeJson(JSON.stringify(fileJson))
    uploadArr.shift()
    if(uploadArr.length){
      uploadItem()
    }
})

// 删除文件
ipcMain.on('delItem',function(event,p){
    delete fileJson[cid][p]
    mainWindow.webContents.send("selectedItem",fileJson[cid]);
    writeJson(JSON.stringify(fileJson))
})

// 选择文件
ipcMain.on("open-directory-dialog", function (event, p) {
  dialog.showOpenDialog(
    {
      filters: [{ name: 'Movies', extensions: ['flv', 'mp4', 'mov', 'avi', 'wmv', 'mkv'] }],
      title:'批量选择上传的文件',
      message:'按ctrl键多选',
      properties: ['openFile','multiSelections'],
    }
  ).then((val)=>{
    const fileList = val.filePaths
    let jsonObj = fileList.reduce((pre,cur)=>{
          const videoBuffer = fs.readFileSync(cur)
          const size = videoBuffer.length
          const md5 = crypto.createHash("md5")
          md5.update(videoBuffer); 
          const md5Key = md5.digest('hex'); //获取文件md5
          if(!fileJson[cid][md5Key]){
              const extname = path.extname(cur)
              let obj = {
                md5Key,//文件MD5
                size,//文件大小
                filePath:cur,
                fileName:path.basename(cur,extname),//文件名
                fileSuffix:extname,//文件名后缀
                status:0,//0:未上传，1已上传，2等待上传，3上传失败,4正在上传
              }
            pre[md5Key] = obj
          }
          return pre
    },{})
    const newObj = Object.assign(jsonObj,fileJson[cid])
    fileJson[cid] = newObj
    event.sender.send("selectedItem",newObj);
    writeJson(JSON.stringify(fileJson))
  })
});

function writeJson(json){
  fs.writeFile(path.join(__dirname,'uploaded.json'),json,'utf8',function(err){      
  })
}



