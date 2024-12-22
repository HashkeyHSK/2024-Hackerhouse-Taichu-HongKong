"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [connected, setConnected] = useState(false);
  const ethereum = (window as any).ethereum;
  const [outputAmount, setOutputAmount] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [selectedTokenIn, setSelectedTokenIn] = useState(
    "0x60EFCa24B785391C6063ba37fF917Ff0edEb9f4a"
  ); // 默认选择USDT
  const [selectedTokenOut, setSelectedTokenOut] = useState(
    "0x47725537961326e4b906558BD208012c6C11aCa2"
  ); // 默认选择USDC

// StablePool3: 0x3bE40cB291a91a9C4b7De00442d6F09243363B05
  const tokenOptions = [
    { label: "DAI", value: "0x710324576c5933f2C0446136516DC3E91226f916" },
    { label: "USDT", value: "0x60EFCa24B785391C6063ba37fF917Ff0edEb9f4a" },
    { label: "USDC", value: "0x47725537961326e4b906558BD208012c6C11aCa2" }
  ];

  const contractAddress = "0x3bE40cB291a91a9C4b7De00442d6F09243363B05";
  const abi = [
    {
      "inputs": [
        {
          "internalType": "address[3]",
          "name": "_tokens",
          "type": "address[3]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "FEE_DENOMINATOR",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "LIQUIDITY_FEE",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "N",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "SWAP_FEE",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[3]",
          "name": "amounts",
          "type": "uint256[3]"
        },
        {
          "internalType": "uint256",
          "name": "minShares",
          "type": "uint256"
        }
      ],
      "name": "addLiquidity",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "shares",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "balances",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "shares",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "i",
          "type": "uint256"
        }
      ],
      "name": "calcWithdrawOneToken",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "dy",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "fee",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "i",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "j",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "dx",
          "type": "uint256"
        }
      ],
      "name": "getAmountOut",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "dy",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "fee",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getVirtualPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "shares",
          "type": "uint256"
        },
        {
          "internalType": "uint256[3]",
          "name": "minAmountsOut",
          "type": "uint256[3]"
        }
      ],
      "name": "removeLiquidity",
      "outputs": [
        {
          "internalType": "uint256[3]",
          "name": "amountsOut",
          "type": "uint256[3]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "shares",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "i",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minAmountOut",
          "type": "uint256"
        }
      ],
      "name": "removeLiquidityOneToken",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountOut",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "i",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "j",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "dx",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minDy",
          "type": "uint256"
        }
      ],
      "name": "swap",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "dy",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "tokens",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];
  useEffect(() => {
    const init = async () => {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      setProvider(provider);
      setSigner(signer);
    };
    init();
  }, []);
  const connectWallet = async () => {
    if (ethereum) {
      try {
        await ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(ethereum);
        const { chainId } = await provider.getNetwork();
        if (chainId !== 133) {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x85", // 133 in hex
                chainName: "HashKey Chain Testnet",
                nativeCurrency: {
                  name: "HSK",
                  symbol: "HSK",
                  decimals: 18,
                },
                rpcUrls: ["https://hashkeychain-testnet.alt.technology"],
                blockExplorerUrls: [
                  "https://hashkeychain-testnet-explorer.alt.technology",
                ],
              },
            ],
          });
        }
        setConnected(true);
      } catch (error) {
        console.error("Connection failed:", error);
      }
    } else {
      alert("请安装MetaMask!");
    }
  };

  const handleAmountChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmountIn(value);

    if (value && signer) {
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tokenInIndex = tokenOptions.findIndex(token => token.value === selectedTokenIn)
    const tokenOutIndex = tokenOptions.findIndex(token => token.value === selectedTokenOut)
      console.log(tokenInIndex,tokenOutIndex)
      try {
        const [amountOut] = await contract.getAmountOut(
          BigInt( tokenInIndex),  BigInt(tokenOutIndex), ethers.utils.parseUnits(value, 6)
        )
        setOutputAmount(ethers.utils.formatUnits(amountOut, 6)); // 假设所有代币都有6位小数
      } catch (error) {
        console.error("获取输出金额失败:", error);
      }
    } else {
      setOutputAmount("");
    }
  };

  const checkApproval = async () => {
    if (signer) {
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const owner = await signer.getAddress();
      let allApproved = true; // 假设所有代币都已批准

      // 循环检查每个代币的授权情况
      for (const token of tokenOptions) {
        const tokenContract = new ethers.Contract(
          token.value,
          [
            "function allowance(address owner, address spender) view returns (uint256)",
          ],
          signer
        );

        const allowance = await tokenContract.allowance(owner, contractAddress);
        if (!allowance.gt(0)) {
          allApproved = false; // 如果有一个代币未批准，则设置为false
          break; // 退出循环
        }
      }

      setIsApproved(allApproved); // 更新批准状态
    }
  };

  useEffect(() => {
    checkApproval(); // 在组件加载时检查批准状态
  }, [signer]);

  const handleApprove = async () => {
    if (!signer) return;

    // 循环处理每个代币
    for (const token of tokenOptions) {
      const tokenContract = new ethers.Contract(
        token.value,
        ["function approve(address spender, uint256 amount) returns (bool)"],
        signer
      );

      try {
        const tx = await tokenContract.approve(
          contractAddress,
          ethers.constants.MaxUint256
        );
        await tx.wait();
        console.log(`已批准 ${token.label} 到合约地址`); // 输出批准信息
      } catch (error) {
        console.error(`批准 ${token.label} 失败:`, error);
      }
    }
    setIsApproved(true); // 更新批准状态
  };

  const handleSwap = async () => {
    if (!signer) return;

    const contract = new ethers.Contract(contractAddress, abi, signer);
    const tokenInIndex = tokenOptions.findIndex(token => token.value === selectedTokenIn);
    const tokenOutIndex = tokenOptions.findIndex(token => token.value === selectedTokenOut);
    const minAmountOut = 0; // 可以根据需要设置最小输出

    try {
      const tx = await contract.swap(
        BigInt(tokenInIndex),
        BigInt(tokenOutIndex),
        ethers.utils.parseUnits(amountIn, 6),
        minAmountOut
      );
      const receipt = await tx.wait(); // 等待交易确认
      console.log("Swap output:", tx.hash);
      setAmountOut(ethers.utils.formatUnits(outputAmount, 6)); // 假设所有代币都有6位小数
    } catch (error) {
      console.error("Swap failed:", error);
    }
  };

  const handleTokenInChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTokenIn(e.target.value);
  };

  const handleTokenOutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTokenOut(e.target.value);
  };

  if (!connected) {
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <Button onClick={connectWallet}>连接HashKey网络</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">Stable Swap</h1>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <select
              value={selectedTokenIn}
              onChange={handleTokenInChange}
              className="border rounded-md p-2 w-1/3"
            >
              {tokenOptions.map((token) => (
                <option key={token.value} value={token.value}>
                  {token.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={amountIn}
              onChange={handleAmountChange}
              placeholder="input amount"
              className="border rounded-md p-2 w-1/3 text-center"
            />
          </div>
          <div className="flex justify-center">
            {!isApproved ? (
              <Button
                onClick={handleApprove}
                className="w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600"
              >
                Approve {tokenOptions.find(token => token.value === selectedTokenIn)?.label}
              </Button>
            ) : (
              <Button
                onClick={handleSwap}
                className="w-full bg-green-500 text-white rounded-md p-2 hover:bg-green-600"
              >
                Swap
              </Button>
            )}
          </div>
          <div className="text-center mt-4">
            <span className="font-semibold">
              Output{" "}
              <select
                value={selectedTokenOut}
                onChange={handleTokenOutChange}
                className="border rounded-md p-2 w-1/3"
              >
                {tokenOptions.map((token) => (
                  <option key={token.value} value={token.value}>
                    {token.label}
                  </option>
                ))}
              </select>{" "}
            </span>
            <span>{outputAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
