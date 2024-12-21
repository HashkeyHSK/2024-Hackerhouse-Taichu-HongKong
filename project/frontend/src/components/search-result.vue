<template>
  <a-spin :spinning="loading" tip="加载中..." class="loading-spin">
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
    <a-card class="main-card">
      <div class="header">
        <div class="header-left">
          <a-avatar src="https://via.placeholder.com/40" />
          <div class="header-info">
            
            <div class="header-address">{{ searchValue }}</div>
          </div>
        </div>
        <a-button type="link">立即反馈</a-button>
      </div>
      <a-spin :spinning="pannelLoading" tip="加载中..." class="loading-spin">
        <a-row class="content">
          <a-col span="12">
            <a-card title="风险评分" extra="Beta" class="risk-card">
              <div class="risk-score" v-if="!loading">
                <div>
                    <a-progress 
                      type="dashboard" 
                      :percent="Math.floor(nodeDetailData?.nodeInfo.score)" 
                      status="active"
                      :strokeColor="getStrokeColor(nodeDetailData?.nodeInfo.score)"
                      :showInfo="false" 
                    />
                  </div>
                <div class="score">{{ nodeDetailData?.nodeInfo.score }}</div>
                <div class="tags-row">
                  <a-tag v-for="(tag, index) in tags" :key="index" :color="randomColor()">{{ tag }}</a-tag>
                </div>
              </div>
            </a-card>
          </a-col>
          <a-col span="12">
            <a-card title="链上数据" class="risk-card calc-card">
              <div class="scroll-list" v-if="renderMode === REDNER_MODE.ADDRESS">
                <a-row style="margin-top: 15px;">
                  <a-col span="12">
                    <a-typography-text class="one-line">TRX 余额</a-typography-text>
                    <a-typography-text class="value-text">{{ nodeDetailData?.nodeInfo?.txCount }} TRX</a-typography-text>
                  </a-col>
                  <a-col span="12">
                    <a-typography-text class="one-line">代币余额</a-typography-text>
                    <a-typography-text class="value-text">{{ nodeDetailData?.nodeInfo?.value }} HSK</a-typography-text>
                  </a-col>
                </a-row>
                <a-row style="margin-top: 5px;">
                  <a-col span="12">
                    <a-typography-text class="one-line">累计转账手续费</a-typography-text>
                    <a-typography-text class="value-text">{{ nodeDetailData?.nodeInfo?.gasUsedSum }}
                      HSK</a-typography-text>
                  </a-col>
                  <a-col span="12">
                    <a-typography-text class="one-line">首次交易时间</a-typography-text>
                    <a-typography-text class="value-text">{{
                      dayjs(nodeDetailData?.nodeInfo?.firstTxTime).format('YYYY-MM-DD HH:mm:ss') }}</a-typography-text>
                  </a-col>
                </a-row>
                <a-row style="margin-top: 5px;">
                  <a-col span="12">
                    <a-typography-text class="one-line">代币类型</a-typography-text>
                    <a-typography-text class="value-text">{{ nodeDetailData?.nodeInfo?.tokenType }}</a-typography-text>
                  </a-col>
                  <a-col span="12">
                    <a-typography-text class="one-line">地址转账次数</a-typography-text>
                    <a-typography-text class="value-text">{{ nodeDetailData?.nodeInfo?.txOuterAddressCount
                      }}</a-typography-text>
                  </a-col>
                </a-row>
              </div>
              <div class="scroll-list" v-else>
                <a-table class="label" :columns="edgeTableData.columns" :data-source="edgeTableData.data" row-key="id"
                  :pagination="false" />
              </div>

            </a-card>
          </a-col>
        </a-row>
      </a-spin>

      <div ref="graphContainer" class="graph-container"></div>
    </a-card>
  </a-spin>
</template>
<script setup>
import { ref, onMounted, defineModel, computed } from 'vue';
import { useAddressTracker } from '../hook/use-address-tracker';
import { REDNER_MODE } from '../config/constants.js';
import dayjs from 'dayjs';

const graphContainer = ref(null);
const searchValue = defineModel('searchValue')

const {
  initGraph,
  onSearch,
  pannelLoading,
  renderMode,
  searchAddress,
  fetchAddressGraph,
  fetchAddressInfo,
  nodeDetailData,
  edgeDetailData,
  loading,
} = useAddressTracker(graphContainer, searchValue.value);

onMounted(async () => {
  fetchAddressInfo(searchAddress.value);
  await fetchAddressGraph();
  initGraph();
});

const edgeTableData = computed(() => {
  return {
    columns: [
      {
        title: '地址',
        dataIndex: 'address',
        key: 'address',
        ellipsis: true,
      },
      {
        title: '转出数量',
        dataIndex: 'amount',
        key: 'amount',
      },
      {
        title: '转出时间',
        dataIndex: 'timestamp',
        key: 'timestamp',
        ellipsis: true,
      },
    ], data: edgeDetailData.value?.map((item, index) => ({
      id: index,
      address: item.from,
      amount: item.txCount,
      timestamp: dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss'),
    }))
  };
})

const tags = computed(() => nodeDetailData.value?.nodeInfo?.tag.split(';'));

const randomColor = () => {
  const colors = ['pink', 'red', 'orange', 'green', 'cyan', 'blue', 'purple'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  return randomColor;
}
</script>

<script>
export default {
  methods: {
    // 根据分数返回颜色
    getStrokeColor(score) {
      if (score <= 30) {
        return "#4CAF50"; // 低风险 - 绿色
      } else if (score <= 70) {
        return "#FFC107"; // 中风险 - 黄色
      } else {
        return "#F44336"; // 高风险 - 红色
      }
    },
  },
};

</script>

<style scoped>
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

.value-text {
  font-size: 12px;
  word-break: keep-all;
  white-space: nowrap;
}

.search-bar button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: 10px;
}

.main-card {
  margin-top: 20px;
  width: 1000px
}

.risk-card {
  height: 250px;
}

.one-line {
  display: block;
  font-weight: bold;
  color: #999;
}

.scroll-list {
  overflow-y: auto;
  height: 180px;
}

.text-left {
  text-align: left;
  display: block;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-info {
  margin-left: 10px;
}

.header-title {
  font-size: 18px;
  text-align: left;
  font-weight: bold;
}

.header-address {
  color: #888;
}

.calc-card ::v-deep .ant-card-body {
  padding: 0;
}

.overview {
  margin-top: 20px;
  height: 400px;
}

.risk-score {
  text-align: center;
}

.score {
  font-size: 24px;
  font-weight: bold;
  margin-top: -20px;
  transform: translate(0, -50px);
}

.tags-row {
  transform: translate(0, -10px);
}

.graph-container {
  width: 100%;
  height: 400px;
  margin-top: 20px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
  border-radius: 5px;
}

.list-item {
  display: flex;
  padding: 10px 10px;
  justify-content: space-between;
}

.list-item+.list-item {
  border-top: 1px solid #e8e8e8;
}
</style>