import React from "react";
import {Box} from '@mui/material' 
const Banner = ({title,text}) => {
    return (
        <>
            <Box className="banner-image-container">
                <img src="https://img.freepik.com/free-vector/happy-people-run-rush-buy-sale_107791-12722.jpg?w=996&t=st=1686980842~exp=1686981442~hmac=e3bfd8d6d68f9e1b6dbcb5d3424a6de4410be24d58179f9454f5d5846af2e891" />
                <Box className="overlay">
                    <h1 className="text">{title||'#Cart'}</h1>
                    <h4 className="text-t2">{text||'Add Your coupen code & SAVE upto 70%'}</h4>
                </Box>
            </Box>
        </>
    )
}

export default Banner;