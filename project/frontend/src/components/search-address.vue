<template>
    <div class="search-page">
        <search-result v-if="startSearch" v-model:searchValue="searchValue" />
        <search-index v-else :v-model:searchValue="searchValue" @search="onSearch" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import SearchIndex from './search-index.vue';
import SearchResult from './search-result.vue';

const searchValue = ref('0xf4b59f76657de77e008f8cb07f52148cfb591f');
const startSearch = ref(false);
const onSearch = (value) => {
    searchValue.value = value;
    startSearch.value = true;
};

</script>
<style scoped>
.search-page {
    text-align: center;
    padding: 20px;
    background-image: url('../assets/bg.jpg');
    background-size: cover;
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>