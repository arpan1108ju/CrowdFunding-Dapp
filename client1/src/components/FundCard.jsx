import React, { useEffect, useState } from 'react';

import { tagType, thirdweb } from '../assets';
import { daysLeft, getFormattedTime, isAmountEqual, timeDifference } from '../utils';
import CustomAvatar from './CustomAvatar';

const FundCard = ({ owner, title, description,campaignType, target, deadline, amountCollected, image, handleClick, canceled, withdrawn }) => {
  const remainingDays = daysLeft(deadline);

  const [color, setColor] = useState(null);
  const [status,setStatus] = useState(null);
  const [time,setTime] = useState(getFormattedTime(0));

  const setCampaignStatus = () => { 
     if(canceled) {
      setStatus('Canceled');
      setColor('#dc3545');
     }
     else if(timeDifference(deadline) < 0){
        setStatus('Completed');
        setColor('#28a745');
     }
     else if(isAmountEqual(target,amountCollected)){
        setStatus('Goal reached');
        setColor('#2bf3f7');
     }
     else{
        setStatus('Ongoing');
        setColor('#FFFF00');
     }
  }

  const updateTime = () => {
     let diff = timeDifference(deadline);
     if(diff > 0){
       setTime(getFormattedTime(diff));
     }
  }
  
  setInterval(updateTime,1000);

  
  useEffect(()=>{
    setCampaignStatus();
  })


  return (
    <div className="sm:w-[288px] w-full rounded-[15px] bg-[#1c1c24] cursor-pointer" onClick={handleClick}>
      <img src={image} alt="fund" className="w-full h-[158px] object-cover rounded-[15px]" />

      <div className="flex flex-col p-4">
        <div className="flex flex-row justify-between mb-[18px]">
          <div className="flex flex-row items-center">
            <img src={tagType} alt="tag" className="w-[17px] h-[17px] object-contain" />
            <p className="ml-[12px] mt-[2px] font-epilogue font-medium text-[12px] text-[#808191]">{campaignType}</p>
          </div>
          <span className="ml-[12px] font-epilogue font-bold text-[18px]" style={{ color }}>{status}</span>
        </div>

        <div className="block">
          <h3 className="font-epilogue font-semibold text-[16px] text-white text-left leading-[26px] truncate">{title}</h3>
          <p className="mt-[5px] font-epilogue font-normal text-[#808191] text-left leading-[18px] truncate">{description}</p>
        </div>

        <div className="flex justify-between flex-wrap mt-[15px] gap-2 ">
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd] leading-[22px]">{amountCollected}</h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate">Raised of {target}</p>
          </div>
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd] leading-[22px] text-right">{time}</h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate">Time Left</p>
          </div>
        </div>

        <div className="flex items-center mt-[20px] gap-[12px]">
          <div className="w-[30px] h-[30px] rounded-full flex justify-center items-center bg-[#13131a]">
          <CustomAvatar seed={owner} />
          </div>
          <p className="flex-1 font-epilogue font-normal text-[12px] text-[#808191] truncate">by <span className="text-[#b2b3bd]">{owner}</span></p>
        </div>
      </div>
    </div>
  )
}

export default FundCard