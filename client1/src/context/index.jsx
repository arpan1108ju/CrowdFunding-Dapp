import React, { useContext, createContext, useState } from 'react';

import { ethers } from 'ethers';

import abi from "../utils/CrowdFunding_abi.json";
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";
import { CROWDFUNDING_CONTRACT_ADDRESS } from "../utils/constants";


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

// export const withdrawFund = async (withdrawValue) => {
    //   const ethValue = parseEther(withdrawValue);
    //   const withdrawTx = await contract.withdraw(ethValue);
    //   await withdrawTx.wait();
    //   console.log("Withdrawal successful!");
    // };
    

  const createCampaign = async (form) => {
    console.log('creating...')
    try {
      const data = await contract.createCampaign(
					account, 
					form.title, 
					form.description, 
					form.target,
					new Date(form.deadline).getTime(), 
					form.image);

        await data.wait();

      console.log("contract call success", data)
    } catch (error) {
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
      console.error("Error donating:", error);
      alert("Failed to donate!");
    }
  };
  //   const donate = async (pId, amount) => {
//     const data = await contract.call('donateToCampaign', [pId], { value: ethers.utils.parseEther(amount)});

//     return data;
//   }
  
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
            deadline: new Date(Number(campaign.deadline)).toLocaleString(),
            amountCollected: ethers.formatEther(campaign.amountCollected.toString()), // Convert BigInt to string
            image: campaign.image,
            donators: campaign.donators,
            donations: campaign.donations.map((donation) => ethers.formatEther(donation.toString())), // Convert BigInt to string for each donation
            pId: i
        };
    });    
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };
  //   const getCampaigns = async () => {
//     const campaigns = await contract.call('getCampaigns');

//     const parsedCampaings = campaigns.map((campaign, i) => ({
//       owner: campaign.owner,
//       title: campaign.title,
//       description: campaign.description,
//       target: ethers.utils.formatEther(campaign.target.toString()),
//       deadline: campaign.deadline.toNumber(),
//       amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
//       image: campaign.image,
//       pId: i
//     }));

//     return parsedCampaings;
//   }
  
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
    //   const getDonations = async (pId) => {
//     const donations = await contract.call('getDonators', [pId]);
//     const numberOfDonations = donations[0].length;

//     const parsedDonations = [];

//     for(let i = 0; i < numberOfDonations; i++) {
//       parsedDonations.push({
//         donator: donations[0][i],
//         donation: ethers.utils.formatEther(donations[1][i].toString())
//       })
//     }

//     return parsedDonations;
//   }


  const getUserCampaigns = async (_account) => {
    try {
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
            deadline: new Date(Number(campaign.deadline)).toLocaleString(),
            amountCollected: ethers.formatEther(campaign.amountCollected.toString()), // Convert BigInt to string
            image: campaign.image,
            donators: campaign.donators,
            donations: campaign.donations.map((donation) => ethers.formatEther(donation.toString())), // Convert BigInt to string for each donation
            pId: i
        };
    });
      
  
      return filteredCampaigns;

    } catch (error) {
      console.error("Error fetching campaigns:", error);
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
        setAccount
      }}
    >
      {children}
    </StateContext.Provider>
  )
}

export const useStateContext = () => useContext(StateContext);