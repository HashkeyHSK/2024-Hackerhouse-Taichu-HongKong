<template>
  <div class="main-panel">
    
    <a-tabs v-model:activeKey="activeKey" @change="handleTabChange">
      <a-tab-pane tab="地址分析" key="A">
        <AddressTracker />
      </a-tab-pane>
      <!-- <a-tab-pane tab="交易图谱" key="B">
        <AddressTracker />
      </a-tab-pane>
      <a-tab-pane tab="NFT溯源" key="C">
        <AddressTracker />
      </a-tab-pane> -->
    </a-tabs>
  </div>

</template>

<script setup>
import AddressTracker from './components/address-tracker.vue'

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.main-panel {
  width: 1200px;
  margin: 0 auto;
}
</style>
