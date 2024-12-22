<template>
    <a-layout class="graph-layout" :has-sider="false">
        <a-spin :spinning="loading" tip="加载中..." class="loading-spin">
            <a-layout-header class="header">
                <a-form-item label="地址">
                    <a-input-search placeholder="搜索地址" class="input" :value="searchAddress" @search="onSearch" />
                </a-form-item>
            </a-layout-header>
            <a-layout has-sider class="content">
                <a-layout-sider class="sider" width="400" collapsible breakpoint="lg" collapsedWidth="0">
                    <a-spin :spinning="pannelLoading" tip="加载中..." class="loading-spin">
                        <div class="sidebar-content">
                            <address-detail v-if="renderMode === REDNER_MODE.ADDRESS && !pannelLoading" :data="detailData" />
                            <tracker-detail :data="detailData" v-else-if="!pannelLoading" />
                        </div>
                    </a-spin>
                </a-layout-sider>
                <a-layout>
                    <a-layout-content class="graph-content">
                        <div ref="graphContainer" class="graph-container"></div>
                    </a-layout-content>
                </a-layout>
            </a-layout>
        </a-spin>
    </a-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAddressTracker } from '../hook/use-address-tracker';
import AddressDetail from '../components/address-detail.vue';
import TrackerDetail from '../components/tracker-detail.vue';
import { REDNER_MODE } from '../config/constants.js';

const graphContainer = ref(null);

const {
    initGraph,
    onSearch,
    pannelLoading,
    renderMode,
    searchAddress,
    fetchAddressGraph,
    fetchAddressInfo,
    detailData,
    loading,
} = useAddressTracker(graphContainer);

onMounted(async () => {
    fetchAddressInfo(searchAddress.value);
    await fetchAddressGraph();
    initGraph();
});
</script>

<style scoped>
.graph-layout {
    width: 100%;
}

.header {
    background-color: #fff;
    width: 100%;
    border-bottom: 1px solid #e8e8e8;
}

.content {
    height: 610px;
}

.sidebar-header {
    padding: 16px;
    background-color: #fafafa;
    border-bottom: 1px solid #e8e8e8;
}

.sidebar-content {
    padding: 16px;
    width: 400px;
    height: 610px;
    box-sizing: border-box;
}

.graph-container {
    width: 100%;
    height: 100%;
}
</style>