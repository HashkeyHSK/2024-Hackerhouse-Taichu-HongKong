import { ethers } from 'ethers';
import { parseUnits, formatUnits } from 'ethers';
import { expect } from 'chai';
import hre from 'hardhat';

describe('perp.test1', function () {
	
	let accounts: any[];
	let provider: any;
	let factory: any;
	let weth: any;
	let usdt: any;
	let router: any;
	let pair: any;
    let pool: any;

	before(async function () {
		accounts = await hre.ethers.getSigners();
		provider = accounts[0].provider;
		console.log('account0', accounts[0].address);
		console.log('account1', accounts[1].address);
		console.log('account2', accounts[2].address);
	});
	
	it('deploy', async function () {
        const HyperindexV2Factory = await hre.ethers.getContractFactory('HyperindexV2Factory');
		factory = await HyperindexV2Factory.deploy(accounts[0].address);
		await factory.waitForDeployment();
		console.log('factory deployed to:', factory.target);
		console.log('INIT_CODE_PAIR_HASH', await factory.INIT_CODE_PAIR_HASH());

		await factory.setFeeTo(accounts[0].address);
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
		
		await usdt.mint(accounts[0].address, parseUnits('1000', 6));
		await usdt.mint(accounts[1].address, parseUnits('1000', 6));
		await usdt.mint(accounts[2].address, parseUnits('1000', 6));
		await usdt.mint(accounts[3].address, parseUnits('1000', 6));
		await usdt.mint(accounts[4].address, parseUnits('1000', 6));
		console.log('USDT mint done');

		const Router = await hre.ethers.getContractFactory('HyperindexV2Router02');
        console.log('factory.target', factory.target);
        console.log(' weth.target',  weth.target);
		router = await Router.deploy(factory.target, weth.target);
		await router.waitForDeployment();

		console.log('router deployed to:', router.target);

		await print();
	});

	it('createPair', async function () {
		let pairForAddr = await router.pairFor(weth.target, usdt.target);
		console.log('pairForAddr:', pairForAddr);
		
		await factory.createPair(weth.target, usdt.target);
		let pairAddr = await factory.getPair(weth.target, usdt.target);
		console.log('pairAddr:', pairAddr);

		pairAddr = await factory.getPair(usdt.target, weth.target);
		console.log('pairAddr:', pairAddr);

		const HyperindexV2Pair = await hre.ethers.getContractFactory('HyperindexV2Pair');
		pair = HyperindexV2Pair.attach(pairAddr);

        const Pool = await hre.ethers.getContractFactory('Pool');
		pool = await Pool.deploy(router.target, pairAddr, usdt.target, 86400);
		await pool.waitForDeployment();
		console.log('pool deployed to:', pool.target);
	});

	it('addLiquidity', async function () {
		let user = accounts[0];
		await usdt.connect(user).approve(router.target, parseUnits('86400', 6));
		console.log('approved');

		await router.connect(user).addLiquidityETH(
			usdt.target, parseUnits('1000', 6), 0n, 0n, user.address, await getDeadline(), 
			{ value: parseUnits('1', 18)}
		);

		console.log('done');
		await print();
	});

	it('deposit', async function () {
		let user = accounts[1];
		await usdt.connect(user).approve(pool.target, parseUnits('100', 6));
		console.log('approved');
		await pool.connect(user).deposit(parseUnits('100', 6));
		console.log('done');

        user = accounts[2];
		await usdt.connect(user).approve(pool.target, parseUnits('200', 6));
		console.log('approved');
		await pool.connect(user).deposit(parseUnits('200', 6));
		console.log('done');

		await print();
	});

	it('borrowThenSwap', async function () {
		let user = accounts[3];
		let rates = await pool.getBorrowRate();
		console.log('borrowRate:', formatUnits(rates[0], 18), 'ratePerBlock:', formatUnits(rates[1], 18));
		console.log('interest per block:', parseUnits('100', 6) * rates[1] / BigInt(100e18));

		await usdt.connect(user).approve(pool.target, parseUnits('20', 6));
		console.log('approved');
		await pool.connect(user).borrowThenSwap(parseUnits('100', 6), 0n, rates[0], 50000);
		console.log('done');

		await print();
	});

	it('buy', async function () {
		let user = accounts[4];
		await usdt.connect(user).approve(router.target, parseUnits('100', 6));
		console.log('approved');
		await router.connect(user).swapExactTokensForETH(
			parseUnits('100', 6), 0n, [usdt.target, weth.target], user.address, await getDeadline()
		);

		await print();
	});

    it('swapThenRepay', async function () {
		let user = accounts[3];
		await pool.connect(user).swapThenRepay(1n, 0n);
		console.log('done');
		expect(await usdt.balanceOf(user.address)).to.equal(parseUnits('1017.351914', 6));

		await print();
	});

    it('withdraw', async function () {
		let user = accounts[2];
		await pool.connect(user).withdraw(parseUnits('100', 6));
		console.log('done 1');
		await print();
		expect(await usdt.balanceOf(user.address)).to.equal(parseUnits('900.010958', 6));
		
		await pool.connect(user).withdraw(parseUnits('100', 6));
		console.log('done 2');
		await print();
		expect(await usdt.balanceOf(user.address)).to.equal(parseUnits('1000.010958', 6));
		
		user = accounts[1];
		await pool.connect(user).withdraw(parseUnits('100', 6));
		console.log('done 3');
		await print();
		expect(await usdt.balanceOf(user.address)).to.equal(parseUnits('1000.005479', 6));
	});

	
	async function getDeadline() {
		let blockNumber = await provider.getBlockNumber();
		let block = await provider.getBlock(blockNumber);
		return block.timestamp + 3600 * 24;
	}

    async function print() {
        console.log('');
		for (let i = 0; i < 4; i++) {
			console.log('account' + i + ':', 
				formatUnits(await usdt.balanceOf(accounts[i].address), 6) + ' USDT\t', 
				formatUnits(await provider.getBalance(accounts[i].address), 18) + ' ETH'
			);
		}

        pool && console.log('pool:', 
            formatUnits(await usdt.balanceOf(pool.target), 6) + ' USDT\t', 
            formatUnits(await provider.getBalance(pool.target), 18) + ' ETH'
        );
        console.log('');
	}
}); 