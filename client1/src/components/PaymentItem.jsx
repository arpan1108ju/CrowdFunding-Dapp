import React from 'react';

import { tagType, thirdweb } from '../assets';
import { daysLeft } from '../utils';

const PaymentItem = ({ pId,amount,timestamp,isDonation }) => {
  return (
    <div className="w-[288px] md:w-full h-16 text-center  rounded-[15px] bg-[#1c1c24] cursor-pointer" >
        <p className='text-white w-full h-full p-5'>  {pId}  |  {amount} | {timestamp} | {isDonation?'donation':'withdrawal'}  </p>
    </div>
  )
}

export default PaymentItem