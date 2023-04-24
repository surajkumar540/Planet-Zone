import React from 'react';
import { Typography,Box,CardMedia,FormControl,IconButton,InputAdornment,InputLabel,OutlinedInput,Button} from '@mui/material';
import signupImg from "../assets/Auth/change.jpg"
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {Link} from "react-router-dom"

const ChangePassword = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConrfirmPassword = () => setShowConfirmPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Box display={'flex'} height={'100vh'}>

           
    <Box flex={0.5} flexDirection={'column'} display={'flex'} justifyContent={'space-evenly'}>

    <Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
    <Box>
        <CardMedia
        component="img"
        height="400"
        image={signupImg}
        alt="Paella dish"
    />
    </Box>
    </Box>

    <Box display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'}>
    <Box  textAlign={'center'}>
        <Typography sx={{fontSize:"2rem",fontWeight:"500",marginBottom:'1rem',color:'#231F20'}}>Change your account password</Typography>
        <Typography sx={{fontWeight:'400'}}>Start your shopping with our website and get assured returns</Typography>
        <Typography sx={{fontWeight:'400'}}>Manage your shopping faster than anyone, anywhere and anytime</Typography>
    </Box>
    </Box>

    </Box>


      <Box flex={0.5} display={'flex'} justifyContent={'center'} alignItems={'center'}  bgcolor={'#ffa216e0'}>
        
        <Box  width={'55%'} bgcolor={'#ffffff'} padding={'3rem 2rem'} borderRadius={'10px'} >

        <Box mb={'1rem'}>
          <Typography sx={{fontSize:'1.8rem',fontWeight:'500'}}>Change your Password</Typography>
          <Typography sx={{fontSize:'.9rem',color:'gray'}}>Start your journey with us</Typography>
        </Box>

        <Box display={'flex'} flexDirection={'column'} alignItems={'center'} >
          
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
            <InputLabel htmlFor="outlined-adornment-new-password">New Password</InputLabel>
            <OutlinedInput
              id="outlined-adornment-new-password"
              type={showPassword ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle new-password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="new-password"
            />
          </FormControl>
            
          <FormControl sx={{ m: 1 }} fullWidth variant="outlined">
            <InputLabel htmlFor="outlined-adornment-confirm-new-password">Confirm New Password</InputLabel>
            <OutlinedInput
              id="outlined-adornment-confirm-new-password"
              type={showConfirmPassword ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm-new-password visibility"
                    onClick={handleClickShowConrfirmPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="confirm-new-password"
            />
          </FormControl>

          <Button variant="contained" fullWidth sx={{ mt: 2,textTransform:'capitalize',p:'.7rem 0' }}>Submit</Button>

        </Box>

    
        
        </Box>

      </Box>

 
    
    </Box>
  )
}

export default ChangePassword