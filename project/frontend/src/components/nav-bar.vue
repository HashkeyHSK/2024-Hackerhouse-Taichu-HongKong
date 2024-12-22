<template>
    <nav class="navbar">
        <div class="navbar-mid-container">
            <div class="logo">
                <img src="../assets/logo.jpg" alt="Bitrace Logo" />
            </div>
            <ul class="menu">
                <li><a href="#" @click="goToHome">主页</a></li>
                <li class="more">
                    <a href="#">产品和服务</a>
                    <ul class="dropdown">
                        <li @click="goToTracker"><a href="#">TrustLink</a>
                            <p>区块链风险监控和管理平台</p>
                        </li>
                        <li class="disable"><a href="#">VIP Pro</a>
                            <p>协作式加密追踪和分析平台</p>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>

    </nav>

</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
const goToHome = () => {
    router.push('/');
}
const goToTracker = () => {
    router.push('/tracker');
}
</script>

<style scoped>
.navbar {
    padding: 20px;
    background-color: #fff;
    border-bottom: 1px solid #ddd;
    position: relative;
    z-index: 999;
}

.navbar-mid-container {
    display: flex;
    align-items: center;
    width: 1200px;
    margin: 0 auto;
}

ul {
    margin-bottom: 0;
}

.logo img {
    height: 50px;
}

.menu {
    list-style: none;
    display: flex;
    margin: 0;
    padding: 0;
    gap: 1rem;
    margin-left: 40px;
}

.menu li {
    position: relative;
}

.menu li a {
    display: block;
    padding: 0.5rem 1rem;
    text-decoration: none;
    color: #333;
    font-weight: bold;
}

.dropdown li:not(.disable):hover {
    cursor: pointer;
    background-color: #f9f9f9;
}

.dropdown li p {
    text-align: left;
}

.menu li:not(.disable):hover>a {
    color: #007BFF;
}

.dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    display: none;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 0 0 5px 5px;
    width: 400px;
}

.disable {
    background-color: #eee;
}

.dropdown li {
    width: 100%;
    list-style: none;
    padding-left: 10px;
    + li {
        border-top: 1px solid #f1f1f1;
    }
}

.dropdown li a {
    padding: 0.5rem 10px;
    white-space: nowrap;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.dropdown li p {
    margin: 0;
    padding: 0.5rem 10px;
    color: #999;
    font-size: 0.9em;
}

.menu .more:hover .dropdown {
    display: block;
    padding-left: 0;
}

.menu .more > a::after {
  content: '';
  display: inline-block;
  margin-left: 5px;
  margin-bottom: 3px;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #333;
  transition: transform 0.3s;
}

.menu li:hover > a::after {
    border-top: 5px solid #007BFF;
  transform: rotate(180deg);
}
</style>