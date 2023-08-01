import React, { useEffect, useState } from 'react';
import { CardMedia, Typography, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { getAllOrders } from '../api/devApi';
import { useNavigate } from 'react-router-dom';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import blankHome from "../assets/Images/admin_empty.webp"

const Orders = () => {
    const [orders, setOrders] = useState([])

    const fetchAllOrders = async () => {
        try {
            const response = await getAllOrders();
            setOrders(response.data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchAllOrders()
    }, [])

    return (
        <Box px={6} height={'calc(100vh - 64px)'} >

            <Box py={3}>
                <Typography fontSize="35px">All Orders</Typography>
            </Box>

            {orders.length === 0 &&
                <Box display={'flex'} justifyContent={'center'} flexDirection={'columnn'} alignContent={'center'}>
                    <Box>
                        <CardMedia
                            sx={{ height: 440, width: 440 }}
                            image={blankHome}
                            title="green iguana"
                        />
                        <Typography textAlign={'center'} fontWeight={500} fontSize={'22px'}>{`No Orders Found`}</Typography>
                    </Box>
                </Box>
            }


            {orders.length>0&&<Box display="flex" gap={3} position={'relative'} alignItems={'flex-start'}>

                <Box flex={0.4} sx={{ position: 'sticky', top: '5rem', left: '1%', height: '100%' }}>
                    <CardMedia
                        component="img"
                        height="500px"

                        image={'https://img.freepik.com/free-vector/shopping-mobile-app-online-store-service-smartphone-application-internet-purchase-making-order-customer-cartoon-character-adding-product-cart-vector-isolated-concept-metaphor-illustration_335657-2836.jpg?w=740&t=st=1690859950~exp=1690860550~hmac=81a1269811201f49c7dcc9c1dc3945ac42cd87f65da06bdd97715128a456dccf'}
                        alt="Order Image"
                    />
                </Box>

                <Box flex={0.6} display="flex" flexDirection="column-reverse" gap={3}>


                    {
                        orders.map((item, index) => {
                            return <Box key={index}>
                                <SingleOrder orderId={item?._id} name={item?.orderItems[0]?.name} image={item?.orderItems[0]?.image} address={item?.shippingAddress?.address} price={item?.payment?.amount_paid / 100} totalItems={item?.orderItems?.length - 1} onlinePayment={item?.payment?.summary?.razorpaySignature} />
                            </Box>
                        })

                    }

                </Box>

            </Box>}
        </Box>
    );
};

export default Orders;


const SingleOrder = ({ orderId, name, address, price, image, totalItems, onlinePayment = false }) => {
    const navigate = useNavigate()
    return (
        <Box onClick={() => navigate(`/order/${orderId}`)} display="flex" bgcolor="white" p={1} borderRadius="8px" boxShadow="rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset" sx={{ cursor: "pointer" }}>
            <Box flex={0.2} >
                <img src={image} height="100%" width="140px" />
            </Box>
            <Box p={1} flex={0.8}>
                <Typography>{name}
                    <Typography component={'span'} fontWeight={600}>{totalItems > 0 && (` + ${totalItems} item`)}</Typography>
                </Typography>
                <Typography > ₹ {price}</Typography>
                <Box display="flex" gap={"2px"} alignItems={'center'}>
                    {
                        onlinePayment ? <Typography color='dodgerblue'>Razorpay</Typography> : <Typography color='greenyellow'>Home Delivery</Typography>
                    }


                </Box>
                <Typography fontSize={'17px'}>{address}</Typography>
            </Box>
        </Box>
    )
}