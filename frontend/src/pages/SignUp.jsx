import React, { useState } from 'react';
import { Typography, Box, CardMedia, FormControl, IconButton, InputAdornment, OutlinedInput, Button, TextField } from '@mui/material';
import signupImg from "../assets/Auth/signup.jpg"
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link } from "react-router-dom"

const SignUp = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [formValues, setFormValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConrfirmPassword = () => setShowConfirmPassword((show) => !show);


  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };


  const handleChange = (e) => {
    const { name , value} = e.target;
    const newObject = {...formValues,[name]:value}
    setFormValues({...newObject});

    if(isSubmit){
      setFormErrors(errorObj)
    }

  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmit(true);

    const errorObj = validateSignUpPage(formValues);
    console.log(errorObj);
    if(Object.keys(errorObj).length > 0){
      setFormErrors(errorObj)
      return ;
    }
    
  }


  const validateSignUpPage = (values) => {

    const errors = {};
    const passwordRegex = new RegExp("^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z].*[a-z]).{8,20}$");
    const emailRegex = new RegExp("[a-z0-9]+@[a-z]+\.[a-z]{2,3}");

    if (!values.name) {
      errors.name = "First name is required";
    }

    if (!values.email) {
      errors.email = "Email is required";
    }

    else if (!emailRegex.test(values.email)) {
      errors.email = "Enter valid email"
    }

    if (!passwordRegex.test(values.password)) {
      errors.password = "It must contain 1 capital,1 small letter,1 special sign,1 number "
    }
    if (values.password.length === 0) {
      errors.password = "Password is required";
    }
    if (values.password.length < 8 && values.password.length > 0) {
      errors.password = 'Password is too short'
    }
    if (values.password.length > 20) {
      errors.password = "Password should be 8-20 characters"
    }


    if (values.confirmPassword.length === 0) {
      errors.confirmPassword = "Confirm Password is required";
    }
    if (values.confirmPassword !== values.password) {
      errors.confirmPassword = "Confirm Password did not match";
    }

    return errors;
  }

  return (
    <Box display={'flex'} height={'100vh'}>




      <Box flex={0.5} display={'flex'} justifyContent={'center'} alignItems={'center'} bgcolor={'#3C8F7D'}>

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
                  name='Password'
                  error={formErrors.password ? true : false}
                  helperText={formErrors.password}
                  value={formValues.password}
                  label="Password"
                  
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
                />
              </FormControl>

              <FormControl sx={{ m: 1 }} fullWidth variant="outlined">
               
                <TextField
                  id="outlined-adornment-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  onChange={handleChange}
                  error={formErrors.confirmPassword ? true : false}
                  helperText={formErrors.confirmPassword}
                  name="Confirm Password"
                  label="Confirm Password"
                  value={formValues.confirmPassword}
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
  )
}

export default SignUp