import React, { useState } from 'react';
import { Typography, Box, CardMedia, FormControl, IconButton, InputAdornment, Button, TextField } from '@mui/material';
import loginImg from "../assets/Auth/login.jpg"
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link,useNavigate } from "react-router-dom";
import ForgetModal from '../components/Modals/Auth/ForgetModal';
import { validateSignInPage } from '../utils/validate';
import { login } from '../api/devApi';
import { useDispatch } from 'react-redux';
import { setUserJustLoggedIn } from '../redux/reducers/userSlice';

const Login = () => {
  const dispatch=useDispatch()
  const navigate=useNavigate()
  const [showPassword, setShowPassword] = React.useState(false);
  const [formValues, setFormValues] = useState({  email: '', password: ''});
  const [formErrors, setFormErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const clearFormValues=()=>{
    setFormValues({ email: '', password: '' });
    setFormErrors({})
}
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newObject = { ...formValues, [name]: value };
    setFormValues({ ...newObject });

    if (isSubmit) {
      const errorObj = validateSignInPage(newObject);
      setFormErrors(errorObj);
    }

  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmit(true);


    const errorObj = validateSignInPage(formValues);
    if (Object.keys(errorObj).length > 0) {
      setFormErrors(errorObj)
      console.log(errorObj,"erro")
      return;
    }

    try{
      const response=await login(formValues);
      if(response.status)
      {
        localStorage.setItem("token",response.token)
        navigate("/")
        dispatch(setUserJustLoggedIn())
      }
    }catch(error)
    {
      console.log(error)
    }

    setIsSubmit(false)
    clearFormValues();

  }

  return (
    <>
    {/* <Header/> */}
    <Box display={'flex'} height={'100vh'}>


      <Box flex={0.5} flexDirection={'column'} display={'flex'} justifyContent={'space-evenly'}>

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
          <Box textAlign={'center'}>
            <Typography sx={{ fontSize: "2rem", fontWeight: "500", marginBottom: '1rem', color: '#151D30' }}>Login into your account</Typography>
            <Typography sx={{ fontWeight: '400', color: "gray" }}>Start your shopping with our website and get assured returns</Typography>
            <Typography sx={{ fontWeight: '400', color: "gray" }}>Manage your shopping faster than anyone, anywhere and anytime</Typography>
          </Box>
        </Box>

      </Box>


      <Box flex={0.5} bgcolor={'#82C0EF'} display={'flex'} justifyContent={'center'} alignItems={'center'}>

        <Box width={'55%'} bgcolor={'#ffffff'} padding={'3rem 2rem'} borderRadius={'10px'}>

          <Box mb={'1rem'}>
            <Typography sx={{ fontSize: '1.8rem', fontWeight: '500' }}>Welcome Back </Typography>
            <Typography sx={{ fontSize: '.9rem', color: 'gray' }}>Continue your journey with us with lots of love</Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>

              <FormControl sx={{ m: 1 }} fullWidth variant="outlined" >
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-adornment-email"
                  type='email'
                  label="Email"
                  name="email"
                  error={formErrors.email}
                  helperText={formErrors.email}
                  value={formValues.email}
                  onChange={handleChange}
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

              <Button variant="contained" fullWidth type="submit" sx={{ m: 2.5, textTransform: 'capitalize', p: '.7rem 0' }}>Login</Button>

            </Box>
          </form>
          
          <Box>
            <Typography textAlign={'center'}>Don't have an account yet ? <Typography component={'span'}>
              <Link to={"/signup"} style={{ textDecoration: 'none' }}>
                Sign Up
              </Link>
            </Typography></Typography>

            <ForgetModal />
          </Box>

        </Box>

      </Box>

    </Box>
    {/* <Footer/> */}
    </>
  )
}

export default Login