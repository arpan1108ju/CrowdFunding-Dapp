import React from 'react'
import { createAvatar } from '@dicebear/core';
import { bottts } from '@dicebear/collection';


const CustomAvatar = ({seed}) => {
    const avatar = createAvatar(bottts, {
        seed: seed ? seed : "default",
        size : 96,
        backgroundColor : '#d1d4f9',
        eyes : ["robocop"],
        face: ["round02"],
        mouth: ["diagram"],
        sides: ["antenna02"],
        top : ["radar"]
      }).toDataUri();

    return <img src={avatar} alt="avatar" />;
}

export default CustomAvatar