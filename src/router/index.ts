import { createRouter, createWebHashHistory, RouteRecordRaw, RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import Login from '@/views/login.vue';
import ToolsList from '@/views/toolsList.vue'
import UploadRecord from '@/views/uploadRecord.vue'
const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'login',
        component: Login,
        meta: {
            breadcrumb: [],
            parent: '登录'
        }
    },
    {
        path: '/tools_list',
        name: 'toolsList',
        component: ToolsList,
        meta: {
            breadcrumb: [],
            parent: '工具列表'
        }
    },
    {
        path: '/upload_record',
        name: 'uploadRecord',
        component: UploadRecord,
        meta: {
            breadcrumb: [],
            parent: '工具列表'
        }
    },
]
const router = createRouter({
    history: createWebHashHistory(),
    scrollBehavior(to, from, savedPosition) {
        //切换路由 始终滚动到顶部
        return { top: 0 }
    },
    routes
});

const canUserAccess = async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    next()
};
router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    return await canUserAccess(to, from, next);
});

export default router