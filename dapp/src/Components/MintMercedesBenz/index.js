/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Sound from "react-sound";
import "./MintMercedesBenz.css";
import { ethers } from "ethers";

import LoadingIndicator from "../LoadingIndicator";

import MintSound from "../../assets/select_click.wav";

import { CONTRACT_ADDRESS, MAX_MINT_COUNT, API_URL } from "../../constants";
import MercedesBenzNFTs from "../../utils/MercedesBenz.json";

const MintMercedesBenz = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [mercedesBenzContract, setMercedesBenzContract] = useState(null);
  const [minterAddress, setMinterAddress] = useState(null);
  const [mintStatus, setMintStatus] = useState(false);
  const [mintCount, setMintCount] = useState(false);
  const [userNFT, setUserNFT] = useState(null);
  const [tokenURI, setTokenURI] = useState(null);
  const [imageURI, setImageURI] = useState(null);
  const [nricDbData, setNricDbData] = useState(null);
  const [mintingNFT, setMintingNFT] = useState(false);

  // UseEffect
  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const mercedesBenzContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        MercedesBenzNFTs.abi,
        signer
      );

      /*
       * Set our mercedesBenzContract in state.
       */
      setMercedesBenzContract(mercedesBenzContract);
      setMinterAddress(signer.getAddress());
    } else {
      console.log("Ethereum object not found");
    }
  }, []);

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setNricDbData(data.nrics);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  // Actions

  useEffect(() => {
    const userHasNFT = async () => {
      // check existing user NFT
      const mercedesBenzUserNFT =
        await mercedesBenzContract.checkIfUserHasNFT();
      console.log("Mercedes Benz User NFT: ", mercedesBenzUserNFT.toNumber());
      setUserNFT(mercedesBenzUserNFT.toNumber());
      console.log("User NFT: ", userNFT);
      if (userNFT) {
        setTokenURI(await mercedesBenzContract.tokenURI(userNFT - 1));
        console.log("Token URI: ", tokenURI);
        getNFTMetadata();
      }
    };
    if (mercedesBenzContract) {
      userHasNFT();
    }
  }, [mercedesBenzContract, userNFT, tokenURI]);

  useEffect(() => {
    const isMintingLive = async () => {
      if (mercedesBenzContract) {
        // fetch mint start and end time from contract and check minting status
        const config = await mercedesBenzContract.config();
        console.log("Config: ", config);
        setMintStatus(
          await mercedesBenzContract.isMintingLive(
            config.mintStartTime,
            config.mintEndTime
          )
        );
        console.log("Is minting live: ", mintStatus);

        // fetch total mint count from contract
        const count = await mercedesBenzContract.totalSupply();
        console.log("Mint Count: ", count.toNumber());
        setMintCount(count.toNumber());
      }
    };
    if (mercedesBenzContract) {
      console.log(nricDbData);
      isMintingLive();
    }
  }, [mercedesBenzContract, mintStatus, userNFT]);

  useEffect(() => {
    /*
     * Add a callback method that will fire when this event is received
     */
    const onNFTMint = async (sender, tokenId) => {
      console.log(
        `MercedesBenzNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()}`
      );

      /*
       * Once our mercedes benz NFT is minted we can fetch the metadata from our contract
       */
      if (mercedesBenzContract) {
        const mercedesBenzUserNFT =
          await mercedesBenzContract.checkIfUserHasNFT();
        console.log("Mercedes Benz User NFT: ", mercedesBenzUserNFT);
        setUserNFT(mercedesBenzUserNFT);
        console.log("User NFT: ", userNFT);
      }
    };

    if (mercedesBenzContract) {
      /*
       * Setup NFT Minted Listener
       */
      mercedesBenzContract.on("MercedesBenzNFTMinted", onNFTMint);
    }

    return () => {
      /*
       * When your component unmounts, let's make sure to clean up this listener
       */
      if (mercedesBenzContract) {
        mercedesBenzContract.off("MercedesBenzNFTMinted", onNFTMint);
      }
    };
  }, [mercedesBenzContract, userNFT]);

  const getNFTMetadata = async () => {
    try {
      let response = await fetch(tokenURI);
      let responseJson = await response.json();
      setImageURI(responseJson.image);
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async (data) => {
    console.log("Submitting NRIC: ", data.nric);
    console.log("Minter Address: ", minterAddress);
    try {
      if (mercedesBenzContract) {
        setMintingNFT(true);
        console.log("Minting mercedes-benz NFT in progress...");
        const mintTxn = await mercedesBenzContract.mint();
        await mintTxn.wait();
        console.log("mintTxn:", mintTxn);
        setMintingNFT(false);
      }
    } catch (error) {
      console.warn("MintCarAction Error:", error);
      setMintingNFT(false);
    }
  };

  // Render Methods
  const renderMintingForm = () => (
    <form className="mint-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="input-container">
        <label className="label">
          Enter your NRIC<sup className="sup">*</sup>
          <input
            className="input-nric"
            name="nric"
            type="text"
            placeholder="Enter your NRIC here"
            {...register("nric", {
              required: true,
              pattern: /^[STFG]\d{7}[A-Z]$/i,
            })}
          />
          {errors.nric?.type === "required" && (
            <p className="form-error" role="alert">
              NRIC is required
            </p>
          )}
          {errors.nric?.type === "pattern" && (
            <p className="form-error" role="alert">
              Incorrect NRIC
            </p>
          )}
        </label>
      </div>
      <input
        type="submit"
        hidden={!mintStatus || mintCount >= MAX_MINT_COUNT}
        className="cta-button mint-button"
        value="Mint Mercedes Benz NFT"
      />
    </form>
  );

  return (
    <>
      <div className="mint-container">
        {!userNFT && <div className="mint-form">{renderMintingForm()}</div>}
        {/* Only show our loading state if mintingCar is true */}
        {mintingNFT && (
          <div className="loading">
            <div className="indicator">
              <LoadingIndicator />
              <p>Minting In Progress...</p>
            </div>
          </div>
        )}
      </div>
      {!userNFT && (
        <div className="mint-status-label">
          Mint Status: {mintStatus}{" "}
          <span className="mint-status">
            {" "}
            {mintStatus && mintCount < MAX_MINT_COUNT
              ? "Live 🟢"
              : "Not Live 🔴"}
          </span>
          <Sound
            url={MintSound}
            playStatus={
              mintingNFT ? Sound.status.PLAYING : Sound.status.STOPPED
            }
            volume={60}
          />
        </div>
      )}
      {userNFT && (
        <div className="user-nft">
          <p className="user-nft-text">
            You own this limited edition Mercedes Benz NFT!
          </p>
          <img
            className="user-nft-image"
            src={imageURI}
            alt="Mercedes Benz NFT"
          />
        </div>
      )}
    </>
  );
};
export default MintMercedesBenz;
