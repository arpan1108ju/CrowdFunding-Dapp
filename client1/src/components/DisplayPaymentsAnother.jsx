import React from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from "uuid";
import { loader } from '../assets';
import PaymentItem from './PaymentItem';

const DisplayPaymentsAnother = ({ title, isLoading, payments }) => {

  return (
    <div> 
      <h1 className="font-epilogue font-semibold text-[18px] text-white text-left">{title} ({payments?.length})</h1>

      <div className="flex flex-col mt-[20px] gap-[26px]">
        {isLoading && (
          <img src={loader} alt="loader" className="w-[100px] h-[100px] object-contain" />
        )}

        {!isLoading && payments && payments.length === 0 && (
          <p className="font-epilogue font-semibold text-[14px] leading-[30px] text-[#818183]">
            You have not done any payments yet
          </p>
        )}



        {!isLoading && payments && payments.length > 0 && payments.map((payment) => <PaymentItem
          key={payment.timestamp}
          {...payment}
        />)}
      </div>
    </div>
  )
}

export default DisplayPaymentsAnother