import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Progress from "../components/Tools/Progress";
import { Box, CardMedia, Radio, Typography } from "@mui/material";

const PaymentMethod = () => {
  return (
    <>
      <Header />
      <Progress />
      <Box>
        <Box>
          <Typography variant="h4" pl="3rem">
            Choose a Payment Method
          </Typography>
        </Box>

        <Box bgcolor={"dodgerblue"} border={'1px solid grey'} mt='3rem'>
          
          <Box bgcolor={"pink"} mb="2rem" display={'flex'} justifyContent={'space-around'} alignItems={'center'}>
     
            <Box width={'40%'}>
              <CardMedia
                sx={{ height: 250}}
                image="https://cdn.pixabay.com/photo/2015/05/26/09/37/paypal-784404_1280.png"
                title="green iguana"
              />
            </Box>
            <Radio
              // checked={selectedValue === 'a'}
              // onChange={handleChange}
              value="a"
              name="radio-buttons"
              inputProps={{ "aria-label": "A" }}
            />
          </Box>
          <Box bgcolor={"pink"} mb="2rem" display={'flex'} justifyContent={'space-around'} alignItems={'center'}>
     
            <Box width={'40%'}>
              <CardMedia
                sx={{ height: 250}}
                image="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png"
                title="green iguana"
              />
            </Box>
            <Radio
              // checked={selectedValue === 'a'}
              // onChange={handleChange}
              value="a"
              name="radio-buttons"
              inputProps={{ "aria-label": "A" }}
            />
          </Box>

        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default PaymentMethod;
