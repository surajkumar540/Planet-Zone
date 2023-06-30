import React, { useState } from 'react';
import { Typography, Box, CardMedia, FormControl, IconButton, TextField, InputAdornment, OutlinedInput, Button, InputLabel } from '@mui/material';
import signupImg from "../assets/Auth/signup.jpg"
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link,useNavigate } from "react-router-dom"
import { validateSignUpPage } from '../utils/validate';
import { signup } from '../api/devApi';
import Header from "../components/Header/Header"

const SignUp = () => {
  const navigate=useNavigate()
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [formValues, setFormValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConrfirmPassword = () => setShowConfirmPassword((show) => !show);

  const clearFormValues=()=>{
    setFormValues({ name: '', email: '', password: '', confirmPassword: '' });
    setFormErrors({})
}

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    const newObject={...formValues,[name]:value};
    setFormValues({...newObject});

    if(isSubmit)
    {    
        const errorObj = validateSignUpPage(newObject);
        setFormErrors(errorObj);
    }

  }

  const handleSubmit = async(e) => {
    e.preventDefault();
    setIsSubmit(true);


    const errorObj = validateSignUpPage(formValues);
    console.log(errorObj);
    if (Object.keys(errorObj).length > 0) {
      setFormErrors(errorObj)
      return;
    }

    try{
      const response=await signup(formValues)
      
      if(response.status)
      {
        navigate("/login")
      }
    }catch(error)
    {
      console.log(error)
    }

    
    clearFormValues();
    setIsSubmit(false)

  }


 

  return (
    <>
    <Header/>
    <Box display={'flex'} height={'calc(100vh - 64px)'} >

      <Box flex={0.5} display={'flex'} justifyContent={'center'} alignItems={'center'} bgcolor={'#138F74'}>

        <Box width={'55%'} bgcolor={'#ffffff'} padding={'3rem 2rem'} borderRadius={'10px'} >

          <Box mb={'1rem'}>
            <Typography sx={{ fontSize: '1.8rem', fontWeight: '500' }}>Sign up</Typography>
            <Typography sx={{ fontSize: '.9rem', color: 'gray' }}>Start your journey with us</Typography>
          </Box>
          <form onSubmit={handleSubmit}>
            <Box display={'flex'} flexDirection={'column'} alignItems={'center'} >

              <FormControl sx={{ m: 1 }} fullWidth variant="outlined" >

                <TextField

                  sx={{ width: "100%" }}
                  id="filled-error-helper-text"
                  type={'text'}
                  error={formErrors.name ? true : false}
                  helperText={formErrors.name}
                  name='name'
                  value={formValues.name}
                  label="Full Name"
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl sx={{ m: 1 }} fullWidth variant="outlined" >

                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-adornment-email"
                  type={'text'}
                  error={formErrors.email ? true : false}
                  helperText={formErrors.email}
                  name='email'
                  value={formValues.email}
                  onChange={handleChange}
                  label="Email"
                />
              </FormControl>

              <FormControl sx={{ m: 1 }} fullWidth variant="outlined">
                <TextField
                  id="outlined-adornment-password"
                  type={showPassword ? 'text' : 'password'}
                  onChange={handleChange}
                  name='password'
                  error={formErrors.password ? true : false}
                  helperText={formErrors.password}
                  value={formValues.password}

                  InputProps={{
                    endAdornment: (
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
                    )
                  }}
                  label="Password"
                />
              </FormControl>

              <FormControl sx={{ m: 1 }} fullWidth variant="outlined">
                <TextField
                  id="outlined-adornment-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  onChange={handleChange}
                  error={formErrors.confirmPassword ? true : false}
                  helperText={formErrors.confirmPassword}
                  name="confirmPassword"
                  value={formValues.confirmPassword}
                  InputProps={{
                    endAdornment: (
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
                    )
                  }}
                  label="Confirm Password"
                />
              </FormControl>

              <Button type="submit" variant="contained" fullWidth sx={{ m: 2, textTransform: 'capitalize', p: '.7rem 0' }}>Sign Up</Button>

            </Box>
          </form>

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
              height="400"
              image={signupImg}
              alt="Paella dish"
            />
          </Box>
        </Box>

        <Box display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'}>
          <Box textAlign={'center'}>
            <Typography sx={{ fontSize: "2rem", fontWeight: "500", marginBottom: '1rem', color: '#231F20' }}>Create New Account</Typography>
            <Typography sx={{ fontWeight: '400' }}>Start your shopping with our website and get assured returns</Typography>
            <Typography sx={{ fontWeight: '400' }}>Manage your shopping faster than anyone, anywhere and anytime</Typography>
          </Box>
        </Box>

      </Box>

    </Box>
    </>
  )
}

export default SignUp