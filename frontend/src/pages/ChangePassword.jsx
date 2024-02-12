import React, { useState } from 'react';
import { Typography, Box, CardMedia, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Button, TextField } from '@mui/material';
import signupImg from "../assets/Auth/change.jpg"
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link } from "react-router-dom"
import { validateChangePassword } from '../utils/validate';
import { changePassword } from '../api/devApi';
import Header from '../components/Header/Header';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [formValues, setFormValues] = useState({ email: '', number: "", password: '', confirmPassword: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConrfirmPassword = () => setShowConfirmPassword((show) => !show);

  const clearFormValues = () => {
    setFormValues({ email: '', number: "", password: '', confirmPassword: '' });
    setFormErrors({})
  }

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newObject = { ...formValues, [name]: value };
    setFormValues({ ...newObject });

    if (isSubmit) {
      const errorObj = validateChangePassword(newObject);
      setFormErrors(errorObj);
    }

  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmit(true);


    const errorObj = validateChangePassword(formValues);
    if (Object.keys(errorObj).length > 0) {
      setFormErrors(errorObj)
      return;
    }

    clearFormValues()
    setIsSubmit(false)



    const dummyData = {
      "email": formValues.email,
      "otp": formValues.number,
      "password": formValues.password,
      "confirmPassword": formValues.confirmPassword
    }


    try {
      const response = await changePassword(dummyData);
      if (response.status === true) {
        navigate("/login")
      }
    } catch (error) {
      console.log(error)
    }

  }

  return (
    <>
      <Box display={'flex'} height={'calc(100vh - 64px)'}>


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
              <Typography sx={{ fontSize: "2rem", fontWeight: "500", marginBottom: '1rem', color: '#231F20' }}>Change your account password</Typography>
              <Typography sx={{ fontWeight: '400' }}>Start your shopping with our website and get assured returns</Typography>
              <Typography sx={{ fontWeight: '400' }}>Manage your shopping faster than anyone, anywhere and anytime</Typography>
            </Box>
          </Box>

        </Box>


        <Box flex={0.5} display={'flex'} justifyContent={'center'} alignItems={'center'} bgcolor={'#ffa216e0'}>

          <Box width={'55%'} bgcolor={'#ffffff'} padding={'3rem 2rem'} borderRadius={'10px'} >

            <Box mb={'1rem'}>
              <Typography sx={{ fontSize: '1.8rem', fontWeight: '500' }}>Change your Password</Typography>
              <Typography sx={{ fontSize: '.9rem', color: 'gray' }}>Start your journey with us</Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Box display={'flex'} flexDirection={'column'} alignItems={'center'} >

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

                <FormControl sx={{ m: 1 }} fullWidth variant="outlined" >
                  <TextField
                    sx={{ width: "100%" }}
                    id="outlined-adornment-email"
                    type='number'
                    label="Enter the Otp"
                    name="number"
                    error={formErrors.number}
                    helperText={formErrors.number}
                    value={formValues.number}
                    onChange={handleChange}
                  />
                </FormControl>


                <FormControl sx={{ m: 1 }} fullWidth variant="outlined">
                  <TextField
                    id="outlined-adornment-new-password"
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    helperText={formErrors.password}
                    name="password"
                    value={formValues.password}
                    error={formErrors.password}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
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
                      )
                    }}
                  />
                </FormControl>

                <FormControl sx={{ m: 1 }} fullWidth variant="outlined">
                  <TextField
                    id="outlined-adornment-confirm-new-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm Password"
                    helperText={formErrors.confirmPassword}
                    name="confirmPassword"
                    value={formValues.confirmPassword}
                    error={formErrors.confirmPassword}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
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
                      )
                    }}
                  />
                </FormControl>

                <Button variant="contained" type="submit" fullWidth sx={{ mt: 2, textTransform: 'capitalize', p: '.7rem 0' }}>Submit</Button>

              </Box>
            </form>



          </Box>

        </Box>



      </Box>
    </>
  )
}

export default ChangePassword