import React from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from "uuid";
import { loader } from '../assets';
import PaymentItem from './PaymentItem';

import { PencilIcon } from "@heroicons/react/24/solid";
import {
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardHeader,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Avatar,
  IconButton,
  Tooltip,
  Input,
} from "@material-tailwind/react";

 
let TABLE_HEAD = ["Campaign ID", "ETH", "Timestamp", "Type"];
 
let TABLE_ROWS = [
  {
    img: "https://docs.material-tailwind.com/img/logos/logo-spotify.svg",
    name: "Spotify",
    amount: "$2,500",
    date: "Wed 3:00pm",
    status: "paid",
    account: "visa",
    accountNumber: "1234",
    expiry: "06/2026",
  }
];

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

        {!isLoading && payments && payments.length !== 0 
         &&


<Card className="h-full w-full text-white">
      <CardBody className="">
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
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
                  pId,amount,timestamp,isDonation
                },
                index,
              ) => {
                const classes = "p-4 border-b border-blue-gray-50";
 
                return (
                  <tr key={timestamp}>
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
                        <div class="rounded-md bg-green-400 text-gray-100 py-0.5 px-2.5 border border-transparent text-sm font-bold transition-all shadow-sm">
                        {isDonation ? 'Donation' : 'Withdrawal'} 
                        </div> 
                      </div>
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </CardBody>
    </Card>

          }
      </div>
    </div>
  )
}

export default DisplayPaymentsAnother