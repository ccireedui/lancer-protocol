require("@nomicfoundation/hardhat-toolbox");
require('hardhat-abi-exporter');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    test: {
      url: "http://127.0.0.1:7545",
      accounts: ['f150e20027b025bad530a560ee1bc59b0c3b14d205049c8d388aca81fa4c3d9e']
    }
  },
  abiExporter: {
    path: './app/abi',
    runOnCompile: true,
    clear: true,
    flat: true,
    spacing: 2,
  }
};
