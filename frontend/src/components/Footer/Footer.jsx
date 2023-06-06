import React from 'react';
import Box from "@mui/material/Box";
import { IconButton, Typography } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const Footer = () => {

  const footerText={
    lineHeight:'2rem',
    fontSize:{xs:'.8rem',sm:'1rem'}
  }

  return (
    <Box bgcolor={'#25303F'} position={'relative'}>
      <Box display={'flex'} boxSizing={'border-box'} py='3rem' px='1rem' justifyContent={'space-evenly'} flexDirection={{xs:'column',sm:'row'}}>

      <Box flex='0.25' color='#7D8EA7' display={'flex'} alignItems={'center'} flexDirection={'column'} textAlign={{xs:'center',sm:'left'}}>
        <Box>
        <Typography sx={{fontWeight:600,my:'1rem',color:'white',fontSize:{xs:'2rem',sm:'1.5rem'}}}>About</Typography>
        <Typography sx={footerText}>About us</Typography>
        <Typography  sx={footerText}>Delivery Information</Typography>
        <Typography  sx={footerText}>Privacy Policy</Typography>
        <Typography  sx={footerText}>Terms & Conditions</Typography>
        <Typography  sx={footerText}>Contact Us</Typography>
        </Box>
      </Box>

      <Box flex='0.25' color='#7D8EA7' display={'flex'} flexDirection={'column'} alignItems={'center'} textAlign={{xs:'center',sm:'left'}}>
        <Box>
        <Typography variant='h5' sx={{fontWeight:600,my:'1rem',color:'white',fontSize:{xs:'1.6rem',sm:'1.5rem'}}}>My Account</Typography>
        <Typography sx={footerText}>Sign In</Typography>
        <Typography  sx={footerText}>View Cart</Typography>
        <Typography  sx={footerText}>My Wishlist</Typography>
        <Typography  sx={footerText}>Track My Order</Typography>
        <Typography  sx={footerText}>Help</Typography>
        </Box>
      </Box>
      

      <Box flex='0.4' color='#7D8EA7' display={'flex'} flexDirection={'column'} alignItems={'center'}  textAlign={{xs:'center',sm:'left'}}>
        <Box>
        <Typography textAlign={{xs:'center',sm:'left'}} variant='h5' sx={{fontWeight:600,my:'1rem',color:'white',fontSize:{xs:'1.6rem',sm:'1.5rem'}}}>Shop</Typography>
        <Box>
          <Typography sx={footerText}><Typography component={'span'} fontWeight={600}>Address : </Typography>5143 Delhi Tilak Market 110042</Typography>
        </Box>
        <Box>
          <Typography sx={footerText}><Typography component={'span'} fontWeight={600}>Phone : </Typography>(+91) 1454548, (+91) 154545865</Typography>
        </Box>
        <Box>
          <Typography sx={footerText}><Typography component={'span'} fontWeight={600}>Hours : </Typography>10:00 - 15:00 Mon - Sat</Typography>
        </Box>
        
        <Box mt='2rem'  textAlign={{xs:'center',sm:'left'}}>
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
    </Box>
  )
}

export default Footer