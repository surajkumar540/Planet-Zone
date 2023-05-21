import React from 'react';
import Box from "@mui/material/Box";
import { Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box bgcolor={'#25303F'} >
      <Box display={'flex'} boxSizing={'border-box'} py='3rem' px='1rem' justifyContent={'space-evenly'}>

      <Box flex='0.25' color='#7D8EA7'>
        <Typography variant='h5' sx={{fontWeight:600,my:'1rem',color:'white'}}>About</Typography>
        <Typography lineHeight={'2rem'}>About us</Typography>
        <Typography  lineHeight={'2rem'}>Delivery Information</Typography>
        <Typography  lineHeight={'2rem'}>Privacy Policy</Typography>
        <Typography  lineHeight={'2rem'}>Terms & Conditions</Typography>
        <Typography  lineHeight={'2rem'}>Contact Us</Typography>
      </Box>

      <Box flex='0.25' color='#7D8EA7'>
      <Typography variant='h5' sx={{fontWeight:600,my:'1rem',color:'white'}}>My Account</Typography>
        <Typography lineHeight={'2rem'}>Sign In</Typography>
        <Typography  lineHeight={'2rem'}>View Cart</Typography>
        <Typography  lineHeight={'2rem'}>My Wishlist</Typography>
        <Typography  lineHeight={'2rem'}>Track My Order</Typography>
        <Typography  lineHeight={'2rem'}>Help</Typography>
      </Box>
      <Box bgcolor={'pink'} flex='0.4'>
        <Typography variant='h5' sx={{fontWeight:600,my:'1rem',color:'white'}}>Shop</Typography>
      </Box>
      
      </Box>
    </Box>
  )
}

export default Footer