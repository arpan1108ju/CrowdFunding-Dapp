require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition-ethers");
require('dotenv').config();

const SEPOLIA_URL = process.env.SEPOLIA_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const GANCHE_PROVIDER_URL = process.env.GANCHE_PROVIDER_URL;
const GANACHE_PRIVATE_KEY = process.env.GANACHE_PRIVATE_KEY;


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  defaultNetwork : 'hardhat',
  networks : {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY],
    },
    ganache: {
      url: GANCHE_PROVIDER_URL,
      accounts: [GANACHE_PRIVATE_KEY],
    }
  }
};

// address of crowdfunding contract in sepolia - 0xBD1169c512568dB5182C1De696b2737Dc5C53165