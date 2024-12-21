import { ethers, Provider } from 'ethers';
import { parseUnits, formatUnits, JsonRpcProvider } from 'ethers';
import { expect } from 'chai';
import { Signer } from 'ethers';
const hre = require('hardhat');

describe('perp.test2', function () {
	
	let accounts: Signer[];
	let provider: Provider;
	let factory: any;
	let weth: any;
	let usdt: any;
	let router: any;
	let pair: any;
    let pool: any;

	before(async function () {
		accounts = await hre.ethers.getSigners();
		provider = accounts[0].provider!;
		console.log('account0', await accounts[0].getAddress());
		console.log('account1', await accounts[1].getAddress());
		console.log('account2', await accounts[2].getAddress());
	})
	
	it('deploy', async function () {
        const HyperindexV2Factory = await hre.ethers.getContractFactory('HyperindexV2Factory');
		factory = await HyperindexV2Factory.deploy(await accounts[0].getAddress());
		await factory.waitForDeployment();
		console.log('factory deployed to:', factory.target);
		console.log('INIT_CODE_PAIR_HASH', await factory.INIT_CODE_PAIR_HASH());

		await factory.setFeeTo(await accounts[0].getAddress());
		console.log('factory setFeeTo done');

		const WETH = await hre.ethers.getContractFactory('WETH');
		weth = await WETH.deploy();
		await weth.waitForDeployment();
		console.log('WETH deployed to:', weth.target);

		const USDT = await hre.ethers.getContractFactory('MockERC20');
		usdt = await USDT.deploy('TEST USDT', 'USDT');
		await usdt.waitForDeployment();
		console.log('USDT deployed to:', usdt.target);
		
		await usdt.setDecimals(6);
		console.log('USDT setDecimals done');
		
		await usdt.mint(await accounts[0].getAddress(), parseUnits('1000', 6));
		await usdt.mint(await accounts[1].getAddress(), parseUnits('1000', 6));
		await usdt.mint(await accounts[2].getAddress(), parseUnits('1000', 6));
		await usdt.mint(await accounts[3].getAddress(), parseUnits('1000', 6));
		await usdt.mint(await accounts[4].getAddress(), parseUnits('1000', 6));
		console.log('USDT mint done');

		const Router = await hre.ethers.getContractFactory('HyperindexV2Router02');
		router = await Router.deploy(factory.target, weth.target);
		await router.waitForDeployment();
		console.log('router deployed to:', router.target);

		await print();
	})

	// ... 其他测试用例保持不变，添加类型注解和使用 await accounts[i].getAddress() ...
	
	async function getDeadline(): Promise<number> {
		let blockNumber = await provider.getBlockNumber();
		let block = await provider.getBlock(blockNumber);
		if (!block) throw new Error("Failed to get block");
		return block.timestamp + 3600 * 24;
	}

    async function print() {
        console.log('');
		for (let i = 0; i < 4; i++) {
			console.log('account' + i + ':', 
				formatUnits(await usdt.balanceOf(await accounts[i].getAddress()), 6) + ' USDT\t', 
				formatUnits(await provider.getBalance(await accounts[i].getAddress()), 18) + ' ETH'
			);
		}

        pool && console.log('pool:', 
            formatUnits(await usdt.balanceOf(pool.address), 6) + ' USDT\t', 
            formatUnits(await provider.getBalance(pool.address), 18) + ' ETH'
        );
        console.log('');
	}
}) 