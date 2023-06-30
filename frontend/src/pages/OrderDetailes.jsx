import React from 'react';
// import { makeStyles } from '@mui/styles';
import { Container, Paper, Typography, TextField, Button, Grid, Box, Divider, Checkbox } from '@mui/material';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { useSelector } from 'react-redux';
// import { orderDetailesApi } from '../api/devApi';

const steps = [
    'Shipping Address',
    'Payment',
    'Order Detailes',
];


const orderDetailes = useSelector((state)=> state?.order.shipping)
console.log(orderDetailes)

const OrderDetailes = () => {

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Handle shipping form submission

        // const dummy = {
        //     name: 'suraj',
        //     age: '12'
        // }

        // const res = await orderDetailesApi(dummy);
        // console.log(res, "dhh")
    };



    return (
        <>
            <Header />
            <form>
                <Grid container marginY={2}>
                    {/* <Grid item xs={12}>
          <img src="https://img.freepik.com/premium-photo/shopping-cart-symbol-with-torn-paper_220873-11807.jpg?w=996" alt="Background" style={{ width: '100%', height: 'auto' }} />
          */}

                    <Box sx={{ width: '100%', paddingY: '40px' }}>
                        <Stepper activeStep={2} alternativeLabel>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>


                    <Container maxWidth="lg" >
                        <Paper elevation={3} sx={{ padding: 3 }}  >
                            <form onSubmit={handleSubmit}>

                                <Box mt={2}>
                                    <Typography variant="h4" gutterBottom>
                                        Shipping Address
                                    </Typography>
                                    <Divider />
                                </Box>
                                <Box display='flex' justifyContent="center" alignItems="center">
                                    <Box display="flex" flex='0.7' flexDirection=
                                        'column' padding={2} >
                                        <Box display="flex"  >
                                            <Typography fontWeight={"bold"} flex='0.4' >Name :</Typography>
                                            <Typography flex='0.5'  >Suraj Kumar</Typography>
                                        </Box>

                                        <Box display="flex" >
                                            <Typography fontWeight={"bold"} flex='0.4' >Address :</Typography>
                                            <Typography flex='0.6'  >A 417 Gully no 2 haider pur </Typography>
                                        </Box>

                                        <Box display="flex"  >
                                            <Typography fontWeight={"bold"} flex='0.4'   >Phone No :</Typography>
                                            <Typography flex='0.6' >9560234558</Typography>
                                        </Box>

                                        <Box display="flex"  >
                                            <Typography fontWeight={"bold"} flex='0.4'   >City :</Typography>
                                            <Typography flex='0.6' >Delhi</Typography>
                                        </Box>

                                        <Box display="flex"  >
                                            <Typography fontWeight={"bold"} flex='0.4'   >State :</Typography>
                                            <Typography flex='0.6' >India</Typography>
                                        </Box>

                                        <Box display="flex"  >
                                            <Typography fontWeight={"bold"} flex='0.4'   >Postal Code :</Typography>
                                            <Typography flex='0.6' >110088</Typography>
                                        </Box>
                                    </Box>

                                    <Box display="flex" flex='0.3' bgcolor='red' justifyContent="center"  >
                                        <img src="https://img.freepik.com/free-vector/customer-woman-shopping-with-barrow-concept_40876-2550.jpg?w=740&t=st=1687329604~exp=1687330204~hmac=7c854ca75f7d59f0ac155df4ea38ea0898b688e17659f7ffd162d3e74c200efe" width='100%' />
                                    </Box>
                                </Box>
                            </form>
                        </Paper>
                    </Container>


                    {/* </Grid> */}
                </Grid>

                <Grid container marginY={2}>

                    {/* form */}
                    <Container maxWidth="lg" >
                        <Paper elevation={3} sx={{ padding: 3 }}  >
                            <Box mt={2}>
                                <Typography variant="h4" gutterBottom>
                                    Payment Method Selected
                                </Typography>
                                <Divider />
                            </Box>
                            <Box display='flex' justifyContent="center" >
                                <Box display="flex" flex='0.7' padding={2} flexDirection='column' >
                                    <Box display="flex" alignItems="center" >
                                        <Typography fontWeight={"bold"} flex='0.3' >Payment Method :</Typography>

                                        <Box display='flex' flex='0.6'>
                                            <Checkbox defaultChecked disabled />
                                            <Box display="flex" justifyContent="left">

                                                <img src="https://cdn-icons-png.flaticon.com/512/196/196566.png?w=740&t=st=1687330750~exp=1687331350~hmac=2a911ca78e062f8f67cd9c3efbc86c8151611fa01a2bf437aeb6790e5dec02dc" width="30%" />

                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box display="flex"  >

                                        <Typography fontWeight={"bold"} flex='0.3' >Cardholder name :</Typography>

                                        <Typography flex='0.6'  >Suraj Kumar</Typography>
                                    </Box>

                                    <Box display="flex" >

                                        <Typography fontWeight={"bold"} flex='0.3' >Card number :</Typography>

                                        <Typography flex='0.6'  >4591 2145 XXXX</Typography>
                                    </Box>
                                </Box>

                                <Box display="flex" flex='0.3' justifyContent="center"  >
                                    <img src="https://img.freepik.com/premium-vector/e-wallet-digital-payment-online-transaction-with-woman-standing-holding-mobile-phone-concept-illustration_270158-446.jpg?w=740" width='100%' />
                                </Box>
                            </Box>
                        </Paper>
                    </Container>


                    {/* </Grid> */}
                </Grid>

                <Grid container marginY={2}>

                    {/* form */}
                    <Container maxWidth="lg" >
                        <Paper elevation={3} sx={{ padding: 3 }}  >
                            <Box mt={2}>
                                <Typography variant="h4" gutterBottom>
                                    Order Summary
                                </Typography>
                                <Divider />
                            </Box>
                            <Box display='flex' justifyContent="center" >
                                <Box display="flex" flex='0.7' flexDirection='column' gap={1} padding={2} >
                                    <Box display="flex" alignItems="center" >
                                        <Typography fontWeight={"bold"} flex='0.5' >Subtotal :</Typography>

                                        <Typography flex='0.5' >₹ 3899</Typography>
                                    </Box>

                                    <Box display="flex"  >

                                        <Typography fontWeight={"bold"} flex='0.5' >Shipping Charges :</Typography>

                                        <Typography flex='0.5'  > ₹ 152</Typography>
                                    </Box>

                                    <Box display="flex" >

                                        <Typography fontWeight={"bold"} flex='0.5' >Gst/Tax :</Typography>

                                        <Typography flex='0.5'  >₹ 81</Typography>
                                    </Box>

                                    <Box display="flex" >

                                        <Typography fontWeight={"bold"} flex='0.5' >Discount :</Typography>

                                        <Typography flex='0.5' color='green'>10% (₹413.98)</Typography>
                                    </Box>

                                    <Divider />

                                    <Box display="flex" >

                                        <Typography fontWeight={"bold"} flex='0.5' >Total</Typography>

                                        <Typography fontWeight={"bold"} flex='0.5' color='gray'>₹3718.02</Typography>
                                    </Box>
                                </Box>

                                <Box display="flex" flex='0.3' justifyContent="center"  >
                                    <img src="https://img.freepik.com/premium-vector/shipping-box-taking-order-delivery-packages-concept-illustration_270158-481.jpg?w=740" width='100%' />
                                </Box>
                            </Box>
                        </Paper>
                    </Container>

                    <Button type='submit'>sumbit</Button>
                    {/* </Grid> */}
                </Grid>
            </form >

            <Footer />
        </>
    );
};

export default OrderDetailes;
