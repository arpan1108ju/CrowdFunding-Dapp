import React from 'react'
import { useStateContext } from '../context'
import { CustomButton } from '../components';
import { useNavigate } from 'react-router-dom';

const Logout = () => {

  const { disconnect,account } = useStateContext();

  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center mt-[40px]">
                <CustomButton 
                  btnType="submit"
                  title={account ? 'Log out' : 'Connect'}
                  styles={'bg-[#8c6dfd]'}
                  handleClick={() => {
                        if(account) disconnect();
                        navigate('/');
                  }}
                />
    </div>
  )
}

export default Logout