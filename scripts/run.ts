// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

// Default Mint settings - 10 minutes
const MINT_START_TIME = 20; // Seconds after which Mint goes live
const MINT_END_TIME = 620; // Seconds after which Mint ends

const main = async () => {
  const mercedesBenzContractFactory = await ethers.getContractFactory(
    "MercedesBenz"
  );
  const mercedesBenzContract = await mercedesBenzContractFactory.deploy(
    MINT_START_TIME,
    MINT_END_TIME
  );
  await mercedesBenzContract.deployed();
  console.log("Contract deployed to:", mercedesBenzContract.address);

  const baseURIConfirmation = await mercedesBenzContract.setBaseURI(
    "https://aquamarine-capitalist-newt-498.mypinata.cloud/ipfs/Qmb58ygG9oMmw7yjaj7gwVpJt3asRSaKd7vBucyGGE9ymA/",
    {
      gasLimit: 500_000,
    }
  );

  console.log(`SetBaseURI Tx Hash: ${baseURIConfirmation.hash}`);
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
