import React, { useState, useEffect } from 'react'

import { DisplayCampaigns } from '../components';
import { useStateContext } from '../context'
import { useLocation } from 'react-router-dom';

const Search = () => {

  const {state} = useLocation();

  const query = state.query;

  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const { contract, getCampaigns,account } = useStateContext();

  const fetchCampaigns = async () => {
    setIsLoading(true);
    let data = await getCampaigns();
    data = data.filter((camp) => camp.title === query);
    setCampaigns(data);
    setIsLoading(false);
  }

  useEffect(() => {

    if(contract) fetchCampaigns();
  }, [account, contract]);

  return (
    <DisplayCampaigns 
      title="Searched Campaigns"
      isLoading={isLoading}
      campaigns={campaigns}
    />
  )
}

export default Search