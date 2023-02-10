<template>
  <div class="login">
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="60px" class="demo-ruleForm" status-icon>
      <h3>管理员登录</h3>
      <el-form-item label="账号" prop="username">
        <el-input v-model="ruleForm.username" placeholder="手机/邮箱/自定义账号" clearable></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="ruleForm.password" @keyup.enter="submit" placeholder="密码" show-password clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';
export default defineComponent({
	setup() {
		const ruleFormRef = ref();
		const router = useRouter();
		const state = reactive({
			ruleForm: {
				username: '',
				password: ''
			},
			rules: {
				username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
				password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
			}
		});
		const methods = reactive({
			resetForm: () => {},
			submit: () => {
				router.push({ path: '/upload_record' });
			}
		});
		onMounted(() => {});
		return {
			ruleFormRef,
			...toRefs(state),
			...toRefs(methods)
		};
	}
});
</script>
<style scoped lang="scss">
.login {
	width: 100%;
	height: 100%;
	background-color: #78bbff;
	display: flex;
	justify-content: center;
	align-items: center;
	.demo-ruleForm {
		background: #fff;
		width: 600px;
		padding: 30px;
		border-radius: 4px;

		.el-button--primary {
			margin: 0 auto;
			width: 40%;
		}
	}
}
</style>