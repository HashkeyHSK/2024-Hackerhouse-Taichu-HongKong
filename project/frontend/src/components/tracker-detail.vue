<template>
    <a-card>
        <a-row>
            <a-typography-text strong>交易详情</a-typography-text>
        </a-row>
        <a-row>
            <a-col span="10">
                <a-typography-text copyable class="label">{{ props.data[0].from }}</a-typography-text>
            </a-col>
            <a-col span="4">
                <forward-outlined :style="{
                    fontSize: '40px',
                    color: 'green'
                }"/>
            </a-col>
            <a-col span="10">
                <a-typography-text copyable class="label">{{ props.data[0].to }}</a-typography-text>
            </a-col>
        </a-row>
        <a-row style="margin-top: 20px;">
            <a-typography-text strong>交易列表</a-typography-text>
        </a-row>
        <a-row style="margin: 10px 0;">
            <a-col span="24">
                <a-table class="label" :columns="addressOverview.columns" :data-source="addressOverview.data" row-key="id" :pagination="false"/>
            </a-col>
        </a-row>
    </a-card>
</template>

<script setup>
import { defineProps, computed } from 'vue';
import  dayjs from 'dayjs';
import { ForwardOutlined } from '@ant-design/icons-vue';

const props = defineProps({
    data: Object,
});

const addressOverview = computed(() => {
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
    ], data: props.data.map((item, index) => ({
        id: index,
        address: item.from,
        amount: item.txCount,
        timestamp: dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss'),
    }))};
})
</script>

<style scoped>
.ant-card {
    overflow-y: auto;
    padding: 10px 0;
    margin: 0;
    height: calc(600px - 24px);
}

.label {
    font-size: 12px;
}

.num {
    font-size: 10px;
    color: green;
}

.value-text {
    font-size: 12px;
    word-break: keep-all;
    white-space: nowrap;
}

.small-text {
    font-size: 12px;
}

.list {
    overflow: hidden;
}
</style>