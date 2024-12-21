import { createApp } from 'vue';
import App from './app.vue';
import Antd from 'ant-design-vue';
import router from './router';
import 'ant-design-vue/es/style/reset.css';

const app = createApp(App);

app.use(Antd); // 使用 antdv 插件
app.use(router);

app.mount('#app');