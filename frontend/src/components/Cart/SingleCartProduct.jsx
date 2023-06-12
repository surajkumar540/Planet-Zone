import React from 'react';
import { Box,CardMedia, Typography,Button, InputBase} from '@mui/material';
import Bag from "../../assets/Home/bag.jpg"

const SingleCartProduct = ({data}) => {

  return (
    <Box sx={{display:'flex',height:'11rem',mb:'3rem',width:'88%',bgcolor:'white',borderRadius:'10px',boxShadow:'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px'}} >

        <Box flex={0.2} boxSizing={'border-box'} p='0.5rem' >
        <CardMedia
            sx={{ height: '100%',width:'100%',borderRadius:'10px' }}
            image={Bag}
            title="green iguana"
            />
        </Box>

        <Box flex={0.58} boxSizing={'border-box'} display={'flex'} flexDirection={'column'} p='.5rem'>
            <Box flex={0.25} display={'flex'} alignItems={'center'}>
                <Typography fontSize="1.2rem">Lenovo D-Series 19.5 Inch Full HD TN Panel</Typography>
            </Box>
            <Box flex={0.3} display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}>
                <Typography fontSize={'.8rem'}>Response Time: 5 ms, 60 Hz Refresh Rate</Typography>
                <Typography fontSize={'.9rem'}>Adidas</Typography>
            </Box>
            <Box flex={0.2} display={'flex'} alignItems={'center'}>
                <Typography fontSize={'.8rem'} color='#388e3c'>Free Delivery worth ₹40</Typography>
            </Box>
            <Box flex={0.25}>
                <Typography fontWeight={600} fontSize={'1.1rem'}>₹5,499</Typography>
            </Box>
        </Box>

        <Box flex={0.22} p='.5rem'>
            <Box mt='.5rem'>
                <Typography>Delivery by <Typography as='span' fontWeight={600}>Jun 12, Mon</Typography></Typography>
                
            </Box>
        </Box>

    </Box>
  )
}

export default SingleCartProduct