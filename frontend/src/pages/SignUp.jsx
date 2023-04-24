import React from 'react';
import { Typography,Box,CardMedia,FormControl,IconButton,InputAdornment,InputLabel,OutlinedInput,Button} from '@mui/material';
import signupImg from "../assets/Auth/a.jpg"
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {Link} from "react-router-dom"

const SignUp = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConrfirmPassword = () => setShowConfirmPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Box display={'flex'} height={'100vh'}>

 


      <Box flex={0.5} display={'flex'} justifyContent={'center'} alignItems={'center'}  bgcolor={'#3C8F7D'}>
        
        <Box  width={'55%'} bgcolor={'#ffffff'} padding={'3rem 2rem'} borderRadius={'10px'} >

        <Box mb={'1rem'}>
          <Typography sx={{fontSize:'1.8rem',fontWeight:'500'}}>Sign up</Typography>
          <Typography sx={{fontSize:'.9rem',color:'gray'}}>Start your journey with us</Typography>
        </Box>

        <Box display={'flex'} flexDirection={'column'} alignItems={'center'} >
          
          <FormControl sx={{ m: 1 }} fullWidth variant="outlined" >
            <InputLabel htmlFor="outlined-adornment-full-name">Full Name</InputLabel>
            <OutlinedInput
              sx={{width:"100%"}}
              id="outlined-adornment-full-name"
              type={'text'}   
              label="full-name"
            />
          </FormControl>
          
          <FormControl sx={{ m: 1 }} fullWidth variant="outlined" >
            <InputLabel htmlFor="outlined-adornment-email">Email</InputLabel>
            <OutlinedInput
              sx={{width:"100%"}}
              id="outlined-adornment-email"
              type={'text'}  
              label="email"
            />
          </FormControl>
            
          <FormControl sx={{ m: 1 }} fullWidth variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              type={showPassword ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
            />
          </FormControl>
            
          <FormControl sx={{ m: 1 }} fullWidth variant="outlined">
            <InputLabel htmlFor="outlined-adornment-confirm-password">Confirm Password</InputLabel>
            <OutlinedInput
              id="outlined-adornment-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm-password visibility"
                    onClick={handleClickShowConrfirmPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="confirm-password"
            />
          </FormControl>

          <Button variant="contained" fullWidth sx={{ m: 2,textTransform:'capitalize',p:'.7rem 0' }}>Sign Up</Button>

        </Box>

        <Box mt={'.2rem'}>
          <Typography textAlign={'center'}>Already have an account ? <Typography component={'span'}>
            <Link to={"/login"} style={{ textDecoration: 'none' }}>
            Log In
            </Link>
            </Typography></Typography>

            {/* <Typography mt={'.5rem'} textAlign={'center'} color={'red'}>Forgot Password ?</Typography> */}
        </Box>
        
        </Box>

      </Box>

           
      <Box flex={0.5} flexDirection={'column'} display={'flex'} justifyContent={'space-evenly'}>

        <Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
          <Box>
            <CardMedia
            component="img"
            height="450"
            image={signupImg}
            alt="Paella dish"
          />
          </Box>
        </Box>
        
        <Box display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'}>
          <Box  textAlign={'center'}>
            <Typography sx={{fontSize:"2rem",fontWeight:"500",marginBottom:'1rem',color:'#231F20'}}>Create New Account</Typography>
            <Typography sx={{fontWeight:'400'}}>Start your shopping with our website and get assured returns</Typography>
            <Typography sx={{fontWeight:'400'}}>Manage your shopping faster than anyone, anywhere and anytime</Typography>
          </Box>
        </Box>
      
      </Box>
    
    </Box>
  )
}

export default SignUp