import React from 'react';
import { useNavigate } from 'react-router-dom';
import { loader } from '../assets';

import {
  Card,
  Typography,
  CardBody,
} from "@material-tailwind/react";
import { useStateContext } from '../context';
import { useTheme } from '../context/ThemeContext';

 
let TABLE_HEAD = ["Campaign ID", "ETH", "Timestamp", "Type"];
 

const DisplayPaymentsAnother = ({ title, isLoading, payments }) => {

  const navigate = useNavigate();

  const {getCampaignById} = useStateContext();
  const { isDarkMode } = useTheme();

  const handleTableRowClicked = async(campaignId) => {
     const campaign = await getCampaignById(campaignId);
     
    //  console.log('At payment got',campaign);
    navigate(`/campaign-details/${campaign?.title}`, { state: JSON.stringify(campaign) })
  }

    
    return (
      <div> 
      <h1 className="font-epilogue font-semibold text-[18px]  text-left">{title} ({payments?.length})</h1>

      <div className="flex flex-col mt-[20px] gap-[26px]">
        {isLoading && (
          <img src={loader} alt="loader" className="w-[100px] h-[100px] object-contain" />
        )}

        {!isLoading && payments && payments.length === 0 && (
          <p className="font-epilogue font-semibold text-[14px] leading-[30px] text-[#818183]">
            You have not done any payments yet
          </p>
        )}

        {!isLoading && payments && payments.length !== 0 
         && (
        <div className="h-full w-full ">
                <table className={`w-full min-w-max table-auto text-left border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                  <thead>
                    <tr>
                      {TABLE_HEAD.map((head) => (
                        <th
                          key={head}
                          className="bg-white/10 p-4"
                        >
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal leading-none opacity-70"
                          >
                            {head}
                          </Typography>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(
                      (
                        {
                          pId,amount,timestamp,paymentType
                        },
                        index,
                      ) => {
                        const classes = `p-4 border-y ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`;
                        return (
                          <tr key={timestamp} 
                            className={`hover:cursor-pointer ${isDarkMode ? 'hover:bg-slate-900' : 'hover:bg-slate-100'}`}
                            onClick={(e) => handleTableRowClicked(pId)} >
                            <td className={classes}>
                              <div className="flex items-center gap-3">
                                <Typography
                                  color="blue-gray"
                                  className="font-bold"
                                >
                                  {pId}
                                </Typography>
                              </div>
                            </td>
                            <td className={classes}>
                              <Typography
                                color="blue-gray"
                                className="font-normal"
                              >
                                {amount}
                              </Typography>
                            </td>
                            <td className={classes}>
                              <Typography
                                color="blue-gray"
                                className="font-normal"
                              >
                                {timestamp}
                              </Typography>
                            </td>
                            <td className={classes}>
                              <div className="w-max">

                                {
                                paymentType === "donation" ? 
                                  <div className="rounded-md bg-emerald-500 text-gray-100 py-0.5 px-2.5 border border-transparent text-sm font-bold transition-all shadow-sm">
                                    DONATION
                                  </div>
                                  : paymentType === "withdrawal" ? 
                                  <div className="rounded-md bg-yellow-400 text-gray-100 py-0.5 px-2.5 border border-transparent text-sm font-bold transition-all shadow-sm">
                                    WITHDRAWAL
                                  </div>
                                  : paymentType === "refund" ? 
                                  <div className="rounded-md bg-blue-400 text-gray-100 py-0.5 px-2.5 border border-transparent text-sm font-bold transition-all shadow-sm">
                                    REFUND
                                  </div>
                                  :
                                  <div className="rounded-md bg-slate-400 text-gray-100 py-0.5 px-2.5 border border-transparent text-sm font-bold transition-all shadow-sm">
                                    Blank
                                  </div>  
                                }

                      
                              </div>
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
            </div>
         )
          }
      </div>
    </div>
  )
}

export default DisplayPaymentsAnother