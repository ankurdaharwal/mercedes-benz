import React, { useEffect, useState } from "react";

import Sound from "react-sound";
import BGMusic from "./assets/bg_music.mp3";

import "./App.css";

// Components
import MintMercedesBenz from "./Components/MintMercedesBenz";
import LoadingIndicator from "./Components/LoadingIndicator";

const App = () => {
  // State
  const [currentAccount, setCurrentAccount] = useState(null);
  const [isValidChainId, setIsValidChainId] = useState(null);
  const [metaMaskMsg, setMetaMaskMsg] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Actions
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        setIsLoading(false);
        setMetaMaskMsg(true);
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        setIsLoading(false);
        console.log("No authorized account found");
      }

      /**********************************************************/
      /* Handle chain (network) and chainChanged (per EIP-1193) */
      /**********************************************************/

      const chainId = await ethereum.request({ method: "eth_chainId" });
      handleChainChanged(chainId);

      ethereum.on("chainChanged", handleChainChanged);

      function handleChainChanged(_chainId) {
        if (_chainId !== "0x13881") {
          setIsValidChainId(false);
        } else setIsValidChainId(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * Implement your connectWallet method here
   */
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Download Metamask Chrome Extension!");
        window.open(
          "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn",
          "_blank"
        );
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  // Render Methods
  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    }

    /*
     * Scenario #1 - no account found / wallet not connected
     */
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            CONNECT WALLET TO START
          </button>
        </div>
      );
      /*
       * Scenario #2 - account found and no NFT found
       */
    } else if (!isValidChainId) {
      return (
        <div className="error">
          Click{" "}
          <a
            href="https://chainlist.org/?testnets=true&search=mumbai"
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>{" "}
          to add Polygon (Mumbai) to MetaMask and manually switch on Metamask
        </div>
      );
    } else if (currentAccount && isValidChainId) {
      return <MintMercedesBenz />;
    }
  };

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

  /*
   * Add this useEffect right under the other useEffect where you are calling checkIfWalletIsConnected
   */
  useEffect(() => {
    /*
     * We only want to run this, if we have a connected wallet
     */
    if (currentAccount) {
      console.log("CurrentAccount:", currentAccount);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="sound-box">
          <span
            className="sound-toggle-no-animation"
            onClick={() => setIsPlaying(!isPlaying ? true : false)}
          >
            {isPlaying ? "🔊" : "🔇"}
          </span>
          <span className="sound-toggle-no-animation">
            <a
              href={"https://testnets.opensea.io/collection/mercedesbenz-10"}
              target="_blank"
              rel="noreferrer"
            >
              ⛵
            </a>
          </span>
        </div>
        <div className="error">
          {metaMaskMsg ? "You need a MetaMask wallet to mint your NFT!" : ""}
        </div>
        <div className="header glow-text gradient-text">
          <img
            className="logo"
            src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.freebiesupply.com%2Flogos%2Flarge%2F2x%2Fmercedes-benz-9-logo-png-transparent.png&f=1&nofb=1&ipt=d181bfdeae43d3f63f848872a9fdcfe441776fa263930357952821c8fb024b28&ipo=images"
            alt="Mercedes Benz"
          ></img>
          Mercedes-Benz
          <p className="sub-text">The Best or Nothing!</p>
        </div>
        {renderContent()}
      </div>
      <Sound
        url={BGMusic}
        playStatus={isPlaying ? Sound.status.PLAYING : Sound.status.STOPPED}
        volume={20}
        loop
      />
      <div className="footer-container">
        <div className="footer-text"></div>
        &copy; 2023 Mercedes Benz NFTs made with 💙 by{" "}
        <b>
          <a
            href="https://ankurdaharwal.wixsite.com/blockchain"
            target="_blank"
            rel="noreferrer"
          >
            An1cu12
          </a>
        </b>
      </div>
    </div>
  );
};

export default App;
