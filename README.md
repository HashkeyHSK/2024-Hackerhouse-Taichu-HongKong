# TrustLink

## Overview
Designed to help blockchain entrepreneurs and investors avoid risk and ensure compliance. Our mission is to serve 10,000 Web3 organizations and 100,000 cryptocurrency investors over the next decade by lowering the compliance barrier to entry. Through our flagship product, TrustLink, we provide cutting-edge technology services such as holographic on-chain monitoring, AI risk assessment, adaptive early warning, natural language query, and project precision airdrop to provide real-time data analysis and security compliance support for project parties on HashKey Chain.

## Tech Stack
- Frontend: VUE, HTML, JS
- Backend: Python
- Other: postgresql

## Demo
- Demo Video: https://youtu.be/HKVW9Kb6ZPw
- Project Deck: https://drive.google.com/drive/folders/1kfUQ_mjtFe6p2mpAI2Q_5EW1_0_ncWqG

## Team
- Tan Shuilian - CEO,used to work in Tencent web3 department, responsible for data, algorithm, wallet and other businesses.
- Sheng Hui - CTO,used to work for Tencent and OKX, responsible for public chain development.
- Jerry Zh - CMO,worked at Cloud Coin Exchange, the largest digital currency exchange in China, where he was responsible for operations.
- Archie - CPO,worked in Tencent's risk control department as a senior engineer; worked as a data investment research analyst at Banyan Tree Capital.
- Adam CDO, worked in Tencent web3 department, responsible for backend and data development. He is very talented in data governance and analytics.
- Wolf - worked at Firecoin, responsible for operations and key account business, as a founder of the Vbit exchange. He is currently working in a security investigation company and has made significant contributions to web3 industry crimes in cooperation with domestic police.


# Project setup

### geth节点部署
- clone脚本
```bash
git clone https://github.com/alt-research/opstack-fullnode-sync.git
```

### 修改.env
```
## geth image
GETH_IMAGE=us-docker.pkg.dev/oplabs-tools-artifacts/images/op-geth:v1.101315.2
## l1 rpc url
## node image
NODE_IMAGE=us-docker.pkg.dev/oplabs-tools-artifacts/images/op-node:v1.7.7
L1_RPC=https://ethereum-sepolia-rpc.publicnode.com

## l1 rpc kind(standard/basic/quicknode/alchemy/erigon)
## https://docs.optimism.io/builders/node-operators/tutorials/node-from-docker
L1_RPC_KIND=standard

## node libp2p bootnodes
P2P_STATIC="/dns/hashkeychain-testnet-sequencer-node-p2p.altlayer.network/tcp/9003/p2p/16Uiu2HAmUSM5U3LBW6DfFRV6g1JHZ5un27XcCTkDB69MzksmyMTh,/dns/hashkeychain-testnet-0-p2p.altlayer.network/tcp/9003/p2p/16Uiu2HAmSTbcZKAk3y11HGdVJuvWQD6de6Y6JJ5Cbx4GqdaQRjt4"

## rollup config file url link
ROLLUP_CONFIG_URL="https://operator-public.s3.us-west-2.amazonaws.com/hashkeychain/testnet/rollup.json"

## tx forward endpoint
SEQUENCER_HTTP=http://hashkeychain-testnet.alt.technology/

## op-l2 geth bootnodes
BOOTNODES="enode://43b4bce4f2234d735a39224b1dabb4fe17e852a442cfa5eb0e616c070593b87e5c75d25176064ad616224b45b726749ece551e7cecc00405891b38842e5ff29c@hashkeychain-testnet-sequencer-geth-p2p.altlayer.network:30303,enode://ff7dabb4344bfbd58e04356ef89d3ba5bd9e727257995edd1ac66518feb6090cd1394064fea4404ba6d1698d44f2cdec766bc92568f432a1fee4842769227386@hashkeychain-testnet-0-p2p.altlayer.network:30303"

## genesis file url link
GENESIS_URL="https://operator-public.s3.us-west-2.amazonaws.com/hashkeychain/testnet/genesis.json"

## sync mode(full or snap)
SYNC_MODE=full

## gc mode(archive or full)
GC_MODE=archive

## plasma enabled(true or false)
PLASMA_ENABLED=false

## plasma da server url
PLASMA_DA_SERVER=

## beacon url
L1_BEACON=""
```
## 生成jwt.txt
```bash
openssl rand -hex 32 > jwt.txt
```

## 运行脚本
```bash
docker compose --env-file ./env up -d
```


