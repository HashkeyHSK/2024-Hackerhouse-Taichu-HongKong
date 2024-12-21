<template>
    <a-card v-if="props.data?.nodeInfo">
        <a-row>
            <a-typography-text strong>地址详情</a-typography-text>
            <a-typography-text copyable class="text-left">{{ props.data.nodeInfo?.address }}</a-typography-text>
        </a-row>
        <a-row>
            <a-col>
                <a-tag color="orange">中风险</a-tag>
                <a-rate disabled allow-half :value="3.3" />
            </a-col>
        </a-row>
        <a-row style="margin-top: 5px;">
            <a-col span="12">
                <a-typography-text class="one-line">TX 余额</a-typography-text>
                <a-typography-text class="value-text">{{ props.data.nodeInfo?.txCount }} TX</a-typography-text>
            </a-col>
            <a-col span="12">
                <a-typography-text class="one-line">代币余额</a-typography-text>
                <a-typography-text class="value-text">{{ props.data.nodeInfo?.value }} USDT</a-typography-text>
            </a-col>
        </a-row>
        <a-row>
            <a-col span="12">
                <a-typography-text class="one-line">累计转账手续费</a-typography-text>
                <a-typography-text class="value-text">{{ data.nodeInfo?.gasUsedSum }} USDT</a-typography-text>
            </a-col>
            <a-col span="12">
                <a-typography-text class="one-line">首次交易时间</a-typography-text>
                <a-typography-text class="value-text">{{ dayjs(data.nodeInfo?.firstTxTime).format('YYYY-MM-DD HH:mm:ss') }}</a-typography-text>
            </a-col>
        </a-row>
        <a-row>
            <a-typography-text strong>交易明细</a-typography-text>
        </a-row>
        <a-row style="margin: 10px 0;">
            <a-col span="24">
                <a-list :data-source="addressOverview" bordered>
                    <template #renderItem="{ item }">
                        <a-list-item class="list" style="padding: 12px 8px">
                            <a-typography-text class="value-text" style="color: red;">{{ item.label }}</a-typography-text>
                            <template #extra>
                                <a-typography-text class="address-item" style="font-size: 12px; width: 200px;" ellipsis>{{ item.address }}</a-typography-text>
                            </template>
                        </a-list-item>
                    </template>
                </a-list>
            </a-col>
        </a-row>
        <a-row>
            <a-col span="12">
                <a-typography-text class="value-text text-left">转入笔数</a-typography-text>
            </a-col>
            <a-col span="12">
                <a-typography-text class="value-text text-right">转出笔数</a-typography-text>
            </a-col>
        </a-row>
        <a-row>
            <a-col span="24">
                <a-progress :percent="100" :success="successPercent" :show-info="false"/>
            </a-col>
        </a-row>
    </a-card>
</template>

<script setup>
import { defineProps, computed } from 'vue';
import dayjs from 'dayjs';

const props = defineProps({
    data: Object,
});

console.log(props);
const successPercent = computed(() => ({
    percent: 50,
    success: {
        percent: 50
    }
}))

const addressOverview = computed(() => props.data.nodeEdges.map(edge => ({
    label: edge.from === props.data.nodeInfo?.address ? '转出' : '转入',
    address: edge.from === props.data.nodeInfo?.address ? edge.to : edge.from,
})));
</script>

<style scoped>
.ant-card {
    margin: 0;
    padding: 10px 0;
    height: calc(600px - 24px);
    overflow-y: auto;
}

.text-left {
    text-align: left;
}

.one-line {
    display: block;
    font-weight: bold;
    color: #999;
}

.value-text {
    font-size: 12px;
    word-break: keep-all;
    white-space: nowrap;
}

.address-item {
    max-width: 200px;
}

.text-left {
    text-align: left;
    display: block;
}

.text-right {
    text-align: right;
    display: block;
}

.list {
    overflow: hidden;
}
</style>