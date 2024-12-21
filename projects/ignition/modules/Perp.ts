// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PerpModule = buildModule("PerpModule", (m) => {
  // const unlockTime = m.getParameter("unlockTime", JAN_1ST_2030);
  // const lockedAmount = m.getParameter("lockedAmount", ONE_GWEI);

  // address routerAddr, address pairAddr, address borrowTokenAddr, uint24 _blockInterval


  // ### 2024-11-25 hashkeyTest(chainId:133) SwapV2
  // - factory deployed to: 0xCDF5BbeBcFaf0f0A05aB8D9B73DB1468a64652c3
  // - INIT_CODE_PAIR_HASH: 0xf09de38e7840309300c223037d04fc9db2a83432048971f6ccd7753f498831da
  // - WHSK: 0xCA8aAceEC5Db1e91B9Ed3a344bA026c4a2B3ebF6
  // - USDT: 0x04bc4dE90115375347311F7684592eeeA073eb82
  // - router deployed to: 0x89491dd50EdbEE8CaAE912cbA162a6b2C6aC69ce
  
  const routerAddr = m.getParameter("routerAddr", "0x89491dd50EdbEE8CaAE912cbA162a6b2C6aC69ce");
  const pairAddr = m.getParameter("pairAddr", "0x1C4a5408e7c0D65F20FA650ADaC241F100a1Beac");
  const borrowTokenAddr = m.getParameter("borrowTokenAddr", "0xCA8aAceEC5Db1e91B9Ed3a344bA026c4a2B3ebF6");
  const blockInterval = m.getParameter("blockInterval", 10000);

  const pool = m.contract("Pool", [routerAddr,pairAddr,borrowTokenAddr,blockInterval]);

  return { pool };
});

export default PerpModule;