## blockscout部署
- clone代码
```bash
git clone https://github.com/blockscout/blockscout.git
​```
```

- 修改geth.yml配置文件 
```bash
路径：docker-compose/geth.yml
在backend添加环境变量（注意ws的端口必须是8546，因为geth的部署脚本上面设置public的是8546）
environment:
    ETHEREUM_JSONRPC_VARIANT: 'geth'
    ETHEREUM_JSONRPC_HTTP_URL: http://host.docker.internal:8545/
    ETHEREUM_JSONRPC_TRACE_URL: http://host.docker.internal:8545/
    ETHEREUM_JSONRPC_WS_URL: ws://host.docker.internal:8546/
```

```bash​
ETHEREUM_JSONRPC_VARIANT：设置节点的客户端
ETHEREUM_JSONRPC_HTTP_URL：设置http-RPC的地址
ETHEREUM_JSONRPC_TRACE_URL：同上
ETHEREUM_JSONRPC_WS_URL：同上
修改backend.yml配置文件
路径：docker-compose/services/backend.yml
修改extra_hosts，这是用来设置host.docker.internal的值，docker容器内访问外部网络（宿主机或者其它）会用这个域名，这里我们需要设置成节点的服务器，由于节点和浏览器的内网在同一个网段所以设置了内网的IP。
设置backend的部分
extra_hosts:
      - 'host.docker.internal:10.3.8.4'
​
db.yml中数据库的密码修改（非必须，可选）它有一个默认密码，建议可以不用动。
如果修改了数据库的密码，其它yaml的配置文件都需要对应的修改过去。
修user-ops-indexer.yml的配置文件
路径：docker-compose/services/user-ops-indexer.yml
修改extra_hosts，这是用来设置host.docker.internal的值，docker容器内访问外部网络（宿主机或者其它）会用这个域名，这里我们需要设置成节点的服务器，由于节点和浏览器的内网在同一个网段所以设置了内网的IP。
设置user-ops-indexer里面的变量
extra_hosts:
  - 'host.docker.internal:10.3.8.4'
​
修改environment的USER_OPS_INDEXER__INDEXER__RPC_URL的ws端口，这个环境变量原本的端口是8545，需要改成8546 。
  environment:
    - USER_OPS_INDEXER__INDEXER__RPC_URL=${USER_OPS_INDEXER__INDEXER__RPC_URL:-ws://host.docker.internal:8546/}
    - USER_OPS_INDEXER__DATABASE__CONNECT__URL=${USER_OPS_INDEXER__DATABASE__CONNECT__URL:-postgresql://blockscout:ceWb1MeLBEeOIfk65gU9EjF9@db:5432/blockscout}
    - USER_OPS_INDEXER__DATABASE__RUN_MIGRATIONS=true
​
修改common-blockscout.env的环境变量配置文件
路径：docker-compose/envs/common-blockscout.env
需要设置的环境变量有：NETWORK，SUBNETWORK，CHAIN_ID
NETWORK=133
SUBNETWORK=HashKey Chain Testnet
CHAIN_ID=133
修改common-frontend.env的环境变量配置文件
路径：docker-compose/envs/common-frontend.env
这个配置文件注意是用来配置前端的一些信息的。
NEXT_PUBLIC_API_HOST，前端API的地址，设置成blocksout所部署的主机的公网IP
例如：
NEXT_PUBLIC_API_HOST=localhost
修改为：
NEXT_PUBLIC_API_HOST=43.153.220.136
​
NEXT_PUBLIC_STATS_API_HOST，前端静态资源的地址，设置成blocksout所部署的主机的公网IP。
例如：
NEXT_PUBLIC_STATS_API_HOST=http://localhost:8080
修改为：
NEXT_PUBLIC_STATS_API_HOST=http://43.153.220.136:8080
​
NEXT_PUBLIC_NETWORK_NAME和NEXT_PUBLIC_NETWORK_SHORT_NAME设置的是前端显示chain的名称，都设置成HashKey Chain Testnet就行。
NEXT_PUBLIC_NETWORK_ID是网络号，设置成133
NEXT_PUBLIC_NETWORK_CURRENCY_NAME和NEXT_PUBLIC_NETWORK_CURRENCY_SYMBOL设置的是代币的名称，这里都设置成HSK就行。
NEXT_PUBLIC_APP_HOST设置的是blockscout中app的服务端IP，这里设置成blocksout所部署的主机的公网IP。
NEXT_PUBLIC_VISUALIZE_API_HOST设置成blocksout所部署的主机的公网IP。
例如：
NEXT_PUBLIC_VISUALIZE_API_HOST=http://localhost:8081
改为：
NEXT_PUBLIC_VISUALIZE_API_HOST=http://43.153.220.136:8081
​
启动blockscout
进入到geth.yml配置文件所在的路径
cd docker-compose
​
启动docker容器
docker compose -f ./geth.yml up 
```


## Frontend
```
cd project/frontend
pnpm install
```

### Compiles and hot-reloads for development
```
pnpm run serve
```

## Backend
```
cd project/backend
python app.py
```

## visit
http://127.0.0.1:8081/