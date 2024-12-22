<template>
    <div class="main-content">
        <section class="index-section">
            <div class="section-content">
                <h1>加强区块链风险管理与合规性</h1>
                <p>利用人工智能和大数据技术，更准确、更高效地识别、监测和调查区块链上的风险和犯罪活动.</p>
            </div>
        </section>
        <section class="second-section">
            <div class="section-content">
                <div class="left">
                    <h1>推动 Web3 合规性和数据信任</h1>
                </div>
                <div class="right">
                    <div class="stat">
                        <h2>追回损失</h2>
                    </div>
                    <div class="stat">
                        <h2>支持加密案件</h2>
                    </div>
                    <div class="stat">
                        <h2>客户信赖</h2>
                    </div>
                    <div class="stat">
                        <h2>风险基金监测</h2>
                    </div>
                </div>
            </div>
        </section>
        <section class="start-section">
            <div class="section-content">
                <div class="title">Get started easily</div>
                <div class="card-container">
                    <div class="card disable">
                        <h3>协作式加密追踪和分析平台</h3>
                        <p>通过快速了解犯罪模式，实现更快、更准确的调查、追踪资金动向、识别异常情况并发现新线索。</p>
                        <div class="get-started">
                            <a>快速开始</a>
                        </div>
                    </div>
                    <div class="card">
                        <h3>TrustLink</h3>
                        <p>区块链风险监控和管理平台</p>
                        <div class="get-started" @click="gotoTracker">
                            <a href="#">快速开始</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="start-section">
            <div class="section-content">
                <div class="title">团队成员</div>
                <div class="card-container">
                    <div class="card disable">
                        <h3>谭水莲</h3>
                        <p>CEO</p>
                        <p>曾就职腾讯web3部门，负责数据、算法、钱包等业务。后在 HahsKey Global 任职，负责韩、日市场拓展工作。同时打理一个2500＋人的投资者付费社区，从技术到市场，到内容输出、IP 打造、社区运营皆有丰富的成功经验。</p>
                    </div>
                    <div class="card">
                        <h3>盛辉</h3>
                        <p>CTO</p>
                        <p>曾就职腾讯、OKX，负责公链开发。同时也是一名技术内容博主，所写技术文章多次被区块链媒体转载。</p>
                    </div>
                    <div class="card">
                        <h3>Jerry Zhang</h3>
                        <p>CMO</p>
                        <p>曾就职国内最大的数字货币交易所——云币交易所，负责运营工作。在区块链领域已工作 8 年，有着丰富的人脉与经验。</p>
                    </div>
                    <div class="card">
                        <h3>Archie</h3>
                        <p>CPO</p>
                        <p>曾就职腾讯风控部门，担任高级工程师；在高榕资本担任数据投研分析师，在数据安全风控领域有着极高的造诣。</p>
                    </div>
                    <div class="card">
                        <h3>Adam</h3>
                        <p>CDO</p>
                        <p>曾就职腾讯 web3部门，负责后端与数据开发。在数据治理与分析方面有着极高的天赋。</p>
                    </div>
                </div>
            </div>
        </section> 

        <section class="start-section">
            <div class="section-content">
                <div class="title">关于</div>
                    <div class="card disable">
                        <h3>链之信</h3>
                        <p>链之信(hashkey.xin)是一家专注于Web3安全合规的科技公司，旨在帮助区块链创业者和投资者规避风险并确保合规性。我们的使命是在未来十年内服务一万个Web3组织和十万名加密货币投资者，降低合规准入门槛。通过我们的旗舰产品鹰眼查，我们提供全息链上监控、AI风险评估、自适应预警、自然语言查询和项目精准空投等前沿技术服务，为HashKey Chain上的项目方提供实时数据分析和安全合规支持</p>

                    </div>
            </div>
        </section>       
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
const gotoTracker = () => {
    router.push('/tracker');
}
</script>

<style scoped>
.main-content {
    text-align: center;
}

.index-section {
    background: url('../assets/banner1.png') no-repeat center center;
    height: 400px;
    background-size: auto;
}

.second-section {
    background-color: #000;
    color: #fff;
}

.second-section .section-content {
    display: flex;
    padding: 20px;
}

.index-section h1 {
    font-size: 40px;
    width: 400px;
    margin-left: 60px;
    margin-top: 100px;
}

.index-section p {
    width: 400px;
    margin-left: 60px;
}

.section-content {
    width: 1200px;
    overflow: hidden;
    margin: 0 auto;
}

p {
    font-size: 1rem;
    margin-bottom: 2rem;
}

.demo-button {
    padding: 0.5rem 1rem;
    border: 1px solid #000;
    background-color: #fff;
    cursor: pointer;
    border-radius: 4px;
}

.second-section {
    .left {
        flex: 1;
        display: flex;
        align-items: center;
    }

    .right {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .stat {
        border: 1px solid #fff;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
    }

    h1 {
        font-size: 2em;
    }

    h2 {
        font-size: 1.5em;
        margin: 0;
    }

    p {
        margin: 0;
    }
}

.start-section {
    background-color: #f9f9f9;
    padding: 40px 0;

    .title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 20px;
    }

    .card-container {
        display: flex;
        gap: 20px;
    }

    .card {
        background-color: #000;
        color: #fff;
        padding: 20px;
        border-radius: 10px;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .card h3 {
        margin-top: 0;
    }

    .card p {
        flex-grow: 1;
    }

    .card img {
        max-width: 100%;
        border-radius: 10px;
    }

    .get-started {
        text-align: right;
        margin-top: 20px;
    }

    .get-started a {
        color: #fff;
        text-decoration: none;
        background-color: #007bff;
        padding: 10px 20px;
        border-radius: 5px;
    }
    .disable {
        background-color: #333;
        cursor: not-allowed;
        .get-started a {
            color: #fff;
            cursor: not-allowed;
            text-decoration: none;
            background-color: #555;
            padding: 10px 20px;
            border-radius: 5px;
        }
    }
}
</style>