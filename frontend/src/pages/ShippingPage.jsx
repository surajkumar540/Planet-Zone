import React, { useEffect, useState } from 'react';
// import { makeStyles } from '@mui/styles';
import { Container, Paper, Typography, TextField, Button, Grid, Box } from '@mui/material';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { shippingAdd, getShipping } from '../api/devApi';
import { shippingAddress } from '../redux/reducers/orderSlice';

const steps = [
  'Shipping Address',
  'Payment',
  'Order Detailes',
];
const ShippingPage = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate()
  const [isAddress, setIsAddress] = useState();
  const [formValues, setFormValues] = useState({ fullName: "", phoneNo: "", state: "", city: "", address: "", pinCode: "", landMark: "" })





  const fetchAddressData = async () => {

    try {

      const response = await getShipping();
      // console.log(response,"dd")
      const { fullName, phoneNo, state, city, address, pinCode, landMark } = response?.data;
      setFormValues({
        fullName, phoneNo, state, city, address, pinCode, landMark
      })
      // setFormValues()
    }
    catch (error) {
      console.log(error);
    }
  }


  useEffect(() => {
    fetchAddressData();
  }, [])





  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle shipping form submission
    const userDataObj = {
      "fullName": formValues.fullName,
      "phoneNo": formValues.phoneNo,
      "state": formValues.state,
      "address": formValues.address,
      "city": formValues.city,
      "pinCode": formValues.pinCode,
      "landMark": formValues.landMark
    }

    try {
      const response = await shippingAdd(userDataObj);
      console.log(response)

      if (response.status) {
        dispatch(shippingAddress(userDataObj))
        navigate("/payment")
      }

      if (response.message == "Already shipping address available") {
        dispatch(shippingAddress(userDataObj))
        navigate("/payment")
      }
    } catch (error) {
      console.log(error)

    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newObject = { ...formValues, [name]: value };
    setFormValues({ ...newObject });
  }




  return (
    <>
      <Header />
      <Grid container marginY={2}>
        {/* <Grid item xs={12}>
          <img src="https://img.freepik.com/premium-photo/shopping-cart-symbol-with-torn-paper_220873-11807.jpg?w=996" alt="Background" style={{ width: '100%', height: 'auto' }} />
          */}

        <Box sx={{ width: '100%', paddingY: '40px' }}>
          <Stepper activeStep={0} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* form */}
        <Container maxWidth="lg" >
          <Paper elevation={3} sx={{ padding: 3 }}  >
            <Typography variant="h4" gutterBottom>
              Shipping Address
            </Typography>
            <form onSubmit={handleSubmit}>

              <Box display="flex" justifyContent="center" gap={3}>
                <TextField
                  label="Full Name"
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                  type="text"
                  name='fullName'
                  value={formValues.fullName}
                  onChange={handleChange}
                />

                <TextField
                  label="Phone no"
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                  type="number"
                  name='phoneNo'
                  value={formValues.phoneNo}
                  onChange={handleChange}
                />
              </Box>
              <Box display="flex" justifyContent="center" gap={3}>
                <TextField
                  label="State"
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                  type="text"
                  name='state'
                  value={formValues.state}
                  onChange={handleChange}
                />
                <TextField
                  label="City/Town"
                  required
                  fullWidth
                  sx={{ mb: 2 }}
                  type="text"
                  name='city'
                  value={formValues.city}
                  onChange={handleChange}
                />
              </Box>


              <Box display="flex" justifyContent="center" >

                <TextField
                  label="Address"
                  fullWidth
                  required
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                  type="text"
                  name='address'
                  value={formValues.address}
                  onChange={handleChange}
                />
              </Box>

              <Box display="flex" justifyContent="center" gap={3}>
                <TextField
                  label="Pincode"
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                  type="text"
                  name='pinCode'
                  value={formValues.pinCode}
                  onChange={handleChange}
                />
                <TextField
                  label="Landmark"
                  required
                  fullWidth
                  sx={{ mb: 2 }}
                  type="text"
                  name='landMark'
                  value={formValues.landMark}
                  onChange={handleChange}
                />
              </Box>
              <Button type="submit" variant="contained" color="primary">
                Submit
              </Button>

            </form>
          </Paper>
        </Container>
        {/* </Grid> */}
      </Grid>
      <Footer />
    </>
  );
};

export default ShippingPage;

