import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const OX2_PRIVATE_KEY = vars.get("OX2_PRIVATE_KEY");
const OX3_PRIVATE_KEY = vars.get("OX3_PRIVATE_KEY");
const WALI_CHEF= vars.get("SEPOLIA_DEV");
const DEPLOY3_PRIVATE_KEY = vars.get("DEPLOY3_PRIVATE_KEY");
const ZISU_PRIVATE_KEY = vars.get("Zisu");
const config: HardhatUserConfig = {
  solidity:{
    compilers: [
      {
        version: "0.6.12",
        settings: {
          optimizer: {
           enabled: true,
           runs: 10000000 //for multicall3
          }
         }     
      },
      {
        version: "0.8.9",
        settings: {
          optimizer: {
           enabled: true,
           runs: 10000000 //for multicall3
          }
         }
         
      },
      {
        version: "0.8.12",
        settings: {
          optimizer: {
           enabled: true,
           runs: 10000000 //for multicall3
          }
         }
     
      },
      {
        version: "0.8.19" ,
        settings: {
          optimizer: {
           enabled: true,
           runs: 10000000 //for multicall3
          }
         }
     
      },
      {
        version: "0.8.20" ,
        settings: {
          optimizer: {
           enabled: true,
           runs: 10000000 //for multicall3
          }
         }
      
      },{
        version:"0.5.0",
        settings: {
          optimizer: {
           enabled: true,
           runs: 10000000 //for multicall3
          }
         }
     
      },
      {
        version:"0.8.28",
        settings: {
          optimizer: {
           enabled: true,
           runs: 10000000 //for multicall3
          }
         }
     
      }
    ],
  },
  etherscan:{
    apiKey: {
      goerli:'C1TDWKGAI7H3J95PRJGRPUV386W1YHHX32',
      mainnet:'C1TDWKGAI7H3J95PRJGRPUV386W1YHHX32',
      sepolia:'C1TDWKGAI7H3J95PRJGRPUV386W1YHHX32',
      op:'2M5X2QTXZ7Y55XX597HB1RQJ2RA8XYDNIW',
    },
    customChains:[
      {
        network:'sepolia',
        chainId:11155111,
        urls: {
          apiURL: "https://api-sepolia.etherscan.io/api",  // https => http
          browserURL: "https://sepolia.etherscan.io"
        }
      }
      ,
      {
        network:"goerli",
        chainId:5,
        urls: {
          apiURL: "http://api-goerli.etherscan.io/api",  // https => http
          browserURL: "https://goerli.etherscan.io"
        }
      },
      {
        network:"mainnet",
        chainId:1,
        urls: {
          apiURL: "http://api.etherscan.io/api",  // https => http
          browserURL: "https://etherscan.io"
        }
      },
      {
        network:"op",
        chainId:10,
        urls: {
          apiURL: "http://api-optimistic.etherscan.io/api",  // https => http
          browserURL: "https://optimistic.etherscan.io"
        }
      }
    ]
  },
  networks:{
    local: {
      url: `http://127.0.0.1:8545/`,
      accounts: ['0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e']
    },
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/TlL4_VZXRYlcoI5gUJUh_ShUhRXKou3Y`,
      accounts: [ZISU_PRIVATE_KEY || '']
    },
    op:{
      url: `https://optimism-mainnet.infura.io/v3/482f47da9d2e4eb6ad06ecdc81fe4163`,
      accounts: [DEPLOY3_PRIVATE_KEY || '']
    },
    sepolia:{
      url:`https://sepolia.infura.io/v3/482f47da9d2e4eb6ad06ecdc81fe4163`,
      accounts: [WALI_CHEF||'']
    },
    bnb:{
      url:`https://bsc-dataseed.binance.org/`,
      accounts: [ZISU_PRIVATE_KEY||'']
    },
    blast_mainnet:{
      url:`https://rpc.blast.io`,
      accounts: ['f8db4c964209158abea0e8526f78c8d0a9e9bd7b346445d639f3e9fbc1b160f4']
    },
    hashkey_testnet:{
      url:`https://hashkeychain-testnet.alt.technology`,
      accounts:['0x01b507055d43f7bf38ddd8599efe7edaecd97c9787d449d2b137f735da50b279'] // 0xE84221e53195c879E9D5c85cf5f9d3a3210006EE
    },
    hashkey:{
      url:`https://mainnet.hsk.xyz`,
      accounts:['0x01b507055d43f7bf38ddd8599efe7edaecd97c9787d449d2b137f735da50b279'] 
    }
    

  }

};

export default config;
