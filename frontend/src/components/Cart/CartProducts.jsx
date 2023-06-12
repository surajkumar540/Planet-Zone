import React from 'react';
import { Box, Divider, Typography } from '@mui/material';
import SingleCartProduct from './SingleCartProduct';

const CartProducts = ({products}) => {

  return (
    <Box bgcolor={'#F1F3F6'}>
        <Box textAlign={'center'} my={4}>
            <Typography fontSize={'3rem'}>Cart Products</Typography>
            <Typography>Summer brakes products at your point</Typography>
        </Box>

        <Box display={'flex'}> 
            <Box display={'flex'} justifyContent={'center'} flexWrap={'wrap'} flex={0.7} p='1rem'>
            {
                products?.map((item,index)=>{
                return <SingleCartProduct key={index} data={item}/>
                })
            }
            </Box>
            <Box flex={0.3} pr='1rem' height={'20rem'} position={'sticky'} top={'6rem'} boxSizing={'border-box'}>
                <Box bgcolor={'white'} px={'1rem'} height={'100%'} display={'flex'} flexDirection={'column'}>
                  
                  <Box display='flex' justifyContent='center' alignItems={'center'} flex='0.15'>
                    <Typography fontSize='1.3rem'>Price Details</Typography>
                  </Box>
                  <Divider/>
                  
                  <Box flex='0.5' display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}>
                    <Box display={'flex'} justifyContent={'space-between'}>
                      <Typography fontSize='1.15rem'>Price (1 item)</Typography>
                      <Typography fontSize='1.15rem'>₹10,790</Typography>
                    </Box>
                    <Box display={'flex'} justifyContent={'space-between'}>
                      <Typography fontSize='1.15rem'>Discount</Typography>
                      <Typography fontSize='1.15rem'>− ₹5,291</Typography>
                    </Box>
                    <Box display={'flex'} justifyContent={'space-between'}>
                      <Typography fontSize='1.15rem'>Delivery Charges</Typography>
                      <Typography fontSize='1.15rem'>Free</Typography>
                    </Box>
                  </Box>
                  <Divider/>

                  <Box flex='0.2' display={'flex'} justifyContent={'space-between'} alignItems={'center'} >
                      <Typography fontSize='1.15rem' fontWeight={'600'}>Total Amount</Typography>
                      <Typography fontSize='1.15rem' fontWeight={'600'}>₹5,499</Typography>
                  </Box>
                  <Divider/>

                  <Box flex='0.15' display={'flex'} alignItems={'center'}>
                    <Typography color='#388e3c' fontWeight={600}>You will save ₹5,291 on this order</Typography>
                  </Box>
                </Box>

            </Box>
        </Box>


    </Box>
  )
}

export default CartProducts