import React, { useState } from 'react';
import { Typography, Box, CardMedia, FormControl, Button, TextField } from '@mui/material';
import otpImg from "../assets/Auth/otp.jpg"
import { Link } from "react-router-dom";
import { validateOtp } from '../utils/validate';
import Header from '../components/Header/Header';
import { otpVerfiy } from '../api/devApi';

const OtpVerify = () => {
  const [formValues, setFormValues] = useState({ number:"" });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value)
    const newObject={...formValues,[name]:value};
    setFormValues({...newObject});

    if(isSubmit)
    {    
        const errorObj = validateOtp(newObject);
        setFormErrors(errorObj);
    }

  }

  const handleSubmit = async(e) => {
    e.preventDefault();
    setIsSubmit(true);


    const errorObj = validateOtp(formValues);
    // console.log(errorObj);
    if (Object.keys(errorObj).length > 0) {
      setFormErrors(errorObj)
      return;
    }

    try{
      const response=await otpVerfiy(formValues);
      console.log(response);
    //   if(response.status)
    //   {

    //   }
    }catch(error)
    {
      console.log(error)
    }

    setIsSubmit(false)

  }

  return (
    <>
    <Header/>
    <Box display={'flex'} height={'calc(100vh - 64px)'}>


      <Box flex={0.5} bgcolor={'#f86247fc'} display={'flex'} justifyContent={'center'} alignItems={'center'}>

        <Box width={'55%'} bgcolor={'#ffffff'} padding={'3rem 2rem'} borderRadius={'10px'}>

          <Box mb={'1rem'}>
            <Typography sx={{ fontSize: '1.8rem', fontWeight: '500' }}>Otp Verify</Typography>
            <Typography sx={{ fontSize: '.9rem', color: 'gray' }}>We've sent a code to satyamsonker1010@gmail.com</Typography>
          </Box>

      <form onSubmit={handleSubmit}>

          <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>

            <FormControl sx={{ m: 1 }} fullWidth variant="outlined" >
              {/* <InputLabel htmlFor="outlined-adornment-password">Otp</InputLabel> */}
              <TextField
                label="Otp"
                type="number"
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                }}
                  error={formErrors.number}
                  helperText={formErrors.number}
                  name='number'
                value={formValues.number}
                onChange={handleChange}
              />
            </FormControl>

            <Box width={'100%'}>
              <Typography sx={{ fontSize: '.8rem', pl: '.5rem', mb: '.2rem', fontWeight: '300' }}>Otp resend in 20 sec</Typography>
            </Box>

            <Button variant="contained" type="submit" fullWidth sx={{ m: 2, textTransform: 'capitalize', p: '.7rem 0' }}>Verify</Button>

          </Box>

          </form>


          <Box>

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
              height="380"
              image={otpImg}
              alt="Paella dish"
            />
          </Box>
        </Box>

        <Box display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'}>
          <Box textAlign={'center'}>
            <Typography sx={{ fontSize: "2rem", fontWeight: "500", marginBottom: '.4rem', color: '#151D30' }}>Verify your otp</Typography>
            <Typography sx={{ fontWeight: '400', color: "gray" }}>Start your shopping with our website and get assured returns</Typography>
            <Typography sx={{ fontWeight: '400', color: "gray" }}>Manage your shopping faster than anyone, anywhere and anytime</Typography>
          </Box>
        </Box>

      </Box>

    </Box>
    </>
  )
}

export default OtpVerify;