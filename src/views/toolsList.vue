<template>
  <div class="toolslist">
    <img alt="Vue logo" src="../assets/logo.png">
    <el-button type="primary" @click="goPushPage">批量上传录制件</el-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
import { useRouter } from 'vue-router';
export default defineComponent({
	setup() {
		const state = reactive({});
		const router = useRouter();
		const methods = reactive({
			goPushPage: () => {
				router.push({ path: '/upload_record' });
			}
		});
		return {
			...toRefs(state),
			...toRefs(methods)
		};
	}
});
</script>
<style scoped lang="scss">
.toolslist {
	height: 100%;
	display: flex;
	flex-direction: column;
	max-width: 300px;
	margin: 100px auto;
}
</style>