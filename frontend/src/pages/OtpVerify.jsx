import React from 'react';
import { Typography,Box,CardMedia,FormControl,Button, TextField} from '@mui/material';
import otpImg from "../assets/Auth/otp.jpg"
import {Link} from "react-router-dom";

const OtpVerify = () => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  return (
    <Box display={'flex'} height={'100vh'}>


    <Box flex={0.5}  bgcolor={'#D55F5E'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
        
        <Box  width={'55%'}  bgcolor={'#ffffff'} padding={'3rem 2rem'} borderRadius={'10px'}>

        <Box mb={'1rem'}>
          <Typography sx={{fontSize:'1.8rem',fontWeight:'500'}}>Otp Verify</Typography>
          <Typography sx={{fontSize:'.9rem',color:'gray'}}>We've sent a code to satyamsonker1010@gmail.com</Typography>
        </Box>

        <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
          
          <FormControl sx={{ m: 1 }} fullWidth variant="outlined" >
            {/* <InputLabel htmlFor="outlined-adornment-password">Otp</InputLabel> */}
            <TextField
            //  error
            //  helperText="Some important text"
              sx={{width:"100%"}}
              id="outlined-adornment-password"
              type='text'
              label="Otp"
             
            />
          </FormControl>

          <Button variant="contained" fullWidth sx={{ m: 2.5,textTransform:'capitalize',p:'.7rem 0' }}>Verify</Button>

        </Box>

        

        <Box>
        <Typography textAlign={'center'} sx={{fontSize:'.9rem',mb:'.5rem'}}>Otp resend in 20 sec</Typography>
        <Typography textAlign={'center'}>Already have an account ? <Typography component={'span'}>
            <Link to={"/login"} style={{ textDecoration: 'none' }}>
            Log In
            </Link>
            </Typography>
        </Typography>


        </Box>
        
        </Box>

    </Box>
    
      
      <Box flex={0.5} flexDirection={'column'} display={'flex'} justifyContent={'space-evenly'}>

        <Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
          <Box>
            <CardMedia
            component="img"
            height="370"
            image={otpImg}
            alt="Paella dish"
          />
          </Box>
        </Box>
        
        <Box display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'}>
          <Box  textAlign={'center'}>
            <Typography sx={{fontSize:"2rem",fontWeight:"500",marginBottom:'1rem',color:'#151D30'}}>Verify your otp</Typography>
            <Typography sx={{fontWeight:'400',color:"gray"}}>Start your shopping with our website and get assured returns</Typography>
            <Typography sx={{fontWeight:'400',color:"gray"}}>Manage your shopping faster than anyone, anywhere and anytime</Typography>
          </Box>
        </Box>
      
      </Box>

    </Box>
  )
}

export default OtpVerify;