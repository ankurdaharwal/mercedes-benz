# Mercedes Benz NFTs

![Version](https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)
[![Twitter: An1cu12](https://img.shields.io/twitter/follow/an1cu12.svg?style=social)](https://twitter.com/An1cu12)

## Setup
- `yarn`

## Environment File (.env)
- RINKEBY_URL: Ethereum (Rinkeby) Testnet Provider endpoint
- MATIC_URL: Polygon (Matic Mumbai) Testnet Provider endpoint
- PRIVATE_KEY: Private key for the deployer account

## Compile & migrate (Deploy) Contracts
- `yarn matic` (Deploy the Smart Contracts to Polyon Mumbai Testnet)
- After deployment set the newly deployed smart contract address on `dapp/src/constants.js` CONTRACT_ADDRESS field
- Copy the artifacts JSON file from `artifacts/contracts/MercedesBenz.sol/MercedesBenz.json` to `dapp/src/utils/MercedesBenz.json`

## Watch the collection on OpenSea.io or Rarible.com
Example: 
- [https://testnets.opensea.io/collection/mercedesbenz-9](https://testnets.opensea.io/collection/mercedesbenz-9)

## View the example contract on the public explorer
Example:[https://mumbai.polygonscan.com/address/0x3ab11bd7A358A73198CDaaB0610E357aEBDa7E47](https://mumbai.polygonscan.com/address/0x3ab11bd7A358A73198CDaaB0610E357aEBDa7E47)

## Production Build
- `yarn build`

## Start the API Server
- `yarn api`

## Start the Dapp
- `yarn start`

- Start by minting your Passport NFT

## Features
- 📦 [Hardhat](https://hardhat.org/) - Ethereum development environment for professionals
- 🦾 [TypeChain Hardhat plugin](https://github.com/ethereum-ts/TypeChain/tree/master/packages/hardhat) - Automatically generate TypeScript bindings for smartcontracts while using Hardhat.
- 🎨 [OpenZeppelin](https://docs.openzeppelin.com/contracts/4.x/) - standard for secure blockchain applications

## Author

👤 **Ankur Daharwal**

- Website: [Ankur's Portfolio](https://ankurdaharwal.wixsite.com/blockchain)
- Twitter: [@An1cu12](https://twitter.com/An1cu12)
- Github: [@ankurdaharwal](https://github.com/ankurdaharwal)

## Show your support

Give a ⭐️ if you liked this project and ☕ for me if you loved it!

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](ko-fi.com/an1cu12)
