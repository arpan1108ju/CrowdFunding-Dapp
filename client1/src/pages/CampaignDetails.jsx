import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

import { useStateContext } from '../context';
import { CountBox, CustomButton, Loader } from '../components';
import { calculateBarPercentage, daysLeft, isAmountEqual, isEqual, timeDifference } from '../utils';
import { thirdweb } from '../assets';
import { toast } from 'react-toastify';
import CustomTooltip from '../components/CustomTooltip';
import CustomAvatar from '../components/CustomAvatar';

const CampaignDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { donate, getDonations, contract, account,balance,withdraw,cancel } = useStateContext();

  const campaignState = JSON.parse(state);

  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [donators, setDonators] = useState([]);

  const remainingDays = daysLeft(campaignState.deadline);
  
  const fetchDonators = async () => {
    const data = await getDonations(campaignState.pId);
    setDonators(data);
  }

  useEffect(() => {
    if(contract) fetchDonators();

    // console.log('time diff = ',timeDifference(campaignState.deadline));
    // console.log('Now      ',Date.now());
    // console.log('Deadline ',new Date(campaignState.deadline).getTime());

  }, [contract, account])


  const handleDonate = async () => {

    if(amount.length === 0){
       toast.error("Amount not provided");
       return;
    }

    setIsLoading(true);

    const success = await donate(campaignState.pId, amount); 
    setIsLoading(false);
    setAmount('');
    if(success) navigate('/');
  }

  const handleWithdraw = async () => {
    setIsLoading(true);

    const success = await withdraw(campaignState.pId); 

    setIsLoading(false);
    setAmount('');
    if(success) navigate('/');

  }

  const handleCancel = async () => {
    setIsLoading(true);

    const success = await cancel(campaignState.pId); 
    setIsLoading(false);
    setAmount('');
    if(success) navigate('/');

  }

  const isSufficient = (_balance,_amount) => {
      return Number(_balance) >= Number(_amount);
  }

  const deadline_reached = () => {
     return timeDifference(campaignState.deadline) <= 0;
  }

  const isFundDisabled = isLoading || !account || isAmountEqual(campaignState.amountCollected,campaignState.target) || !isSufficient(balance,amount) || deadline_reached() || campaignState.canceled;
  const isWithdrawDisabled = isLoading || !account || !isEqual(account,campaignState.owner) || !deadline_reached() || campaignState.withdrawn;
  const isCancelDisabled = isLoading || !account || !isEqual(account,campaignState.owner) || deadline_reached() || campaignState.canceled;

  const getFundButtonTooltip = () => {
    if (isLoading) return "Loading... Please wait.";
    if (!account) return "Connect your wallet to fund the campaign.";
    if (isAmountEqual(campaignState.amountCollected,campaignState.target)) return "Goal already reached.";
    if (!isSufficient(balance,amount)) return "Balance insufficient";
    if (deadline_reached()) return "Campaign deadline has passed.";
    if (campaignState.canceled) return "This campaign has been canceled.";
    return ""; // No tooltip if the button is enabled
  };

  const getWithdrawButtonTooltip = () => {
    if (isLoading) return "Loading... Please wait.";
    if (!account) return "Connect your wallet to fund the campaign.";
    if (!isEqual(account, campaignState.owner)) return "Only the campaign owner can withdraw funds.";
    if (!deadline_reached()) return "Funds can only be withdrawn after the campaign ends.";
    if (campaignState.withdrawn) return "Funds have already been withdrawn.";
    return ""; // No tooltip if the button is enabled
  };
  
  const getCancelButtonTooltip = () => {
    if (isLoading) return "Loading... Please wait.";
    if (!account) return "Connect your wallet to fund the campaign.";
    if (!isEqual(account, campaignState.owner)) return "Only the campaign owner can cancel the campaign.";
    if (deadline_reached()) return "Cannot cancel a campaign after the deadline.";
    if (campaignState.canceled) return "This campaign has already been canceled.";
    return ""; // No tooltip if the button is enabled
  };
  
  // Assign tooltip values
  const fundButtonTooltip = getFundButtonTooltip();
  const withdrawButtonTooltip = getWithdrawButtonTooltip();
  const cancelButtonTooltip = getCancelButtonTooltip();
  


  return (
    <div>
      {isLoading && <Loader />}

      <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
        <div className="flex-1 flex-col">
          <img src={campaignState.image} alt="campaign" className="w-full h-[410px] object-cover rounded-xl"/>
          <div className="w-full h-[5px] bg-[#3a3a43] mt-2">
            <div className="h-full bg-[#4acd8d]" style={{ width: `${calculateBarPercentage(campaignState.target, campaignState.amountCollected)}%`, maxWidth: '100%'}}>
            </div>
          </div>
        </div>

        <div className="flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]">
          <CountBox title="Days Left" value={remainingDays} />
          <CountBox title={`Raised of ${campaignState.target}`} value={campaignState.amountCollected} />
          <CountBox title="Total Backers" value={donators.length} />
        </div>
      </div>

      <div className="mt-[60px] flex lg:flex-row flex-col gap-5">
        <div className="flex-[2] flex flex-col gap-[40px]">
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Creator</h4>

            <div className="mt-[20px] flex flex-row items-center flex-wrap gap-[14px]">
              <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full mb-2 cursor-pointer">
                <CustomAvatar seed={campaignState.owner} />
              </div>
              <div>
                <h4 className="font-epilogue font-semibold text-[14px] text-white break-all">{campaignState.owner}</h4>
                <p className="mt-[4px] font-epilogue font-normal text-[12px] text-[#808191]">10 Campaigns</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Story</h4>

              <div className="mt-[20px]">
                <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">{campaignState.description}</p>
              </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Donators</h4>

              <div className="mt-[20px] flex flex-col gap-4">
                {donators.length > 0 ? donators.map((item, index) => (
                  <div key={`${item.donator}-${index}`} className="flex justify-between items-center gap-4">
                    <p className="font-epilogue font-normal text-[16px] text-[#b2b3bd] leading-[26px] break-ll">{index + 1}. {item.donator}</p>
                    <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] break-ll">{item.donation}</p>
                  </div>
                )) : (
                  <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">No donators yet. Be the first one!</p>
                )}
              </div>
          </div>
        </div>

        <div className="flex-1">
          <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Fund</h4>   

          <div className="mt-[20px] flex flex-col p-4 bg-[#1c1c24] rounded-[10px]">
            <p className="font-epilogue fount-medium text-[20px] leading-[30px] text-center text-[#808191]">
              Fund the campaign
            </p>
            <div className="mt-[30px]">
              <input 
                type="number"
                placeholder="ETH 0.1"
                step="0.01"
                className="w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[18px] leading-[30px] placeholder:text-[#4b5264] rounded-[10px]"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <div className="my-[20px] p-4 bg-[#13131a] rounded-[10px]">
                <h4 className="font-epilogue font-semibold text-[14px] leading-[22px] text-white">Back it because you believe in it.</h4>
                <p className="mt-[20px] font-epilogue font-normal leading-[22px] text-[#808191]">Support the project for no reward, just because it speaks to you.</p>
              </div>
              
                <CustomTooltip hidden={!isFundDisabled} name={isFundDisabled ? fundButtonTooltip : ""} >
                  <CustomButton 
                    btnType="button"
                    title="Fund Campaign"
                    styles="w-full bg-[#8c6dfd] mb-4 "
                    handleClick={handleDonate}
                    disabled={isFundDisabled}
                  />
                </CustomTooltip>

                <CustomTooltip hidden={!isWithdrawDisabled} name={isWithdrawDisabled ? withdrawButtonTooltip : ""} >
                  <CustomButton 
                    btnType="button"
                    title="Withdraw"
                    styles="w-full bg-[#fc8403] mb-4"
                    handleClick={handleWithdraw}
                    disabled={isWithdrawDisabled}
                  />
                </CustomTooltip>

                <CustomTooltip hidden={!isCancelDisabled} name={isCancelDisabled ? cancelButtonTooltip : ""} >
                  <CustomButton 
                    btnType="button"
                    title="Cancel"
                    styles="w-full bg-[#fc1803] mb-4 "
                    handleClick={handleCancel}
                    disabled={isCancelDisabled}
                  />
                </CustomTooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CampaignDetails