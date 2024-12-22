<template>
    <header>
        <img src="../assets/logo-alpha.png" alt="Logo" class="logo" />
        <h1>查地址，上鹰眼查</h1>
    </header>
    <div class="search-bar">
        <input v-model="searchValue" type="text" placeholder="请输入地址" @keyup.enter="onSearch" />
        <button @click="onSearch">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search"
                viewBox="0 0 16 16">
                <path
                    d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zm-5.44 1.397a5.5 5.5 0 1 1 7.778-7.778 5.5 5.5 0 0 1-7.778 7.778z" />
            </svg>
        </button>
    </div>
    <div class="tags">
        <span v-for="tag in tags" :key="tag" class="tag">{{ tag }}</span>
    </div>
</template>
<script setup>
import { ref, defineModel, defineEmits } from 'vue';
const emit = defineEmits(['search']);
const searchValue = defineModel("searchValue")
console.log('--------')
console.log(searchValue);
const tags = ref([
    '# Phishing Scam',
    '# Token Mismatch',
    '# USDC Blacklisted',
    '# Black-Gray Market',
    '# Sanctions or Seizures',
    '# USDT Blacklisted',
    '# Fake wallet',
    '# Risk-202304195650'
]);

const onSearch = () => {
    emit('search', searchValue.value);
};
</script>

<style scoped>
.search-page {
    text-align: center;
    padding: 20px;
    background-image: url('../assets/bg.jpg');
    background-size: cover;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.logo {
    width: 150px;
    margin-bottom: 20px;
}

header h1 {
    font-size: 1.2em;
    margin-bottom: 20px;
}

.search-bar {
    display: flex;
    align-items: center;
    background: white;
    border-radius: 25px;
    padding: 10px 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.search-bar input {
    border: none;
    outline: none;
    flex: 1;
    padding: 10px;
    font-size: 1em;
}

.search-bar button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-left: 10px;
}

.tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}

.tag {
    background: #f0f0f0;
    border-radius: 15px;
    padding: 5px 10px;
    margin: 5px;
    font-size: 0.9em;
}
</style>