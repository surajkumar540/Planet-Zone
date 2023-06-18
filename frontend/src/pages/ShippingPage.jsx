import React from 'react';
import { makeStyles } from '@mui/styles';
import { Container, Paper, Typography, TextField, Button, Grid } from '@mui/material';
import { Card, CardMedia, CardContent } from '@mui/material';
const ShippingPage = () => {

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle shipping form submission
  };



  return (
    <>

      <Grid container>
        <Grid item xs={12}>
          <img src="https://img.freepik.com/premium-photo/shopping-cart-symbol-with-torn-paper_220873-11807.jpg?w=996" alt="Background" style={{ width: '100%', height: 'auto' }} />
         
          <Container maxWidth="sm" sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            // color: '#fff',
          }}>
            <Paper elevation={3} sx={{ padding: 3 }}>
              <Typography variant="h4" gutterBottom>
                Shipping Information
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  label="Full Name"
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Address"
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="City"
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Postal Code"
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Country"
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
                <Button type="submit" variant="contained" color="primary">
                  Submit
                </Button>
              </form>
            </Paper>
          </Container>
        </Grid>
      </Grid>

    </>
  );
};

export default ShippingPage;
