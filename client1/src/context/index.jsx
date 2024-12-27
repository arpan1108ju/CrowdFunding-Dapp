import React, { useContext, createContext, useState } from 'react';

import { ethers } from 'ethers';

import abi from "../utils/CrowdFunding_abi.json";
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";
import { CROWDFUNDING_CONTRACT_ADDRESS } from "../utils/constants";
import { convertTimeToMs, EVENTS, isEqual, reverseSortByPId, reverseSortByTimestamp } from '../utils';
import { toast } from 'react-toastify';





const StateContext = createContext();

export const StateContextProvider = ({ children }) => {

// Module-level variables to store provider, signer, and contract

const [provider, setProvider] = useState(null);
const [signer, setSigner] = useState(null);
const [contract, setContract] = useState(null);
const [account, setAccount] = useState(null);
const [balance,setBalance] = useState(null);


// Function to initialize the provider, signer, and contract
const initialize = async () => {

  if (typeof window.ethereum !== "undefined") {
    const new_provider = new BrowserProvider(window.ethereum);
    const new_signer = await new_provider.getSigner();
    const new_contract = new Contract(CROWDFUNDING_CONTRACT_ADDRESS, abi.abi, new_signer);

    setProvider(new_provider);
    setSigner(new_signer);
    setContract(new_contract);

  } else {
    toast.error("Please install MetaMask!");
    console.error("Please install MetaMask!");
  }
};

const handleBalanceChanged = async (_account) => {
  try {
    const balanceEther = ethers.formatEther(await provider.getBalance(_account));
    setBalance(balanceEther);
  } catch (error) {
    console.error('Error in fetching balance:',error.message);
  }
}

const requestAccount = async () => {
  await initialize();
  try {
    const accounts = await provider.send("eth_requestAccounts", []);
    const curr_account = accounts[0];
    setAccount(curr_account);
    await handleBalanceChanged(curr_account);
    console.log('Got address',accounts[0]);
    return accounts[0]; 
  } catch (error) {
    // toast.error(error.message);
    console.error("Error requesting account:", error.message);
    return null;
  }
};

    
  const check_for_account = () => {
     if(!account) throw new Error("Not logged in.");
  }


  const createCampaign = async (form) => {
    
    
    let deadline_to_send = new Date(form.deadline).getTime() + convertTimeToMs(form.time);
    deadline_to_send = Math.round(deadline_to_send / 1000);

    
    try {
      
      check_for_account();
      const data = await contract.createCampaign(
					account, 
					form.title, 
					form.description, 
          form.campaignType,
					form.target,
					deadline_to_send, 
					form.image);

        await data.wait();

      // console.log("contract call success", data);
    } catch (error) {
      
      if (error.message?.includes('revert')) {
        toast.error('Failed to create contract!');
        console.error('Function reverted!', error.message);  
      }
      else{
        toast.error('Failed to create contract!');
        console.error("contract call failure", error);
      }
      return false;
    }
    toast.success("Campaign created successfully");
    return true;
  }


   const donate = async (campaignId, amount) => {
     
     try {
      check_for_account();

      const tx = await contract.donateToCampaign(campaignId, {
        value: ethers.parseEther(amount),
      });
  
      await tx.wait();
     
      // alert("Donation successful!");
    } catch (error) {
      if (error.message?.includes('revert')) {
        toast.error(error.message);
        console.error('Function reverted!', error.message);  
      }
      else{
        toast.error('Failed to donate!');
        // toast.error(error.message);
        console.error("contract call failure", error);
      }
      return false;
    }
    toast.success("Donation successful");
    return true;
  };

  const withdraw = async (campaignId) => {
    
    try {
      check_for_account();
      const tx = await contract.withdraw(campaignId, {gasLimit: 500000});
      await tx.wait();
      // alert("Withdrawn successful!");

    } catch (error) {
      if (error.message?.includes('revert')) {
        toast.error('Failed to withdraw!');
        console.error('Function reverted!', error.message);  
      }
      else{
        toast.error('Failed to withdraw!');
        console.error("contract call failure", error);
      }
      return false;
    };

    toast.success("Withdrawan successful");

    return true;

  }

  const cancel = async (campaignId) => {
    
    try {
      check_for_account();
      const tx = await contract.cancelCampaign(campaignId);
      await tx.wait();
      toast.success("Cancelation successful!!"); 
    } catch (error) {
      if (error.message?.includes('revert')) {
        toast.error('Cancelation failed!');
        console.error('Function reverted!', error.message );  
      }
      else{
        toast.error('Failed to cancel contract!');
        console.error("contract call failure", error);
      }
      return false;
    }
    toast.success("Cancelation successful");
    return true;
  };
  
  // Fetch All Campaigns
  const getCampaigns = async () => {

    try {
      const campaigns = await contract.getCampaigns();
      const allCampaigns = campaigns.map((campaign, i) => {
        return {
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            campaignType : campaign.campaignType,
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
      return reverseSortByPId(allCampaigns);

    } catch (error) {
      toast.error("Error fetching campaigns");
      console.error("Error fetching campaigns:", error);
    }
  };
  
  const getDonations = async (campaignId) => {
    
    try {
      const [donators, donations] = await contract.getDonators(campaignId);
      return donators.map((donator, i) => ({
        donator,
        donation: ethers.formatEther(donations[i].toString()),
      }));
    } catch (error) {
      toast.error("Error fetching donators");
      console.error("Error fetching donators:", error);
    }
  }

  const getCampaignById = async (campaignId) => {
    
    try {
      const campaign = await contract.getCampaignById(campaignId);
      return {
        owner: campaign.owner,
        title: campaign.title,
        description: campaign.description,
        campaignType : campaign.campaignType,
        target: ethers.formatEther(campaign.target.toString()), // Ensure BigInt is converted to string first
        deadline: new Date(Number(campaign.deadline) * 1000).toLocaleString(),
        amountCollected: ethers.formatEther(campaign.amountCollected.toString()), // Convert BigInt to string
        image: campaign.image,
        donators: campaign.donators,
        donations: campaign.donations.map((donation) => ethers.formatEther(donation.toString())), // Convert BigInt to string for each donation
        pId: campaignId,
        canceled : campaign.canceled,
        withdrawn : campaign.withdrawn
    };
    } catch (error) {
      toast.error("Error fetching campaign");
      console.error("Error fetching campaign:", error);
    }
  }


  const getUserCampaigns = async () => {
    
    try {
      
      check_for_account();

      const allCampaigns = await contract.getCampaigns();

      const filteredCampaigns = allCampaigns.filter((campaign) => {
        return campaign.owner.toLowerCase() === account.toLowerCase();
      }).map((campaign, i) => {
        return {
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            campaignType : campaign.campaignType,
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
      
  
      return reverseSortByPId(filteredCampaigns);

    } catch (error) {
      toast.error("Error fetching campaigns");
      console.log("Error fetching campaigns:", error);
    }
  }

  const getPaymentDetailsUser = async () => {
    
    try {
      check_for_account();
      
      const paymentDetails = await contract.paymentDetails(account);
      const allPaymentDetails = paymentDetails.map( paymentDetail => {

        return {
            pId : Number(paymentDetail.campaignId).toString(),
            amount: ethers.formatEther(paymentDetail.amount.toString()), // Convert BigInt to string
            timestamp: new Date(Number(paymentDetail.timestamp) * 1000).toLocaleString(),
            paymentType: paymentDetail.paymentType
        };
    });    

    return reverseSortByTimestamp(allPaymentDetails);

    } catch (error) {
      toast.error("Error fetching paymentDetails");
      console.log("Error fetching paymentDetails:", error);
    }
  }


  const connect = async () => {
    try {
      const new_account = await requestAccount();
      setAccount(new_account);
    } catch (error) {
      toast.error("Failed to connect wallet");
      console.error("Failed to connect wallet:", error);
    }
  }

  const disconnect = async () => {
    try {
      setAccount(null);
    } catch (error) {
      toast.error("Failed to disconnect wallet");
      console.error("Failed to disconnect wallet:", error);
    }
  }


  //********************************** EVENT ******************************************* */
   const campaign_create_listener = async(numberOfCampaigns,_owner,_title,_target,_deadline,_image,event) => {  
    if(isEqual(_owner,account)){
      // toast.success('Campaign created successfully.');
      console.log('campaign_create_listener : ', {
         numberOfCampaigns,
         _owner,
         _title,
         _target,
         _deadline,
         _image
      })
    }
  }

   const donation_received_listener = async(_campaignId,_owner, _donator, _amount, event) => {
    if(isEqual(_donator,account) || isEqual(_owner,account)){
      // toast.success(`Donation received for id-${_campaignId} successfully.`);
      console.log('donation_received_listener : ', {
        _campaignId,
        _owner,
        _donator,
        _amount
        })
    }

  };

  const campaign_amount_updated_listener = async(_campaignId,_owner, _amountCollected, event) => {
    if(isEqual(_owner,account)){
      toast.info(`Campaign fund for id-${_campaignId} updated.`);
      console.log('campaign_amount_updated_listener : ', {
        _campaignId,
        _owner,
        _amountCollected
        })
    }
  };

  const funds_withdrawn_listener = async(_campaignId,_owner, _amount, event) => {
     if(isEqual(_owner,account)){
    // toast.success(`Fund is withdrawn for id-${_campaignId} successfully.`);
    console.log('funds_withdrawn_listener : ', {
      _campaignId,
      _owner,
      _amount
      })
    }
  };

  const campaign_canceled_listener = async(_campaignId,_owner, event) => {
     if(isEqual(_owner,account)){
    // toast.success(`Campaign with id-${_campaignId} canceled successfully.`);
    console.log('campaign_canceled_listener : ', {
      _campaignId,
      _owner
      })
    }
  };

  const donation_refunded_listener = async(_campaignId,_donor, event) => {
    if(isEqual(_donor,account)){
    toast.info(`Donation refunded for Campaign with id-${_campaignId}.`);
    console.log('donation_refunded_listener : ', {
      _campaignId,
      _donor
      })
   }
 };
  
  const add_event_listener = () => {
    if (contract) {
      contract.on(EVENTS.CAMPAIGN_CREATED, campaign_create_listener);
      contract.on(EVENTS.DONATION_RECEIVED, donation_received_listener);
      contract.on(EVENTS.CAMPAIGN_AMOUNT_UPDATED, campaign_amount_updated_listener);
      contract.on(EVENTS.FUNDS_WITHDRAWN, funds_withdrawn_listener);
      contract.on(EVENTS.CAMPAIGN_CANCELED, campaign_canceled_listener);
      contract.on(EVENTS.DONATION_REFUNDED, donation_refunded_listener);

  
    } else {
      // toast.warning("Contract not initialized for removal of listeners.");
      console.warn("Contract not initialized. Cannot add event listeners.");
    }
  };
  
  const remove_event_listener =  () => {
    if (contract) {
      contract.off(EVENTS.CAMPAIGN_CREATED, campaign_create_listener);
      contract.off(EVENTS.DONATION_RECEIVED, donation_received_listener);
      contract.off(EVENTS.CAMPAIGN_AMOUNT_UPDATED, campaign_amount_updated_listener);
      contract.off(EVENTS.FUNDS_WITHDRAWN, funds_withdrawn_listener);
      contract.off(EVENTS.CAMPAIGN_CANCELED, campaign_canceled_listener);
      contract.off(EVENTS.DONATION_REFUNDED, donation_refunded_listener);
  
    } else {
      // toast.warning("Contract not initialized for additon of listeners.");
      console.warn("Contract not initialized. Cannot remove event listeners.");
    }
  };
  
  return (
    <StateContext.Provider
      value={{ 
        initialize,
        contract,
        account,
        balance,
        connect,
        disconnect,
        createCampaign,
        getCampaigns,
        getCampaignById,
        getUserCampaigns,
        donate,
        getDonations,
        requestAccount,
        setAccount,
        handleBalanceChanged,
        getPaymentDetailsUser,
        withdraw,
        cancel,
        add_event_listener,
        remove_event_listener
      }}
    >
      {children}
    </StateContext.Provider>
  )
}

export const useStateContext = () => useContext(StateContext);