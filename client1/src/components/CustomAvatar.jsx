import React from 'react'
import { createAvatar } from '@dicebear/core';
import { bottts } from '@dicebear/collection';


const CustomAvatar = ({seed}) => {
    if(!seed) seed = "default";
    const avatar = createAvatar(bottts, {
        seed: seed,
        size : 96,
        backgroundColor : '#d1d4f9',
        eyes : ["robocop"],
        face: ["round02"],
        mouth: ["diagram"],
        sides: ["antenna02"],
        top : ["radar"]
      }).toDataUri();

    const svg = avatar.toString();
    
    return <img src={avatar} alt="avatar" />;
}

export default CustomAvatar