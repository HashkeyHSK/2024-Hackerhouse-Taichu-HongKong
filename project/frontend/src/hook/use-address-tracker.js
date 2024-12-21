import { ref } from 'vue';
// import { mockData } from '../assets/data';
import { REDNER_MODE } from '../config/constants';
import { getRequest } from '../utils/request';

export function useAddressTracker(graphContainer, searchValue) {
    const isCollapsed = ref(false);
    const selectedNode = ref(null);
    const renderMode = ref(REDNER_MODE.ADDRESS);
    const loading = ref(false);
    const pannelLoading = ref(false);
    const listData = ref([]);
    const renderData = ref(null);
    const nodeDetailData = ref()
    const edgeDetailData = ref()


    // mock数据
    const searchAddress = ref(searchValue);

    const toggleSidebar = () => {
        isCollapsed.value = !isCollapsed.value;
    };

    const onSearch = (value) => {
        console.log('搜索地址:', value);
        // 在这里处理搜索逻辑
        fetchAddressGraph();
    };

    const initGraph = () => {
        // window.G6.registerNode('round-rect', {
        //     drawShape:(cfg, group) => {
        //         const shape = group.addShape('rect', {
        //             attr: {
        //                 x: -20,
        //                 y: -20,
        //                 width: 40,
        //                 height: 40,
        //                 radius: 10,
        //                 cursor: "pointer",
        //                 fill: "#EBEBEB",
        //                 stroke: "#3D3D3D",
        //                 lineWidth: 1
        //             }
        //         })
        //         console.log(cfg, group)
        //         return shape;
        //     },
        //     setState(name, value, edge) {
        //         console.log('setState', name, value, edge);
        //     },
        // })
        const graph = new window.G6.Graph({
            container: graphContainer.value,
            animate: true,
            modes: {
                default:
                    [
                        { "type": "drag-node", "onlyChangeComboSize": true, "selectedState": "isSelected" },
                        "node-click",
                        "canvas-click",
                        { "type": "zoom-canvas", "maxZoom": 5 },
                        "drag-canvas"
                    ]
            },
            layout: {
                type: 'gForce',
                linkDistance: 200,
            },
            enabledStack: false,
            defaultNode: {
                type: "round-rect",
                style: {
                    width: 20,
                    height: 20,
                    fill: '#eff5ff',
                    stroke: '#5f95ff',
                }
            },
            defaultEdge: {
                type: "quadratic",
                labelCfg: {
                    autoRotate: !0,
                    style: {
                        fill: "#929292",
                        fontSize: 12,
                        cursor: "pointer",
                        stroke: "#FFF",
                        lineWidth: 5
                    }
                }
            },
            edgeStateStyles: {
                highlightSelf: {
                    opacity: 1,
                    "text-shape": {
                        opacity: 1
                    }
                },
                darkSelf: {
                    opacity: 0.5,
                    "text-shape": {
                        opacity: 0.5
                    }
                }
            },
        });

        graph.edge((function(edge) {
            let color = "#DBDBDB";
            1 === edge.flowType ? color = "#2EAD65" : 2 === edge.flowType && (color = "#E35E5E");
            var n = 3 - edge.index;
            return (n < 0 || !n) && (n = 1),
            {
                style: {
                    endArrow: {
                        path: window.G6.Arrow.triangle(4, 4, 11.5),
                        lineWidth: 3
                    },
                    lineWidth: n,
                    cursor: "pointer",
                    stroke: color
                }
            }
        }));

        graph.data(renderData.value)
        // graph.data(mockData)
        graph.render();
        graph.fitView();
        graph.fitCenter();
        

        graph.on('node:click', async (evt) => {
            const nodeItem = evt.item;
            console.log('node:click', nodeItem)
            const { id } = nodeItem._cfg;
            
            await fetchAddressInfo(id);

            const headerAddress = document.querySelector('.header-address'); // 选择元素
            headerAddress.innerText = nodeItem._cfg.id;
            console.log('node:click  id', nodeItem._cfg.id)
            renderMode.value = REDNER_MODE.ADDRESS;
        });

        graph.on('edge:click', async (evt) => {
            const nodeItem = evt.item;
            console.log('edge:click', nodeItem)
            const { from, to } = nodeItem._cfg.model;
            
            await fetchEdgeInfo(from, to)
            renderMode.value = REDNER_MODE.TRACKER;
        });

        // 监听节点的 mouseenter 事件
        graph.on('node:mouseenter', (evt) => {
            const node = evt.item;
            // 高亮节点
            graph.updateItem(node, {
                style: {
                    fill: '#5f95ff',
                    stroke: '#eff5ff',
                },
            });
        });

        // 监听节点的 mouseleave 事件
        graph.on('node:mouseleave', (evt) => {
            const node = evt.item;
            // 取消高亮节点
            graph.updateItem(node, {
                style: {
                    fill: '#eff5ff',
                    stroke: '#5f95ff',
                },
            });
        });

        // 监听连线的 mouseenter 事件
        graph.on('edge:mouseenter', (evt) => {
            const edge = evt.item;
            // 高亮节点
            graph.updateItem(edge, {
                style: {
                    stroke: '#333',
                },
            });
        });

        // 监听连线的 mouseleave 事件
        graph.on('edge:mouseleave', (evt) => {
            const edge = evt.item;
            // 高亮节点
            graph.updateItem(edge, {
                style: {
                    stroke: '#CCCCCC',
                },
            });
        });
    };

    const fetchAddressGraph = async () => {
        try {
            loading.value = true;
            const { edges, nodes } = await getRequest('/address_graph', {
                address: searchAddress.value
            });

            renderData.value = {
                edges: edges.map(item => ({
                    ...item,
                    source: item.from,
                    target: item.to,
                    label: item.tag,
                })),
                nodes,
            };
            loading.value = false;

        } catch (e) {
            console.error(e);
        } finally {
            loading.value = false;
        }
    }

    const fetchAddressInfo = async (address) => {
        try {
            pannelLoading.value = true;
            const data = await getRequest('/address_info', {
                address,
            });

            nodeDetailData.value = data;

            console.log('==fetchAddressInfo==', data);

            pannelLoading.value = false;
        } catch (e) {
            pannelLoading.value = false;
            console.error(e);
        }
    }

    const fetchEdgeInfo = async (from, to) => {
        try {
            pannelLoading.value = true;
            const data = await getRequest('/edge_info', {
                from_address: from,
                to_address: to
            });

            edgeDetailData.value = data;

            pannelLoading.value = false;
        } catch (e) {
            pannelLoading.value = false;
            console.error(e);
        }
    }

    return {
        isCollapsed,
        selectedNode,
        loading,
        pannelLoading,
        toggleSidebar,
        listData,
        onSearch,
        initGraph,
        renderMode,
        searchAddress,
        nodeDetailData,
        edgeDetailData,
        fetchAddressGraph,
        fetchEdgeInfo,
        fetchAddressInfo,
    }
}