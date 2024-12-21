import pandas as pd
import urllib, json
import random
from sqlalchemy import create_engine

class DataFetcher():
    def __init__(self):
        self.grdata_engine = create_engine('postgresql://blockscout:{pw}@43.153.220.136:7432/blockscout'.format(pw=urllib.parse.quote_plus('ceWb1MeLBEeOIfk65gU9EjF9')))
        self.lableChineseMap = {
            "blacklist_doubt":"合约黑名单",
            "blackmail_activities":"敲诈勒索",
            "cybercrime":"网络犯罪",
            "darkweb_transactions":"暗网交易",
            "fake_kyc":"伪造KYC",
            "fake_standard_interface":"合约不符合标准",
            "honeypot_related_address":"蜜罐地址",
            "malicious_mining_activities":"恶意挖矿",
            "mixer":"混币地址",
            "money_laundering":"地址涉洗钱",
            "financial_crime":"金融犯罪",
            "stealing_attack":"盗窃攻击",
            "sanctioned":"地址受制裁",
            "phishing_activities":"网络钓鱼",
            "fake_token":"代币假冒品。",
            "financial_crime":"金融犯罪",
            "reinit":"合约风向",
            "anti_whale_modifiable":"合约最大持仓",
            "can_take_back_ownership":"权限可被回收",
            "external_call":"合约调函数",
            "hidden_owner":"合约隐藏所有者",
            "honeypot":"恶意代码",
            "slippage_modifiable":"合约滑点可修改",
            "anti_whale":"限制金额",
            "not_open_source":"合约未开源",
        }

    def fetch_address_graph_bak(self, address):
        """
        模拟区块链数据查询，返回与地址相关的交互关系。
        在实际场景中，可以通过区块链 API（例如 Etherscan, TronGrid）获取数据。
        """
        # 模拟返回数据，实际项目中替换为链上数据查询逻辑
        nodes = [
            {"id": "Address_0", "label": "Current User", "group": "main"},
            {"id": "Address_1", "label": "User A", "group": "user"},
            {"id": "Address_2", "label": "User B", "group": "user"},
            {"id": "Address_3", "label": "User C", "group": "user"},
        ]

        edges = [
            {"from": "Address_0", "to": "Address_1", "value": 1, "label": "交易次数：100"},
            {"from": "Address_1", "to": "Address_2", "value": 1, "label": "交易次数：1200"},
            {"from": "Address_2", "to": "Address_3", "value": 1, "label": "交易次数：300"},
        ]

        return {"nodes": nodes, "edges": edges}

    def fetch_node_balances_info(self, address):
        """ 获取节点信息
        """
        #获取节点余额信息
       #获取节点余额信息
        sql = f"""
            select  '0x' || ENCODE(address_hash, 'hex') as address, 
                    value / 10e18 as value, token_type, value_fetched_at, 
                    '0x' || ENCODE(address_hash, 'hex') as token_contract_address_hash
                    from public.address_token_balances where '0x' || ENCODE(address_hash, 'hex')='{address}' order by value_fetched_at desc limit 1
        """
        df = pd.read_sql_query(sql, self.grdata_engine)

        tag_sql = f"""
            select t2.tag_id, t2.label from 
            (select tag_id from public.address_to_tags_mock where '0x' || ENCODE(address_hash, 'hex')='{address}') t1 left outer join (select id as tag_id, label from public.address_tags_mock) t2 on t1.tag_id=t2.tag_id where t2.tag_id is not null
        """
        tag_df = pd.read_sql_query(tag_sql, self.grdata_engine)
        tag_str = ''
        if tag_df.shape[0]==0:
            tag_str = '风险未知'
        else:
            for item in tag_df.itertuples(index=False):
                tag_str += self.lableChineseMap[item.label] + ';'

        result = json.loads(df.to_json(orient='records'))
        if len(result)>0:
            result[0]['tag'] = tag_str.strip(';')
            if '金融犯罪' in tag_str or '盗窃' in tag_str:
                result[0]['score'] = 100
            elif '风险未知' in tag_str:
                result[0]['score'] = 0
            else:
                result[0]['score'] = random.randint(0, 90)
            return result[0]
        else:
            return {'address':address, 'first_tx_time':0, 'gas_used_sum':0, 'last_tx_time':0, 'score':0, 'tag':'风险未知', 'token_contract_address_hash':'', 'token_type':'ERC-20', 'tx_count':0, 'tx_outer_address_count':0, 'value':0, 'value_fetched_at':0}

    def fetch_node_txs_info(self, address):
        """ 获取地址交易信息
        """
        sql = f"""
    select 
        min(updated_at) as first_tx_time, 
        max(updated_at) as last_tx_time,
        count(*) as tx_count,
        count(distinct to_address_hash) as tx_outer_address_count,
        sum(gas_used * gas_price) / 10e18 as gas_used_sum
    
        from public.transactions where '0x' || ENCODE(from_address_hash, 'hex')='{address}' group by from_address_hash
"""
        df = pd.read_sql_query(sql, self.grdata_engine)
        result = json.loads(df.to_json(orient='records'))
        return result[0] if len(result)>0 else {'first_tx_time':0, 'last_tx_time':0, 'tx_count':0, 'tx_outer_address_count':0, 'gas_used_sum':0}

    def fetch_node_all_edges(self, address):
        """ 获取节点所有的边
        """
        sql = f"""
                    select distinct '0x' || ENCODE(from_address_hash, 'hex') as from_address, '0x' || ENCODE(to_address_hash, 'hex') as to_address                
                    from public.transactions where '0x' || ENCODE(from_address_hash, 'hex')='{address}' OR '0x' || ENCODE(to_address_hash, 'hex')='{address}' limit 100
    """
        df = pd.read_sql_query(sql, self.grdata_engine)
        df = df.fillna("NULL")
        edges = df.apply(lambda row: {"from": row["from_address"], "to": row["to_address"], "value":1}, axis=1).tolist()

        return edges

    def fetch_node_edge_info(self, from_address, to_address):
        """ 获取from 和 to 两个地址的交易信息
        """
        sql = f"""
                    select  '0x' || ENCODE(from_address_hash, 'hex') as from_address, 
                            '0x' || ENCODE(to_address_hash, 'hex') as to_address,
                            count(*) as tx_count,
                            sum(value) / 10e18 as value_sum,
                            min(updated_at) as first_tx_time, 
                            max(updated_at) as last_tx_time,
                            FLOOR(random() * 100 + 1) AS score,
                            case WHEN RIGHT(ENCODE(from_address_hash, 'hex'), 1) ~ '[0-2]' THEN '网络犯罪'
                            WHEN RIGHT(ENCODE(from_address_hash, 'hex'), 1) ~ '[3-5]' THEN '洗钱交易'
                            WHEN RIGHT(ENCODE(from_address_hash, 'hex'), 1) ~ '[6-8]' THEN '盗窃攻击'
                            WHEN RIGHT(ENCODE(from_address_hash, 'hex'), 1) ~ '[9-b]' THEN '可疑交易'
                            WHEN RIGHT(ENCODE(from_address_hash, 'hex'), 1) ~ '[c-f]' THEN '盗窃攻击'
                            
                            ELSE '其他交易' end as tag
                            
                    from public.transactions where '0x' || ENCODE(from_address_hash, 'hex')='{from_address}' AND '0x' || ENCODE(to_address_hash, 'hex')='{to_address}' group by from_address_hash, to_address_hash
    """
        df = pd.read_sql_query(sql, self.grdata_engine)
        df = df.fillna("NULL")
        edges = df.apply(lambda row: {"from": row["from_address"], "to": row["to_address"], "tx_count":row['tx_count'], "value_sum": row['value_sum'], 'first_tx_time':row['first_tx_time'], 'last_tx_time':row['last_tx_time'], 'score':random.randint(1, 100)}, axis=1).tolist()
        return edges[0] if len(edges)>0 else {'from':from_address, "to":to_address, "tx_count":1, "value_sum":0, "first_tx_time":0, "last_tx_time":0, 'score':0, 'tag':'其他交易'}


    def fetch_address_info(self, address):
        """ 获取地址信息汇总的接口
        """
        node_balance = self.fetch_node_balances_info(address)
        node_txs = self.fetch_node_txs_info(address)
        edges = self.fetch_node_all_edges(address)

        address_node_info = node_balance | node_txs

        return {"node_info": address_node_info, "node_edges": edges}


    def fetch_address_graph(self, address):
        """ 取出地址的节点相关的图
        """
        sql = f"""
            select '0x' || ENCODE(from_address_hash, 'hex') as from_address, '0x' || ENCODE(to_address_hash, 'hex') as to_address, count(1) as tx_cnt           
            from public.transactions where '0x' || ENCODE(from_address_hash, 'hex')='{address}' OR '0x' || ENCODE(to_address_hash, 'hex')='{address}' 
            and to_address_hash is not null
            group by '0x' || ENCODE(from_address_hash, 'hex'), '0x' || ENCODE(to_address_hash, 'hex')

    """
        df = pd.read_sql_query(sql, self.grdata_engine)
        df = df.fillna("NULL")

        addresses = pd.concat([df['from_address'], df['to_address']]).unique()    #所有的地址
        placeholders = ', '.join([f"'{address}'" for address in addresses.tolist()])
        sql_addresses = f"""
        SELECT '0x' || ENCODE(hash, 'hex') as address, transactions_count, token_transfers_count, gas_used, '标签 1;标签 2;标签 3;标签 4' as tag FROM public.addresses WHERE '0x' || ENCODE(hash, 'hex') IN ({placeholders}) limit 100
    """
        nodes_df = pd.read_sql_query(sql_addresses, self.grdata_engine)
        nodes_df = nodes_df.fillna("NULL")
        nodes = nodes_df.to_json(index=False)
        nodes = nodes_df.apply(lambda row: {"id": row["address"], "transactions_count": row["transactions_count"], "token_transfers_count": row["token_transfers_count"], "gas_used": row["gas_used"], "tag": row["tag"], "label": row["address"]}, axis=1).tolist()
        
        edges = df.apply(lambda row: {"from": row["from_address"], "to": row["to_address"], "value":1, "tag": f"交易次数:{row['tx_cnt']}"}, axis=1).tolist()
        print(edges)

        return {"nodes": nodes, "edges": edges}


#data_fetcher = DataFetcher()
#print('---')
#print(data_fetcher.fetch_node_balances_info('0x0197d2ca53282ec166cf1a1464ce8ed07459d8ef'))
#print(data_fetcher.fetch_node_edge_info('0xf4b59f76657de777e008f8cb07f752148cfb591f', '0x4937121ce9d6bbe48c2479feead9ea27b3732331'))
#res = data_fetcher.fetch_address_info('0xf4b59f76657de777e008f8cb07f752148cfb591f')
#print(res)
#res = data_fetcher.fetch_address_info('0xf4b59f76657de777e008f8cb07f752148cfb591f')
