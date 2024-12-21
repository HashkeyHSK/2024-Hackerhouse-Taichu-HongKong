const ethers = require('ethers')
const { parseUnits, formatUnits } = require('ethers')

describe('stablePool3.test', function () {
	
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
		await dai.mint(accounts[2].address, parseUnits('1000', 18))
		console.log('DAI mint done')

		const USDT = await hre.ethers.getContractFactory('MockERC20')
		usdt = await USDT.deploy('TEST USDT', 'USDT')
		await usdt.waitForDeployment()
		console.log('USDT deployed to:', usdt.target)
		
		await usdt.setDecimals(6)
		console.log('USDT setDecimals done')
		
		await usdt.mint(accounts[1].address, parseUnits('1000', 6))
		await usdt.mint(accounts[2].address, parseUnits('1000', 6))
		console.log('USDT mint done')

		const USDC = await hre.ethers.getContractFactory('MockERC20')
		usdc = await USDC.deploy('TEST USDC', 'USDC')
		await usdc.waitForDeployment()
		console.log('USDC deployed to:', usdc.target)
		
		await usdc.setDecimals(6)
		console.log('USDC setDecimals done')
		
		await usdc.mint(accounts[1].address, parseUnits('1000', 6))
		await usdc.mint(accounts[2].address, parseUnits('1000', 6))
		console.log('USDC mint done')

		const StablePool3 = await hre.ethers.getContractFactory('StablePool3')
		pool = await StablePool3.deploy([dai.target, usdt.target, usdc.target])
		await pool.waitForDeployment()
		console.log('pool deployed to:', pool.target)

		console.log('swap fee:', parseFloat(await pool.SWAP_FEE()) / parseFloat(await pool.FEE_DENOMINATOR()))
		console.log('liquidity fee:', parseFloat(await pool.LIQUIDITY_FEE()) / parseFloat(await pool.FEE_DENOMINATOR()))

		await print()
	})

	it('addLiquidity', async function () {
		let user = accounts[1]
		await dai.connect(user).approve(pool.target, parseUnits('1000', 18))
		await usdt.connect(user).approve(pool.target, parseUnits('1000', 6))
		await usdc.connect(user).approve(pool.target, parseUnits('1000', 6))
		console.log('approved')

		await pool.connect(user).addLiquidity(
			[parseUnits('1000', 18), parseUnits('1000', 6), parseUnits('1000', 6)], 0
		)

		console.log('done')
		await print()

		console.log('pool token0:', await pool.tokens(0))
		console.log('pool token1:', await pool.tokens(1))
		console.log('pool token2:', await pool.tokens(2))
	})

	it('swap', async function () {
		let user = accounts[2]
		await dai.connect(user).approve(pool.target, parseUnits('100', 18))
		console.log('approved')

		await pool.connect(user).swap(
			0n, 1n, parseUnits('100', 18), 0n
		)
		console.log('done')
		await print()
		
		await usdt.connect(user).approve(pool.target, parseUnits('100', 6))
		console.log('approved')
		
		await pool.connect(user).swap(
			1n, 2n, parseUnits('100', 6), 0n
		)
		//swap = addLiquidity + removeLiquidityOneToken
		// await pool.connect(user).addLiquidity(
		// 	[0n, parseUnits('100', 6), 0n], 0
		// )
		// let share = await pool.balanceOf(user.address)
		// console.log('share:', share)
		// await pool.connect(user).removeLiquidityOneToken(
		// 	share, 2n, 0n
		// )
		console.log('done')
		await print()

		let price = await pool.getVirtualPrice()
		console.log('getVirtualPrice:', formatUnits(price, 18))
		console.log('pool TVL:', formatUnits(await pool.totalSupply() * price, 18+18))
		console.log('balanceOf:', formatUnits(await pool.balanceOf(accounts[1].address) * price, 18+18))
	})

    it('removeLiquidityOneToken', async function () {
		let user = accounts[1]

        let bal = await pool.balanceOf(user.address)
        console.log('bal:', formatUnits(bal, 18))

        let sharePrice = await pool.getVirtualPrice()
        console.log('How many tokens is 1 share worth?', formatUnits(sharePrice, 18))
        
        let dai100 = await pool.calcWithdrawOneToken(parseUnits('100', 18), 0n)
        console.log('withdraw 100 Dai:', formatUnits(dai100[0], 18),
            'fee:', formatUnits(dai100[1], 18))

		await pool.connect(user).removeLiquidityOneToken(
			parseUnits('100', 18), 0n, dai100[0] * 99n / 100n
		)

		console.log('done')
		await print()
	})

    it('removeLiquidity', async function () {
        let user = accounts[1]
        
        let bal = await pool.balanceOf(user.address)
        console.log('bal:', formatUnits(bal, 18))

        let sharePrice = await pool.getVirtualPrice()
        console.log('How many tokens is 1 share worth?', formatUnits(sharePrice, 18))

		await pool.connect(user).removeLiquidity(
			bal, [0n, 0n, 0n]
		)

		console.log('done')
		await print()
	})

    async function print() {
        console.log('')
		for (let i=1; i<3; i++) {
			console.log('account' + i + ':', 
				formatUnits(await dai.balanceOf(accounts[i].address), 18) + ' DAI\t', 
				formatUnits(await usdt.balanceOf(accounts[i].address), 6) + ' USDT\t',
				formatUnits(await usdc.balanceOf(accounts[i].address), 6) + ' USDC\t'
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