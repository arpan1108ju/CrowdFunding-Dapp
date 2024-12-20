import React from "react";
// import { requestAccount } from "../utils/contractServices";
import { useStateContext } from "../context";

function ConnectWalletButton({ setAccount }) {

  const {requestAccount } = useStateContext();

  const connectWallet = async () => {
    try {
      const account = await requestAccount();
      setAccount(account);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return <button onClick={connectWallet}>Connect Web3 Wallet</button>;
}

export default ConnectWalletButton;