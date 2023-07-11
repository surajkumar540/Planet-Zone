import React from "react";
import { useState } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Progress from "../components/Tools/Progress";
import {
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { Container, Paper, Grid, Divider, Checkbox } from "@mui/material";
import { paymentMethod } from "../redux/reducers/orderSlice";
import { useDispatch } from "react-redux";
import { loadScript } from "../utils/functions";
import { paymentInit } from "../api/devApi";

const PaymentMethod = () => {
  const dispatch = useDispatch();
  const [selectedOption, setSelectedOption] = useState("");

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if(selectedOption==='RazorPay')
    {
      displayRazorpay()
    }
    dispatch(paymentMethod(selectedOption));

    // navigate("/order");
  };

  const displayRazorpay=async()=>{
    try{
      const res = await loadScript();
  
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        return;
      }
  
      // creating a new order
      const result = await paymentInit({amount:1})
      console.log(result,"receive")
  
      if (!result) {
        alert("Server error. Are you online?");
        return;
      }
  
      const {KEY_ID}=result;
      const { amount, id: order_id, currency } = result.data;
  
      const options = {
        key: KEY_ID, // Enter the Key ID generated from the Dashboard
        amount: amount.toString(),
        currency: currency,
        name: "Jai Corporation",
        description: "Test Transaction",
        image:"https://res.cloudinary.com/practicaldev/image/fetch/s--CYyAcHOK--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_800/https://dev-to-uploads.s3.amazonaws.com/i/svo3oqttbs7joyvlfe5b.png",
        order_id: order_id,
        handler: async function (response) {
          const data = {
            orderCreationId: order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };
  
          // const result = await axios.post(
          //   "http://localhost:5000/payment/success",
          //   data
          // );
  
          // alert(result.data.msg);
          alert("payment successful",response)
          console.log(data)
        },
        prefill: {
          name: "",
          email: "",
          contact: "9999999999",
        },
        notes: {
          address: "Planet Corporate Office",
        },
        theme: {
          color: "dodgerblue",
        },
      };
  
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    }catch(error)
    {
      console.log(error)
    }
  }

  return (
    <>
      <Header />
      <Progress currentStep={1} />

      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ padding: 3 }}>
          <form onSubmit={handleSubmit}>
            <Box mt={2}>
              <Typography variant="h4" gutterBottom>
                Payment Method
              </Typography>
              <Divider />
            </Box>
            <Box>
              <RadioGroup
                name="paymentOption"
                value={selectedOption}
                onChange={handleOptionChange}
              >
                <FormControlLabel
                  value="creditCard"
                  control={<Radio />}
                  label="Credit Card"
                />
                <FormControlLabel
                  value="RazorPay"
                  control={<Radio />}
                  label="RazorPay"
                />
                <FormControlLabel
                  value="CashOnDelivery"
                  control={<Radio />}
                  label="Cash on Delivery"
                />
              </RadioGroup>
              <Box py={2}>
                <Button variant="contained" onClick={handleSubmit}>
                  Submit
                </Button>
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
