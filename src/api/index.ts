import axios from 'axios';
import router from '@/router/index'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL as string;
axios.defaults.timeout = 3000000;
axios.interceptors.request.use((config: any) => {
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers.token = token;
    }
    return config;
}, error => {
    return Promise.reject(error).then(
        () => { },
        (reason) => {
            if (reason?.status == 403 || reason?.status == 401) {
                router.push({ path: '/' });
            }
        }
    );
});

axios.interceptors.response.use((response: any) => {
    if (response.data?.code == -1) {
        return Promise.reject(response.data);
    }
    if (response.request?.responseType == 'arraybuffer') {
        return response
    } else {
        return response.statusText ? response.data : response
    }
}, error => {
    if (error?.response?.status == 403 || error?.response?.status == 401) {
        router.push({ path: '/' });
    }
    return Promise.reject(error);
});

export default axios;