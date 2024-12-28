import React, { useState, useEffect } from 'react'

import { DisplayCampaigns,UserAccountProfile } from '../components';
import { useStateContext } from '../context'


const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const {contract, getUserCampaigns,account,balance } = useStateContext();

  const title = account ? "All Campaigns of User " + account : "You are not logged in. To Log in connect wallet";

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const data = await getUserCampaigns();
    setCampaigns(data);
    setIsLoading(false);
  }

  useEffect(() => {
    if(contract) fetchCampaigns();
  }, [account, contract]);

  return (
    <div>
      {account && <UserAccountProfile account={account} balance={balance} />}
      <DisplayCampaigns 
        title={title}
        isLoading={isLoading}
        campaigns={campaigns}
      />
    </div>
  )
}

export default Profile