const ethers = require('ethers')
const { parseUnits, formatUnits } = require('ethers')

describe('stablePool2.test', function () {
	
	let accounts
	let provider
	let dai
	let usdt
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

        await dai.mint(accounts[1].address, parseUnits('2000', 18))
		await dai.mint(accounts[2].address, parseUnits('1000', 18))
		console.log('DAI mint done')

		const USDT = await hre.ethers.getContractFactory('MockERC20')
		usdt = await USDT.deploy('TEST USDT', 'USDT')
		await usdt.waitForDeployment()
		console.log('USDT deployed to:', usdt.target)
		
		await usdt.setDecimals(6)
		console.log('USDT setDecimals done')
		
		await usdt.mint(accounts[1].address, parseUnits('2000', 6))
		await usdt.mint(accounts[2].address, parseUnits('1000', 6))
		console.log('USDT mint done')

		const StablePool2 = await hre.ethers.getContractFactory('StablePool2')
		pool = await StablePool2.deploy([dai.target, usdt.target])
		await pool.waitForDeployment()
		console.log('pool deployed to:', pool.target)

		await print()
	})

	it('addLiquidity', async function () {
		let user = accounts[1]
		await dai.connect(user).approve(pool.target, parseUnits('1000', 18))
		await usdt.connect(user).approve(pool.target, parseUnits('1000', 6))
		console.log('approved')

		await pool.connect(user).addLiquidity(
			[parseUnits('1000', 18), parseUnits('1000', 6)], 0
		)

		console.log('done')
		await print()
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
	})

	it('addLiquidity', async function () {
		let user = accounts[1]
		await usdt.connect(user).approve(pool.target, parseUnits('1000', 6))
		console.log('approved')

		await pool.connect(user).addLiquidity(
			[0n, parseUnits('1000', 6)], 0
		)

		console.log('done')
		await print()
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
			parseUnits('100', 18), 0n, 0n
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
			bal, [0n, 0n]
		)

		console.log('done')
		await print()
	})

    async function print() {
        console.log('')
		for (let i=1; i<3; i++) {
			console.log('account' + i + ':', 
				formatUnits(await dai.balanceOf(accounts[i].address), 18) + ' DAI\t', 
				formatUnits(await usdt.balanceOf(accounts[i].address), 6) + ' USDT'
			)
		}
        console.log('pool :', 
            formatUnits(await dai.balanceOf(pool.target), 18) + ' DAI\t', 
            formatUnits(await usdt.balanceOf(pool.target), 6) + ' USDT'
        )
        console.log('')
	}
})