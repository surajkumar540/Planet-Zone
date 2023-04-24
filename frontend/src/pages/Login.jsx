import React from 'react';
import { Typography,Box,CardMedia,FormControl,IconButton,InputAdornment,InputLabel,OutlinedInput,Button} from '@mui/material';
import loginImg from "../assets/Auth/log.jpg"
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {Link} from "react-router-dom"

const Login = () => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  return (
    <Box display={'flex'} height={'100vh'}>

      
      <Box flex={0.5} bgcolor={'#B8D0FF'} flexDirection={'column'} display={'flex'} justifyContent={'space-evenly'}>

        <Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
          <Box>
            <CardMedia
            component="img"
            height="400"
            image={loginImg}
            alt="Paella dish"
          />
          </Box>
        </Box>
        
        <Box display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'}>
          <Box  textAlign={'center'}>
            <Typography sx={{fontSize:"2rem",fontWeight:"500",marginBottom:'1rem'}}>Login into your account</Typography>
            <Typography sx={{fontWeight:'400',color:"gray"}}>Start your shopping with our website and get assured returns</Typography>
            <Typography sx={{fontWeight:'400',color:"gray"}}>Manage your shopping faster than anyone, anywhere and anytime</Typography>
          </Box>
        </Box>
      
      </Box>


      <Box flex={0.5} display={'flex'} justifyContent={'center'} alignItems={'center'}>
        
        <Box  width={'55%'} bgcolor={'white'} padding={'3rem 2rem'} borderRadius={'10px'}>

        <Box mb={'1rem'}>
          <Typography sx={{fontSize:'1.8rem',fontWeight:'500'}}>Welcome Back !</Typography>
          <Typography sx={{fontSize:'.9rem',color:'gray'}}>Continue your journey with us with lots of love</Typography>
        </Box>

        <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
          
          <FormControl sx={{ m: 1 }} fullWidth variant="outlined" >
            <InputLabel htmlFor="outlined-adornment-password">Email</InputLabel>
            <OutlinedInput
            sx={{width:"100%"}}
              id="outlined-adornment-password"
              type={showPassword ? 'text' : 'password'}   
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

          <Button variant="contained" fullWidth sx={{ m: 1,textTransform:'capitalize',p:'.7rem 0' }}>Login</Button>

        </Box>

        <Box mt={'1rem'}>
          <Typography textAlign={'center'}>Dont't you have an account ? <Typography component={'span'}>
            <Link to={"/signup"} style={{ textDecoration: 'none' }}>
            Sign Up
            </Link>
            </Typography></Typography>

            <Typography mt={'.5rem'} textAlign={'center'} color={'red'}>Forgot Password ?</Typography>
        </Box>
        
        </Box>

      </Box>
    
    </Box>
  )
}

export default Login