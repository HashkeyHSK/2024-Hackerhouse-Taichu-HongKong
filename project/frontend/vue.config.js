const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://43.154.186.250:5000',// 要跨域的域名
        changeOrigin: true, // 是否开启跨域
      },
    }
  }
})
