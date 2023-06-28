import React from "react";
import { useState } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Progress from "../components/Tools/Progress";
import { useNavigate } from "react-router-dom";
import { FormControlLabel, Radio, RadioGroup, Typography, Box, Button } from '@mui/material';
import { Container, Paper, Grid, Divider, Checkbox } from '@mui/material';


const PaymentMethod = () => {
  const [selectedOption, setSelectedOption] = useState('');

  const navigate = useNavigate();

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Perform necessary actions with the selected option
    console.log(selectedOption);
    navigate("/order")
  };

  return (
    <>
      <Header />
      <Progress currentStep={1} />

      <Container maxWidth="lg" >
        <Paper elevation={3} sx={{ padding: 3 }}  >
          <form onSubmit={handleSubmit}>

            <Box mt={2}>
              <Typography variant="h4" gutterBottom>
                Payment Method
              </Typography>
              <Divider />
            </Box>
            <Box>
              <RadioGroup name="paymentOption" value={selectedOption} onChange={handleOptionChange}>
                <FormControlLabel value="creditCard" control={<Radio />} label="Credit Card" />
                <FormControlLabel value="paypal" control={<Radio />} label="PayPal" />
                <FormControlLabel value="CashOnDelivery" control={<Radio />} label="Cash on Delivery" />
              </RadioGroup>
              <Box py={2}>
                <Button variant="contained" onClick={handleSubmit}>Submit</Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>


      <Footer />
    </>
  );
};

export default PaymentMethod;
