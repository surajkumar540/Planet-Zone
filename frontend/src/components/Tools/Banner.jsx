import React from "react";
import {Box} from '@mui/material' 
const Banner = ({title,text}) => {
    return (
        <>
            <Box className="banner-image-container">
                <img src="https://img.freepik.com/free-vector/group-people-illustration_52683-34363.jpg?w=1060&t=st=1687100521~exp=1687101121~hmac=dee1c4a3e07a09ac1f07bf3f379b081ec56800ae20de71fb7379365f2d484c45" />
                {/* <img src="https://img.freepik.com/free-vector/people-waving-hand-illustration-concept_52683-29825.jpg?w=1060&t=st=1687100224~exp=1687100824~hmac=030323c8c0355d4bd4ed868cbbb901bf54d6c621cd19a329da29b2b6c69cfc85" /> */}
                <Box className="overlay">
                    <h1 className="text">{title||'#Cart'}</h1>
                    <h4 className="text-t2">{text||'Add Your coupen code & SAVE upto 70%'}</h4>
                </Box>
            </Box>
        </>
    )
}

export default Banner;