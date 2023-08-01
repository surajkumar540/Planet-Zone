import React, { useState } from 'react';
import { CardMedia, Typography, TextField, Button, Grid, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { getContactUs } from '../api/devApi';

const Orders = () => {




    return (
        <Box px={6} height={'calc(100vh - 64px)'} > 

            <Box py={3}>
                <Typography fontSize="35px">All Orders</Typography>
            </Box>


            <Box display="flex" gap={3} position={'relative'} alignItems={'flex-start'}>

                <Box flex={0.4} sx={{ position:'sticky',top:'5rem',left:'1%',height:'100%'}}>
                        <CardMedia
                        component="img" 
                        height="500px"
                      
                        image={'https://img.freepik.com/free-vector/shopping-mobile-app-online-store-service-smartphone-application-internet-purchase-making-order-customer-cartoon-character-adding-product-cart-vector-isolated-concept-metaphor-illustration_335657-2836.jpg?w=740&t=st=1690859950~exp=1690860550~hmac=81a1269811201f49c7dcc9c1dc3945ac42cd87f65da06bdd97715128a456dccf'}
                        alt="Order Image"
                        />
                </Box>

                <Box flex={0.6} display="flex" flexDirection="column" gap={3}>

                    <Box display="flex" bgcolor="white" p={1} borderRadius="8px" boxShadow="rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset" >
                        <Box flex={0.2} p={1}>
                            <img src="https://rukminim2.flixcart.com/image/416/416/xif0q/mobile/l/v/8/-original-imaghx9qudmydgc4.jpeg?q=70" height="130px" width="120px" />
                        </Box>
                        <Box p={1} flex={0.8}>
                            <Typography fontWeight="bold">APPLE iPhone 14 Plus (Starlight, 128 GB)</Typography>
                            <Typography >Price ₹ 79,990</Typography>
                            <Box display="flex" gap={"2px"} textAlign="center">
                                <HomeIcon sx={{ fontSize: '22px' }} color="primary" />
                                <Typography >Home Delivery</Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box display="flex" bgcolor="white" p={1} borderRadius="8px" boxShadow="rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset" >
                        <Box flex={0.2} p={1}>
                            <img src="https://rukminim2.flixcart.com/image/832/832/xif0q/shirt/f/o/i/s-mg23shln102-s-clothes-encounters-original-imagr5jheashaehx.jpeg?q=70" height="130px" width="120px" />
                        </Box>
                        <Box p={1} flex={0.8}>
                            <Typography fontWeight="bold">Men Regular Fit Solid Casual Shirt</Typography>
                            <Typography >Price ₹ 990</Typography>
                            <Box display="flex" gap={"2px"} textAlign="center">
                                <HomeIcon sx={{ fontSize: '22px' }} color="primary" />
                                <Typography >Home Delivery</Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box display="flex" bgcolor="white" p={1} borderRadius="8px" boxShadow="rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset" >
                        <Box flex={0.2} p={1}>
                            <img src="https://rukminim2.flixcart.com/image/832/832/xif0q/watch/s/j/c/-original-imagrdzffkw6pkjg.jpeg?q=70" height="130px" width="120px" />
                        </Box>
                        <Box p={1} flex={0.8}>
                            <Typography fontWeight="bold"> FOGG-1141-Blue Day and Date Analog Watch - For Men 1141- BL</Typography>
                            <Typography >Price ₹ 9,390</Typography>
                            <Box display="flex" gap={"2px"} textAlign="center">
                                <HomeIcon sx={{ fontSize: '22px' }} color="primary" />
                                <Typography >Home Delivery</Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box display="flex" bgcolor="white" p={1} borderRadius="8px" boxShadow="rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset" >
                        <Box flex={0.2} p={1}>
                            <img src="https://rukminim2.flixcart.com/image/832/832/xif0q/watch/s/j/c/-original-imagrdzffkw6pkjg.jpeg?q=70" height="130px" width="120px" />
                        </Box>
                        <Box p={1} flex={0.8}>
                            <Typography fontWeight="bold"> FOGG-1141-Blue Day and Date Analog Watch - For Men 1141- BL</Typography>
                            <Typography >Price ₹ 9,390</Typography>
                            <Box display="flex" gap={"2px"} textAlign="center">
                                <HomeIcon sx={{ fontSize: '22px' }} color="primary" />
                                <Typography >Home Delivery</Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box display="flex" bgcolor="white" p={1} borderRadius="8px" boxShadow="rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset" >
                        <Box flex={0.2} p={1}>
                            <img src="https://rukminim2.flixcart.com/image/832/832/xif0q/watch/s/j/c/-original-imagrdzffkw6pkjg.jpeg?q=70" height="130px" width="120px" />
                        </Box>
                        <Box p={1} flex={0.8}>
                            <Typography fontWeight="bold"> FOGG-1141-Blue Day and Date Analog Watch - For Men 1141- BL</Typography>
                            <Typography >Price ₹ 9,390</Typography>
                            <Box display="flex" gap={"2px"} textAlign="center">
                                <HomeIcon sx={{ fontSize: '22px' }} color="primary" />
                                <Typography >Home Delivery</Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box display="flex" bgcolor="white" p={1} borderRadius="8px" boxShadow="rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset" >
                        <Box flex={0.2} p={1}>
                            <img src="https://rukminim2.flixcart.com/image/832/832/xif0q/watch/s/j/c/-original-imagrdzffkw6pkjg.jpeg?q=70" height="130px" width="120px" />
                        </Box>
                        <Box p={1} flex={0.8}>
                            <Typography fontWeight="bold"> FOGG-1141-Blue Day and Date Analog Watch - For Men 1141- BL</Typography>
                            <Typography >Price ₹ 9,390</Typography>
                            <Box display="flex" gap={"2px"} textAlign="center">
                                <HomeIcon sx={{ fontSize: '22px' }} color="primary" />
                                <Typography >Home Delivery</Typography>
                            </Box>
                        </Box>
                    </Box>

                </Box>

            </Box>
        </Box>
    );
};

export default Orders;
