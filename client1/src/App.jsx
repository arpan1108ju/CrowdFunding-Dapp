import React, { useState, useEffect } from "react";

import { useStateContext } from "./context";


import { Route, Routes } from 'react-router-dom';

import { Sidebar, Navbar } from './components';
import { CampaignDetails, CreateCampaign, Home, Profile } from './pages';
import Payment from "./pages/Payment";
import Search from "./pages/Search";



const App = () => {

  const { account, requestAccount , setAccount, add_event_listener,
    remove_event_listener , contract
   } = useStateContext();



  useEffect(() => {

    const fetchCurAccount = async () => {
      const _account = await requestAccount();
      setAccount(_account);
    };
    const handleAccountChanged = (newAccounts) => {
      setAccount(newAccounts.length > 0 ? newAccounts[0] : null);
    }


    fetchCurAccount();
    add_event_listener();

    // const f = async() => {
    //   if(contract) console.log("listeners count:",await contract.listenerCount());
    // }
    // f();


    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountChanged);
    }
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountChanged);
      remove_event_listener();
    };
  } ,[account]);

  return (
      <div className="relative sm:-8 p-4 bg-[#13131a] min-h-screen flex flex-row">

        <div className="sm:flex hidden mr-10 relative">
          <Sidebar />
        </div>

      <div className="flex-1 max-sm:w-full max-w-[1280px] mx-auto sm:pr-5">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home  />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-campaign" element={<CreateCampaign />} />
          <Route path="/campaign-details/:id" element={<CampaignDetails />} />
          <Route path="/search/:id" element={<Search />} />
          <Route path="/payment" element={<Payment />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;


{/* <div className="app">

      {!account ? (
        <ConnectWalletButton setAccount={setAccount} />
      ) : (
        <div className="contract-interactions">
          wallet connected
        </div>
      )}
      
    </div> */}