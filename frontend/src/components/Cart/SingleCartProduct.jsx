import React from 'react';
import { Box,CardMedia, Typography,Button, InputBase} from '@mui/material';
import Bag from "../../assets/Home/bag.jpg"

const SingleCartProduct = ({data}) => {

  return (
    <Box sx={{display:'flex',height:'12rem',mb:'3rem',width:'95%',bgcolor:'white',borderRadius:'10px',boxShadow:'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px'}} >

        <Box flex={0.25} boxSizing={'border-box'} p='0.5rem' >
        <CardMedia
            sx={{ height: '100%',width:'100%',borderRadius:'10px' }}
            image={Bag}
            title="green iguana"
            />
        </Box>

        <Box flex={0.60} boxSizing={'border-box'} display={'flex'} flexDirection={'column'} pl='1rem'>
            <Box flex={0.25} display={'flex'} alignItems={'center'}>
                <Typography fontSize="1.5rem">Lenovo D-Series 19.5 Inch Full HD TN Panel</Typography>
            </Box>
            <Box flex={0.3}>
                <Typography fontSize={'.9rem'}>Response Time: 5 ms, 60 Hz Refresh Rate</Typography>
                <Typography fontSize={'1.1rem'}>Adidas</Typography>
            </Box>
            <Box flex={0.2}>
                <Typography>Free Delivery worth ₹40</Typography>
            </Box>
            <Box flex={0.25}>
                <Typography>₹4000</Typography>
            </Box>
        </Box>

        <Box flex={0.15} display={'flex'} alignItems={'center'} justifyContent={'center'}>
            <Box>
                <Typography fontSize={'1.1rem'}>Delivery by</Typography>
                <Typography fontSize={'.7rem'} textAlign={'center'}>Mon Jun 12</Typography><br/>
                {/* <Typography fontSize={'18px'}> ₹11,998</Typography> */}
            </Box>
        </Box>

    </Box>
  )
}

export default SingleCartProduct