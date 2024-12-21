import React, { useState, useEffect } from 'react'

import {  } from '../components';
import { useStateContext } from '../context'
import DisplayPayments from '../components/DisplayPayments';
import DisplayPaymentsAnother from '../components/DisplayPaymentsAnother';

const Payment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [payments, setPayments] = useState([]);

  const { contract, getPaymentDetailsUser,account } = useStateContext();
  
  const title = account ? "All Payments of User " + account : "You are not logged in. To Log in connect wallet";
  
  const fetchPayments = async () => {
    setIsLoading(true);
    const data = await getPaymentDetailsUser(account);
    setPayments(data);
    setIsLoading(false);
  }

  useEffect(() => {

    if(contract) fetchPayments();
  }, [account, contract]);

  return (
    // <DisplayPayments 
    //   title={title}
    //   isLoading={isLoading}
    //   payments={payments}
    // />
     <DisplayPaymentsAnother
      title={title}
      isLoading={isLoading}
      payments={payments}
    />

  )
}

export default Payment