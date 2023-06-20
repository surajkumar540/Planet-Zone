import React from 'react';
import { makeStyles } from '@mui/styles';
import { Container, Paper, Typography, TextField, Button, Grid, Box } from '@mui/material';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

const steps = [
  'Shipping Address',
  'Payment',
  'Order Detailes',
];
const ShippingPage = () => {



  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle shipping form submission
  };



  return (
    <>
      <Header/>
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
        <Container maxWidth="md" >
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
                />

                <TextField
                  label="Phone no"
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
              </Box>
              <Box display="flex" justifyContent="center" gap={3}>
                <TextField
                  label="State"
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="City/Town"
                  required
                  fullWidth
                  sx={{ mb: 2 }}
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
                />
              </Box>

              <Box display="flex" justifyContent="center" gap={3}>
                <TextField
                  label="Pincode"
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Landmark"
                  required
                  fullWidth
                  sx={{ mb: 2 }}
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
      <Footer/>
    </>
  );
};

export default ShippingPage;
