import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Grid, Box, Divider, Checkbox } from '@mui/material';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { useSelector } from 'react-redux';
import { createOrderApi } from '../api/devApi';
import { useParams } from 'react-router-dom';
import { getSingleOrder } from '../api/devApi';

const steps = [
    'Shipping Address',
    'Payment',
    'Order Details',
];

const OrderDetails = () => {
    const {orderId}=useParams();
    const [shipping,setShipping]=useState({fullName:"",city:"",address:"",phoneNo:"",pinCode:"",state:""});
    const [payment,setPayment]=useState({amount:"",orderId:"",paymentId:"",onlinePayment:false});
    const [products,setProducts]=useState({gst:"",discount:"",total:"",price:""});
    const [onlinePayment,setOnlinePayment]=useState(false);

    const fetchOrder=async()=>{
        try{
            const {data:{payment,shippingAddress,orderItems,onlinePayment}}=await getSingleOrder(orderId);

            const {fullName,city,address,phoneNo,pinCode,state}=shippingAddress;
            setShipping({fullName,city,address,phoneNo,pinCode,state})

            const {amount,summary:{orderCreationId,razorpayPaymentId,razorpaySignature}}=payment;
            setPayment({amount:amount,orderId:orderCreationId,paymentId:razorpayPaymentId,onlinePayment:razorpaySignature?true:false})

            let gst=0;
            let discount=0;
            let price=0;
            let total=0;
            orderItems.forEach((item)=>{
                gst+=item.gst
                discount+=item.discount
                price+=item.price
                total+=item.totalPrice
            })
            setOnlinePayment(onlinePayment);
            setProducts({gst,discount,price,total})
            
        }catch(error)
        {
            console.log(error)
        }
    }
    console.log(products)


    useEffect(()=>{
        fetchOrder()
    },[])
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const dummy = {
            name: 'suraj',
            age: '12'
        }

        const res = await createOrderApi(dummy);
        console.log(res, "dhh")
    };



    return (
        <>
            <form>
                <Grid container marginY={2}>

                    <Container maxWidth="lg" >
                        <Paper elevation={3} sx={{ padding: 3 }}  >
                            <form onSubmit={handleSubmit}>

                                <Box mt={2}>
                                    <Typography variant="h4" gutterBottom>
                                        Shipping Address
                                    </Typography>
                                    <Divider />
                                </Box>
                                <Box display='flex' justifyContent="center" alignItems="center" >
                                    <Box display="flex" flex='0.7' flexDirection='column' padding={2} gap={2}>
                                        <Box display="flex"  >
                                            <Typography fontWeight={"bold"} flex='0.4' >Name :</Typography>
                                            <Typography flex='0.5'>{shipping?.fullName}</Typography>
                                        </Box>

                                        <Box display="flex" >
                                            <Typography fontWeight={"bold"} flex='0.4' >Address :</Typography>
                                            <Typography flex='0.6'>{shipping?.address}</Typography>
                                        </Box>

                                        <Box display="flex"  >
                                            <Typography fontWeight={"bold"} flex='0.4'   >Phone No :</Typography>
                                            <Typography flex='0.6'>{shipping?.phoneNo}</Typography>
                                        </Box>

                                        <Box display="flex"  >
                                            <Typography fontWeight={"bold"} flex='0.4'   >City :</Typography>
                                            <Typography flex='0.6' >{shipping?.state}</Typography>
                                        </Box>

                                        <Box display="flex"  >
                                            <Typography fontWeight={"bold"} flex='0.4'   >State :</Typography>
                                            <Typography flex='0.6' >{shipping?.state}</Typography>
                                        </Box>

                                        <Box display="flex"  >
                                            <Typography fontWeight={"bold"} flex='0.4'   >Postal Code :</Typography>
                                            <Typography flex='0.6' >{shipping?.pinCode}</Typography>
                                        </Box>
                                    </Box>

                                    <Box display="flex" flex='0.3' bgcolor='red' justifyContent="center"  >
                                        <img src="https://img.freepik.com/free-vector/customer-woman-shopping-with-barrow-concept_40876-2550.jpg?w=740&t=st=1687329604~exp=1687330204~hmac=7c854ca75f7d59f0ac155df4ea38ea0898b688e17659f7ffd162d3e74c200efe" width='100%' />
                                    </Box>
                                </Box>
                            </form>
                        </Paper>
                    </Container>

                </Grid>

                <Grid container marginY={2}>

                    <Container maxWidth="lg" >
                        <Paper elevation={3} sx={{ padding: 3 }}  >
                            <Box mt={2}>
                                <Typography variant="h4" gutterBottom>
                                    Payment
                                </Typography>
                                <Divider />
                            </Box>
                            <Box display='flex' justifyContent="center" >
                                <Box display="flex" flex='0.7' padding={2} flexDirection='column' justifyContent={'space-evenly'}>
                                    <Box display="flex">
                                        <Typography fontWeight={"bold"} flex='0.3' >Payment Method :</Typography>

                                        <Box display='flex' flex='0.6'>
                                            <Box display="flex" justifyContent="left">
                                                {
                                                    onlinePayment?<img src="https://th.bing.com/th/id/OIP.jniZMUcc2sLYxt4vmhIIvgAAAA?pid=ImgDet&rs=1" width="30%" />:`Cash On Delivery`
                                                }
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box display="flex"  >
                                        <Typography fontWeight={"bold"} flex='0.3' >Amount :</Typography>
                                        <Typography flex='0.6'  > ₹ {payment?.amount/100}</Typography>
                                    </Box>

                                    <Box display="flex"  >
                                        <Typography fontWeight={"bold"} flex='0.3' >Order Id :</Typography>
                                        <Typography flex='0.6'  >{payment?.orderId||orderId}</Typography>
                                    </Box>

                                    <Box display="flex" >
                                        <Typography fontWeight={"bold"} flex='0.3' >Payment Id :</Typography>
                                        <Typography flex='0.6'  >{payment?.paymentId||"Not available"}</Typography>
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
                                <Box display="flex" flex='0.7' flexDirection='column' justifyContent={'space-evenly'} padding={2} >
                                    <Box display="flex" alignItems="center" >
                                        <Typography fontWeight={"bold"} flex='0.5' >Subtotal :</Typography>

                                        <Typography flex='0.5' >₹{products?.price}</Typography>
                                    </Box>

                                    <Box display="flex"  >

                                        <Typography fontWeight={"bold"} flex='0.5' >Shipping Charges :</Typography>

                                        <Typography flex='0.5'  > ₹ 0</Typography>
                                    </Box>

                                    <Box display="flex" >

                                        <Typography fontWeight={"bold"} flex='0.5' >Gst/Tax :</Typography>
                                        <Typography flex='0.5' color={'red'}>{products?.gst}%</Typography>
                                    </Box>

                                    <Box display="flex" >

                                        <Typography fontWeight={"bold"} flex='0.5' >Discount :</Typography>
                                        <Typography flex='0.5' color='green'>{products?.discount}%</Typography>
                                    </Box>

                                    <Divider />

                                    <Box display="flex" >

                                        <Typography fontWeight={"bold"} flex='0.5' >Total</Typography>

                                        <Typography fontWeight={"bold"} flex='0.5' color='gray'>₹{products?.total}</Typography>
                                    </Box>
                                </Box>

                                <Box display="flex" flex='0.3' justifyContent="center"  >
                                    <img src="https://img.freepik.com/premium-vector/shipping-box-taking-order-delivery-packages-concept-illustration_270158-481.jpg?w=740" width='100%' />
                                </Box>
                            </Box>
                        </Paper>
                    </Container>

                    {/* </Grid> */}
                </Grid>
            </form >

            <Footer />
        </>
    );
};

export default OrderDetails;
