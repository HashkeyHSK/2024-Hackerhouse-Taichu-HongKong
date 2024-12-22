<template>
  <div id="app">
    <navbar />
    <router-view />
  </div>
</template>

<script setup>
import Navbar from './components/nav-bar.vue'
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>