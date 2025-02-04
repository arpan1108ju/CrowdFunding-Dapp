import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { logo, sun , moon } from '../assets';
import { navlinks } from '../constants';
import CustomTooltip from './CustomTooltip';
import { useTheme } from '../context/ThemeContext';

const Icon = ({ styles, name, imgUrl, isActive, disabled, handleClick }) => (
  <CustomTooltip position="right" name={name}>
    <div 
      className={`relative group w-[48px] h-[48px] rounded-[10px] ${
        isActive && isActive === name && 'bg-[var(--sidebar-bg)]'
      } flex justify-center items-center ${
        !disabled && 'cursor-pointer'
      } ${styles}`} 
      onClick={handleClick}
    >
      {!isActive ? (
        <img src={imgUrl} alt={name} className="w-1/2 h-1/2" />
      ) : (
        <img 
          src={imgUrl} 
          alt={name} 
          className={`w-1/2 h-1/2 ${isActive !== name && 'grayscale'}`} 
        />
      )}
    </div>
  </CustomTooltip>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isActive, setIsActive] = useState('dashboard');
  const { isDarkMode, toggleTheme } = useTheme();

  // Update isActive when location.pathname changes
  useEffect(() => {
    const activeLink = navlinks.find(link => link.link === location.pathname);
    if (activeLink) {
      setIsActive(activeLink.name);
    }
  }, [location.pathname]);

  return (
    <div className="flex justify-between items-center flex-col sticky top-5 h-[93vh]">
      <Link to="/">
        <Icon name={"Home"} styles="w-[52px] h-[52px] bg-[#2c2f32]" imgUrl={logo} />
      </Link>

      <div className="flex-1 flex flex-col justify-between items-center bg-[#1c1c24] rounded-[20px] w-[76px] py-4 mt-12">
        <div className="flex flex-col justify-center items-center gap-3">
          {navlinks.map((link) => (
            <Icon 
              key={link.name}
              {...link}
              isActive={isActive}
              handleClick={() => {
                if (!link.disabled) {
                  setIsActive(link.name);
                  navigate(link.link);
                }
              }}
            />
          ))}
        </div>

        <Icon 
          styles="" 
          name={isDarkMode ? "Light Mode" : "Dark Mode"} 
          imgUrl={isDarkMode ? sun : moon} 
          handleClick={toggleTheme}
        />
      </div>
    </div>
  );
}

export default Sidebar;
