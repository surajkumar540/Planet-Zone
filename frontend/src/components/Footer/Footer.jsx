import React from 'react';
import Box from "@mui/material/Box";
import { IconButton, Typography } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate=useNavigate()

  const aboutNavigate=()=>{
    navigate("/about")
  }

  const contactNavigate=()=>{
    navigate("/about")
  }

  const footerText={
    lineHeight:'2rem',
    fontSize:{xs:'.8rem',sm:'1rem'}
  }

  return (
    <Box bgcolor={'#2D4356'} position={'relative'} sx={{cursor:"pointer"}}>
      <Box display={'flex'} boxSizing={'border-box'} py='3rem' px='1rem' justifyContent={'space-evenly'} flexDirection={{xs:'column',sm:'row'}}>

      <Box flex='0.25' color='#7D8EA7' display={'flex'} alignItems={'center'} flexDirection={'column'} textAlign={{xs:'center',sm:'left'}}>
        <Box>
        <Typography sx={{fontWeight:600,my:'1rem',color:'white',fontSize:{xs:'2rem',sm:'1.5rem'}}}>About</Typography>
        <Typography sx={footerText} onClick={aboutNavigate}>About us</Typography>
        <Typography  sx={footerText} onClick={aboutNavigate}>Delivery Information</Typography>
        <Typography  sx={footerText} onClick={aboutNavigate}>Privacy Policy</Typography>
        <Typography  sx={footerText} onClick={aboutNavigate}>Terms & Conditions</Typography>
        <Typography  sx={footerText} onClick={aboutNavigate}>Contact Us</Typography>
        </Box>
      </Box>

      <Box flex='0.25' color='#7D8EA7' display={'flex'} flexDirection={'column'} alignItems={'center'} textAlign={{xs:'center',sm:'left'}}>
        <Box>
        <Typography variant='h5' sx={{fontWeight:600,my:'1rem',color:'white',fontSize:{xs:'1.6rem',sm:'1.5rem'}}}>My Account</Typography>
        <Typography sx={footerText} onClick={contactNavigate}>Contact</Typography>
        <Typography  sx={footerText} onClick={()=>navigate("/cart")}>View Cart</Typography>
        <Typography  sx={footerText} onClick={()=>navigate("/shop")}>Categories</Typography>
        <Typography  sx={footerText} onClick={contactNavigate}>Orders</Typography>
        <Typography  sx={footerText} onClick={aboutNavigate}>Help</Typography>
        </Box>
      </Box>
      

      <Box flex='0.4' color='#7D8EA7' display={'flex'} flexDirection={'column'} alignItems={'center'}  textAlign={{xs:'center',sm:'left'}}>
        <Box>
        <Typography textAlign={{xs:'center',sm:'left'}} variant='h5' sx={{fontWeight:600,my:'1rem',color:'white',fontSize:{xs:'1.6rem',sm:'1.5rem'}}}>Shop</Typography>
        <Box>
          <Typography sx={footerText}><Typography component={'span'} fontWeight={600}>Address : </Typography>5143 Delhi Tilak Market 110042</Typography>
        </Box>
        <Box>
          <Typography sx={footerText}><Typography component={'span'} fontWeight={600}>Phone : </Typography>(+91) 9667201750</Typography>
        </Box>
        <Box>
          <Typography sx={footerText}><Typography component={'span'} fontWeight={600}>Mail : </Typography>jai.singh.corporate@gmail.com</Typography>
        </Box>
        
        <Box mt='2rem'  textAlign={{xs:'center',sm:'left'}}>
          <IconButton sx={{color:'white'}} onClick={()=>window.open('https://www.facebook.com/', '_blank')}>
            <FacebookIcon/>
          </IconButton>
          <IconButton  sx={{color:'white'}} onClick={()=>window.open('https://twitter.com/home', '_blank')}>
            <TwitterIcon/>
          </IconButton>
          <IconButton  sx={{color:'white'}} onClick={()=>window.open('https://www.instagram.com/', '_blank')}>
            <InstagramIcon/>
          </IconButton>
          <IconButton  sx={{color:'white'}} onClick={()=>window.open('https://www.youtube.com/', '_blank')}>
            <YouTubeIcon/>
          </IconButton>
          <IconButton  sx={{color:'white'}} onClick={()=>window.open('https://web.whatsapp.com/', '_blank')}>
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