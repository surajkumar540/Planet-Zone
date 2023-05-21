import React from 'react';
import Box from "@mui/material/Box";
import { IconButton, Typography } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

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
      <Box flex='0.4'  color='#7D8EA7'>
        <Typography variant='h5' sx={{fontWeight:600,my:'1rem',color:'white'}}>Shop</Typography>
        <Box>
          <Typography lineHeight={'2rem'} fontSize={'.9rem'}><Typography component={'span'} fontWeight={600}>Address : </Typography>5143 Delhi Tilak Market 110042</Typography>
        </Box>
        <Box>
          <Typography lineHeight={'2rem'} fontSize={'.9rem'}><Typography component={'span'} fontWeight={600}>Phone : </Typography>(+91) 145454548, (+91) 154545865</Typography>
        </Box>
        <Box>
          <Typography lineHeight={'2rem'} fontSize={'.9rem'}><Typography component={'span'} fontWeight={600}>Hours : </Typography>10:00 - 15:00 Mon - Sat</Typography>
        </Box>
        
        <Box mt='2rem'>
          <IconButton sx={{color:'white'}}>
            <FacebookIcon/>
          </IconButton>
          <IconButton  sx={{color:'white'}}>
            <TwitterIcon/>
          </IconButton>
          <IconButton  sx={{color:'white'}}>
            <InstagramIcon/>
          </IconButton>
          <IconButton  sx={{color:'white'}}>
            <YouTubeIcon/>
          </IconButton>
          <IconButton  sx={{color:'white'}}>
            <WhatsAppIcon/>
          </IconButton>
        </Box>

      </Box>

      </Box>
    </Box>
  )
}

export default Footer