const ethers = require('ethers')
const { parseUnits, formatUnits } = require('ethers')

describe('stablePool3.1k', function () {
	
	let accounts
	let provider
	let dai
	let usdt
	let usdc
	let pool

	before(async function () {
		accounts = await hre.ethers.getSigners()
		provider = accounts[0].provider
		console.log('account0', accounts[0].address)
		console.log('account1', accounts[1].address)
		console.log('account2', accounts[2].address)
	})
	
	it('deploy', async function () {
		const DAI = await hre.ethers.getContractFactory('MockERC20')
		dai = await DAI.deploy('TEST DAI', 'DAI')
		await dai.waitForDeployment()
		console.log('DAI deployed to:', dai.target)

        await dai.mint(accounts[1].address, parseUnits('1000', 18))
		await dai.mint(accounts[2].address, parseUnits('10000', 18))
		console.log('DAI mint done')

		const USDT = await hre.ethers.getContractFactory('MockERC20')
		usdt = await USDT.deploy('TEST USDT', 'USDT')
		await usdt.waitForDeployment()
		console.log('USDT deployed to:', usdt.target)
		
		await usdt.setDecimals(6)
		console.log('USDT setDecimals done')
		
		await usdt.mint(accounts[1].address, parseUnits('10000', 6))
		await usdt.mint(accounts[2].address, parseUnits('1000', 6))
		console.log('USDT mint done')

		const USDC = await hre.ethers.getContractFactory('MockERC20')
		usdc = await USDC.deploy('TEST USDC', 'USDC')
		await usdc.waitForDeployment()
		console.log('USDC deployed to:', usdc.target)
		
		await usdc.setDecimals(6)
		console.log('USDC setDecimals done')
		
		await usdc.mint(accounts[1].address, parseUnits('10000', 6))
		await usdc.mint(accounts[2].address, parseUnits('1000', 6))
		console.log('USDC mint done')

		const StablePool3 = await hre.ethers.getContractFactory('StablePool3')
		pool = await StablePool3.deploy([dai.target, usdt.target, usdc.target])
		await pool.waitForDeployment()
		console.log('pool deployed to:', pool.target)

		await print()
	})

	it('addLiquidity', async function () {
		let user = accounts[1]
		await dai.connect(user).approve(pool.target, parseUnits('100', 18))
		await usdt.connect(user).approve(pool.target, parseUnits('10000', 6))
		await usdc.connect(user).approve(pool.target, parseUnits('10000', 6))
		console.log('approved')

		await pool.connect(user).addLiquidity(
			[parseUnits('100', 18), parseUnits('10000', 6), parseUnits('10000', 6)], 0
		)

		console.log('done')
		await print()
	})

	it('swap', async function () {
		let user = accounts[2]
		await dai.connect(user).approve(pool.target, parseUnits('10000', 18))
		console.log('approved')

		for (let i=1; i<=100; i++) {
			let amountOut = await pool.connect(user).swap.staticCall(
				0n, 1n, parseUnits('100', 18), 0n
			)
			console.log('pool :', 
				formatUnits(await dai.balanceOf(pool.target), 18) + ' DAI\t', 
				formatUnits(await usdt.balanceOf(pool.target), 6) + ' USDT\t',
				formatUnits(await usdc.balanceOf(pool.target), 6) + ' USDC\t',
				'amountOut:', formatUnits(amountOut, 6)
			)

			await pool.connect(user).swap(
				0n, 1n, parseUnits('100', 18), 0n
			)
		}
		
		console.log('done')
		await print()
	})

	it('swap', async function () {
		let user = accounts[2]
		await usdt.connect(user).approve(pool.target, parseUnits('10000', 6))
		console.log('approved')

		for (let i=1; i<=100; i++) {
			let amountOut = await pool.connect(user).swap.staticCall(
				1n, 2n, parseUnits('100', 6), 0n
			)
			console.log('pool :', 
				formatUnits(await dai.balanceOf(pool.target), 18) + ' DAI\t', 
				formatUnits(await usdt.balanceOf(pool.target), 6) + ' USDT\t',
				formatUnits(await usdc.balanceOf(pool.target), 6) + ' USDC\t',
				'amountOut:', formatUnits(amountOut, 6)
			)

			await pool.connect(user).swap(
				1n, 2n, parseUnits('100', 6), 0n
			)
		}
		
		console.log('done')
		await print()
	})

    async function print() {
        console.log('')
		for (let i=1; i<3; i++) {
			console.log('account' + i + ':', 
				formatUnits(await dai.balanceOf(accounts[i].address), 18) + ' DAI\t', 
				formatUnits(await usdt.balanceOf(accounts[i].address), 6) + ' USDT\t',
				formatUnits(await usdc.balanceOf(accounts[i].address), 6) + ' USDC'
			)
		}
        console.log('pool :', 
            formatUnits(await dai.balanceOf(pool.target), 18) + ' DAI\t', 
            formatUnits(await usdt.balanceOf(pool.target), 6) + ' USDT\t',
            formatUnits(await usdc.balanceOf(pool.target), 6) + ' USDC'
        )
        console.log('')
	}
})