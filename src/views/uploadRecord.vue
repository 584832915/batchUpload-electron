<template>
  <div class="uploadRecord">
    <div class="title">
      <h2>批量上传录制件</h2>
      <el-button type="primary" plain @click="logout">退出登录</el-button>
    </div>
    <p>1. 上传文件最大支持10G。</p>
    <p>2. 支持格式：mp4、flv、mov、avi、wmv、mkv</p>
    <p>3. 上传中请不要刷新或关闭此应用，否则会导致上传失败</p>
    <el-button @click="select" plain type="primary" style="margin:20px">选择上传文件</el-button>
    <el-button type="primary" @click="sureUpload">上传文件</el-button>
    <el-table :data="list" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" :selectable="selectable" />
      <el-table-column prop="fileName" show-overflow-tooltip label="文件名" />
      <el-table-column prop="fileSuffix" label="文件名后缀" width="160" />
      <el-table-column prop="size" label="文件大小" width="160">
        <template #default="scope">
          {{filterFileSize(scope.row.size)}}
        </template>
      </el-table-column>
      <el-table-column label="上传状态" width="160">
        <template #default="scope">
          <span :style="{color:statusObj[scope.row.status].color}">{{statusObj[scope.row.status].label}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="filePath" label="文件路径" />
      <el-table-column label="操作" width="160">
        <template #default="scope">
          <el-button type="primary" link @click="resetStatus(scope.row)" v-if="scope.row.status !== 0">重置状态</el-button>
          <el-button type="danger" link @click="delItem(scope.row)" v-if="![2,4].includes(scope.row.status)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, toRefs } from 'vue';
import { useIpcRenderer } from '@vueuse/electron';
import uploadMixin from './uploadSource-mixins';
import { ElMessageBox, ElMessage } from 'element-plus';
import { randomNumber, filterFileSize } from '@/utils/utils-function';
import { useRouter } from 'vue-router';
export default defineComponent({
	setup() {
		const router = useRouter();
		const ipcRenderer = useIpcRenderer();
		const state = reactive({
			list: [],
			fileTypes: ['flv', 'mp4', 'mov', 'avi', 'wmv', 'mkv'],
			selecteData: [],
			formInline: {
				type: 2,
				webcast_id: ''
			},
			source: 1,
			statusObj: {
				0: { label: '未上传', color: '#666666' },
				1: { label: '已上传', color: '#34b042' },
				2: { label: '等待上传', color: '#666666' },
				3: { label: '上传失败', color: '#DE353D' },
				4: { label: '正在上传...', color: '#2081EB' }
			}
		});
		let createWebcast: any = {
			title: ''
		};
		const methods = reactive({
			handleSelectionChange: (val: any) => {
				state.selecteData = val.map((item: any) => item.md5Key);
			},
			// 选择上传文件
			sureUpload: () => {
				if (!state.selecteData.length) {
					ElMessage.error('请选择要上传的文件');
					return;
				}
				ElMessageBox.confirm('', '提示', {
					message:
						'<p>1、上传时请不要关闭此应用，关闭此应用会上传终止</p><p>2、上传前请检查文件路径是否正确，不正确将导致上传失败</p>',
					confirmButtonText: '确定上传',
					cancelButtonText: '取消上传',
					dangerouslyUseHTMLString: true,
					type: 'warning'
				})
					.then(() => {
						ipcRenderer.send('uploadStart', JSON.stringify(state.selecteData));
					})
					.catch(() => {});
			},
			// 点击选择上传文件
			select: () => {
				ipcRenderer.send('open-directory-dialog', 'openDirectory');
				ipcRenderer.on('selectedItem', function (e, files) {
					state.list = Object.values(files);
				});
			},
			// 上传完成
			getList: (type: string) => {
				if (type == 'uploadFinish') {
					ipcRenderer.send('uploadFinish');
				}
			},
			// 删除
			delItem: (row: any) => {
				ipcRenderer.send('delItem', row.md5Key);
			},
			// 重置状态
			resetStatus: (row: any) => {
				ElMessageBox.confirm('重置状态重新上传，将重新创建直播间', {
					confirmButtonText: '确定重置',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					ipcRenderer.send('resetStatus', row.md5Key);
				});
			},
			// 上传失败
			uploadError: (md5Key: string) => {
				ipcRenderer.send('uploadError', md5Key);
			},
			// 禁用
			selectable: (row: any) => {
				return row.status == 0;
			},
			// 退出登录
			logout: () => {
				sessionStorage.clear();
				router.push({ path: '/' });
			}
		});
		onMounted(() => {
			ipcRenderer.on('selectedItem', function (e, files) {
				state.list = Object.values(files);
			});
			ipcRenderer.on('uploadItem', async function (e, file, fileName, md5Key) {
				state.formInline.webcast_id = 'xxxxxxxxxxxxx';
				let blob = new Blob([file]);
				let fileFile = new File([blob], fileName, { type: '' });
				mixinU.fileChange.value(fileFile, md5Key);
			});
			ipcRenderer.send('readJson', sessionStorage.getItem('cid'));
		});
		const mixinU = uploadMixin(state, methods);
		return {
			filterFileSize,
			...toRefs(state),
			...toRefs(methods)
		};
	}
});
</script>
<style scoped lang="scss">
.uploadRecord {
	.title {
		display: flex;
		justify-content: space-between;
	}
	padding: 30px;
	h2 {
		margin-bottom: 10px;
	}
}
</style>