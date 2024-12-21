import React from 'react'

const CustomButton = ({ btnType, title, handleClick, styles,disabled }) => {
  return (
    <button
      type={btnType}
      className={`font-epilogue font-semibold text-[16px] leading-[26px] text-white min-h-[52px] px-4 rounded-[10px] ${styles}
       ${disabled && "cursor-not-allowed opacity-50"}
      `}
      onClick={handleClick}
      disabled={disabled}
    >
      {title}
    </button>
  )
}

export default CustomButton