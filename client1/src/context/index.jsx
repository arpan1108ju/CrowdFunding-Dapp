import React, { useContext, createContext, useState } from 'react';

import { ethers } from 'ethers';

import abi from "../utils/CrowdFunding_abi.json";
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";
import { CROWDFUNDING_CONTRACT_ADDRESS } from "../utils/constants";
import { convertTimeToMs } from '../utils';


const StateContext = createContext();

export const StateContextProvider = ({ children }) => {

// Module-level variables to store provider, signer, and contract

const [provider, setProvider] = useState(null);
const [signer, setSigner] = useState(null);
const [contract, setContract] = useState(null);
const [account, setAccount] = useState(null);


// Function to initialize the provider, signer, and contract
const initialize = async () => {

  console.log('before init')

  if (typeof window.ethereum !== "undefined") {
    const new_provider = new BrowserProvider(window.ethereum);
    const new_signer = await new_provider.getSigner();
    const new_contract = new Contract(CROWDFUNDING_CONTRACT_ADDRESS, abi.abi, new_signer);

    setProvider(new_provider);
    setSigner(new_signer);
    setContract(new_contract);

    console.log('Got provider',new_provider);
    console.log('Got signer',new_signer);
    console.log('Got contract',new_contract);
    

  } else {
    console.error("Please install MetaMask!");
  }
};

// Initialize once when the module is loaded
// initialize();


const requestAccount = async () => {
  try {
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
    console.log('Got address',accounts[0]);
    return accounts[0]; // Return the first account
  } catch (error) {
    console.error("Error requesting account:", error.message);
    return null;
  }
};
    

  const createCampaign = async (form) => {
    console.log('creating...')
    console.log('Got date ',form.deadline);
    console.log('Got time ',convertTimeToMs(form.time));
    let deadline_to_send = new Date(form.deadline).getTime() + convertTimeToMs(form.time);
    deadline_to_send = Math.round(deadline_to_send / 1000);

    console.log('total ',deadline_to_send);

    try {

      const data = await contract.createCampaign(
					account, 
					form.title, 
					form.description, 
					form.target,
					deadline_to_send, 
					form.image);

        await data.wait();

      console.log("contract call success", data)
    } catch (error) {
      alert('Failed to create contract');
      console.log("contract call failure", error)
    }
  }


   const donate = async (campaignId, amount) => {
    try {
      const tx = await contract.donateToCampaign(campaignId, {
        value: ethers.parseEther(amount),
      });
  
      await tx.wait();
      alert("Donation successful!");
    } catch (error) {
      alert("Failed to donate!");
      console.error("Error donating:", error);
    }
  };

  const withdraw = async (campaignId) => {
    console.log('In withdraw got ',campaignId);
    try {
      const tx = await contract.withdraw(campaignId);
      await tx.wait();
      alert("Withdrawn successful!");
    } catch (error) {
      alert("Failed to withdraw!");
      console.error("Error withdraw(No worry ! console error enabled):", error);
    }
  };

  const cancel = async (campaignId) => {
    console.log('In Cancel got ',campaignId);
    try {
      const tx = await contract.cancelCampaign(campaignId);
      await tx.wait();
      alert("Cancelation successful!");
    } catch (error) {
      alert("Failed to cancel!");
      console.error("Error cancel(No worry ! console error enabled):", error);
    }
  };
  
  // Fetch All Campaigns
  const getCampaigns = async () => {
    try {
      console.log('getting campaigns ...')
      const campaigns = await contract.getCampaigns();

      console.log('here got ')
      console.log(`${campaigns}`);

      return campaigns.map((campaign, i) => {
        return {
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            target: ethers.formatEther(campaign.target.toString()), // Ensure BigInt is converted to string first
            deadline: new Date(Number(campaign.deadline) * 1000).toLocaleString(),
            amountCollected: ethers.formatEther(campaign.amountCollected.toString()), // Convert BigInt to string
            image: campaign.image,
            donators: campaign.donators,
            donations: campaign.donations.map((donation) => ethers.formatEther(donation.toString())), // Convert BigInt to string for each donation
            pId: i,
            canceled : campaign.canceled,
            withdrawn : campaign.withdrawn
        };
    });    
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };
  // Fetch Donators of a Campaign
  const getDonations = async (campaignId) => {
    console.log(campaignId)
    try {
      const [donators, donations] = await contract.getDonators(campaignId);
    
      console.log("Donators:", donators);
      console.log("Donations:", donations);
      return donators.map((donator, i) => ({
        donator,
        donation: ethers.formatEther(donations[i].toString()),
      }));
    } catch (error) {
      console.error("Error fetching donators:", error);
    }
  }


  const getUserCampaigns = async (_account) => {
    try {

      if(!_account) throw new Error("Not logged in");

      const allCampaigns = await contract.getCampaigns();

      const filteredCampaigns = allCampaigns.filter((campaign) => {
        console.log(campaign.owner);
        console.log(_account); 
        return campaign.owner.toLowerCase() === _account.toLowerCase();
      }).map((campaign, i) => {
        return {
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            target: ethers.formatEther(campaign.target.toString()), // Ensure BigInt is converted to string first
            deadline: new Date(Number(campaign.deadline) * 1000).toLocaleString(),
            amountCollected: ethers.formatEther(campaign.amountCollected.toString()), // Convert BigInt to string
            image: campaign.image,
            donators: campaign.donators,
            donations: campaign.donations.map((donation) => ethers.formatEther(donation.toString())), // Convert BigInt to string for each donation
            pId: i,
            canceled : campaign.canceled,
            withdrawn : campaign.withdrawn
        };
    });
      
  
      return filteredCampaigns;

    } catch (error) {
      console.log("Error fetching campaigns:", error);
    }
  }

  const getPaymentDetailsUser = async (_account) => {
    try {
      if(!_account) throw new Error("Not logged in");

      const paymentDetails = await contract.paymentDetails(_account);

      console.log('here got in payment')
      console.log(`${paymentDetails}`);

      return paymentDetails.map( paymentDetail => {

        return {
            pId : Number(paymentDetail.campaignId).toString(),
            amount: ethers.formatEther(paymentDetail.amount.toString()), // Convert BigInt to string
            timestamp: new Date(Number(paymentDetail.timestamp) * 1000).toLocaleString(),
            isDonation: paymentDetail.isDonation
        };
    });    
    } catch (error) {
      console.log("Error fetching paymentDetails:", error);
    }
  }

 



//   const getUserCampaigns = async () => {
//     const allCampaigns = await getCampaigns();

//     const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);

//     return filteredCampaigns;
//   }


  const connect = async () => {
    try {
      const new_account = await requestAccount();
      setAccount(new_account);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  }

  const disconnect = async () => {
    try {
      setAccount(null);
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  }




  return (
    <StateContext.Provider
      value={{ 
        initialize,
        contract,
        account,
        connect,
        disconnect,
        createCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
        requestAccount,
        setAccount,
        getPaymentDetailsUser,
        withdraw,
        cancel
      }}
    >
      {children}
    </StateContext.Provider>
  )
}

export const useStateContext = () => useContext(StateContext);