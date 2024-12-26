import React from 'react'

const UserAccountProfile = ({account,balance}) => {

  return (
    <div className='my-4'>
         <p className="font-epilogue font-semibold text-[16px] leading-[30px] text-[#a4d3d7]">Address : {account}</p>
         <p className="font-epilogue font-semibold text-[16px] leading-[30px] text-[#a4d3d7]">Balance : {balance} ETH</p>
    </div>
  )
}

export default UserAccountProfile