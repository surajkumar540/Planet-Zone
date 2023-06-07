import React from 'react';
import { Box,CardMedia, Typography} from '@mui/material';
import Bag from "../../assets/Home/bag.jpg"

const SingleCartProduct = ({data}) => {

  return (
    <Box sx={{display:'flex',height:'20rem',width:'90%',bgcolor:'white',borderRadius:'10px',boxShadow:'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px',cursor:'pointer'}} >

        <Box flex={0.25} boxSizing={'border-box'} p='0.5rem' >
        <CardMedia
            sx={{ height: '100%',width:'100%',borderRadius:'10px' }}
            image={Bag}
            title="green iguana"
            />
        </Box>

        <Box bgcolor={'gainsboro'} flex={0.55} boxSizing={'border-box'} display={'flex'} flexDirection={'column'}>
            <Box bgcolor={'lightskyblue'} flex={0.25} display={'flex'} alignItems={'center'}>
                <Typography>Lenovo D-Series 19.5 Inch Full HD TN Panel with Fully Adju</Typography>
            </Box>
            <Box bgcolor={'lightslategrey'} flex={0.2}>
                <Typography>Response Time: 5 ms, 60 Hz Refresh Rate</Typography>
            </Box>
            <Box bgcolor={'lightgoldenrodyellow'} flex={0.15}>
                <Typography>Adidas</Typography>
            </Box>
            <Box bgcolor={'lightpink'} flex={0.15}>
                <Typography>Lenovo D-Series 19.5 Inch Full HD TN Panel with Fully Adju</Typography>
            </Box>
            <Box bgcolor={'lightgreen'} flex={0.25}>
                <Typography>Lenovo D-Series 19.5 Inch Full HD TN Panel with Fully Adju</Typography>
            </Box>
        </Box>

        <Box flex={0.2} display={'flex'} alignItems={'center'} justifyContent={'center'}>
            <Box bgcolor={'pink'}>
                <Typography>Delivery by Mon Jun 12</Typography>
                <Typography><del>₹21,580</del> ₹11,998</Typography>
            </Box>
        </Box>

    </Box>
  )
}

export default SingleCartProduct