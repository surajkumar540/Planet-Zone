import React from 'react';
import { Container, Typography, TextField, Button, Grid, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
const AllOrderDetailes = () => {


    return (
        <>
            <Box px={13}  bgcolor="#F5F5F5"  >
             
             <Box py={3}>
                <Typography fontSize="30px">Your Order Detailes</Typography>
             </Box>
             
            
                <Box  display="flex" gap={3}>
                <Box flex={0.6} display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" bgcolor="white" p={1} borderRadius="8px" boxShadow= "rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset" >
                        <Box flex={0.2} p={1}>
                            <img src="https://rukminim2.flixcart.com/image/416/416/xif0q/mobile/l/v/8/-original-imaghx9qudmydgc4.jpeg?q=70" height="130px" width="120px" />
                        </Box>
                        <Box p={1} flex={0.8}>
                            <Typography fontWeight="bold">APPLE iPhone 14 Plus (Starlight, 128 GB)</Typography>
                            <Typography >Price ₹ 79,990</Typography>
                            <Box display="flex" gap={"2px"} textAlign="center">
                                <HomeIcon sx={{fontSize:'22px'}} color="primary"/>
                                <Typography >Home Delivery</Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box display="flex" bgcolor="white" p={1} borderRadius="8px" boxShadow= "rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset" >
                        <Box flex={0.2} p={1}>
                            <img src="https://rukminim2.flixcart.com/image/832/832/xif0q/shirt/f/o/i/s-mg23shln102-s-clothes-encounters-original-imagr5jheashaehx.jpeg?q=70" height="130px" width="120px" />
                        </Box>
                        <Box p={1} flex={0.8}>
                            <Typography fontWeight="bold">Men Regular Fit Solid Casual Shirt</Typography>
                            <Typography >Price ₹ 990</Typography>
                            <Box display="flex" gap={"2px"} textAlign="center">
                                <HomeIcon sx={{fontSize:'22px'}} color="primary"/>
                                <Typography >Home Delivery</Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box display="flex" bgcolor="white" p={1} borderRadius="8px" boxShadow= "rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset" >
                        <Box flex={0.2} p={1}>
                            <img src="https://rukminim2.flixcart.com/image/832/832/xif0q/watch/s/j/c/-original-imagrdzffkw6pkjg.jpeg?q=70" height="130px" width="120px" />
                        </Box>
                        <Box p={1} flex={0.8}>
                            <Typography fontWeight="bold"> FOGG-1141-Blue Day and Date Analog Watch - For Men 1141- BL</Typography>
                            <Typography >Price ₹ 9,390</Typography>
                            <Box display="flex" gap={"2px"} textAlign="center">
                                <HomeIcon sx={{fontSize:'22px'}} color="primary"/>
                                <Typography >Home Delivery</Typography>
                            </Box>
                        </Box>
                    </Box>
                    
                </Box>


                <Box flex={0.4}>
                    <Box bgcolor="white"  p={1} borderRadius="8px">
                        <img src="https://img.freepik.com/free-vector/order-ahead-concept-illustration_114360-7470.jpg?w=740&t=st=1689743478~exp=1689744078~hmac=60869efdc0781da1cb2e39d111c5c1a81423ee1e2f226a7384205f1fe19416c8" width="100%" />
                    </Box>
                </Box>
                </Box>
            </Box>
        </>
    );
};

export default AllOrderDetailes;
