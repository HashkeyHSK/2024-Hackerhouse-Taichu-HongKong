# Hyperindex V2 Area

Code from [Uniswap V2](https://github.com/Uniswap/uniswap-v2-core/tree/27f6354bae6685612c182c3bc7577e61bc8717e3/contracts) with the following modifications.

1. Change contract version to 0.6.12 and do the necessary patching.
2. HyperindexV2Factory.sol line 9, add INIT_CODE_PAIR_HASH
3. HyperindexV2ERC20.sol line 10 line 11, lptoken name changed
4. HyperindexV2Library.sol line 26, change init_code_hash to INIT_CODE_PAIR_HASH
5. HyperindexV2Router02 line 448, add pairFor() to view the pair address
