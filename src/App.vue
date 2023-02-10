<template>
  <el-config-provider :locale="locale">
    <div id="nav">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </el-config-provider>
</template>
<script  lang="ts">
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/lib/locale/lang/zh-cn';
import { defineComponent } from 'vue';

export default defineComponent({
	components: {
		[ElConfigProvider.name]: ElConfigProvider
	},
	setup() {
		return {
			locale: zhCn
		};
	}
});
</script>

<style  lang="scss">
#nav {
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0px;
	bottom: 0px;
	left: 0;
	right: 0;
	.fade-enter-active,
	.fade-leave-active {
		transition: all 0.2s ease;
	}

	.fade-enter,
	.fade-leave-active {
		opacity: 0;
	}
}
</style>
