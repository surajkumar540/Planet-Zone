import React from 'react';
import { Box, Typography } from '@mui/material';
import SingleCartProduct from './SingleCartProduct';

const CartProducts = ({products}) => {

  return (
    <Box>
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
            <Box flex={0.3} pr='1rem' bgcolor={'whitesmoke'} height={'20rem'} position={'sticky'} top={'6rem'}>
                <Box bgcolor={'dodgerblue'} height={'100%'} display={'flex'} flexDirection={'column'}>
                  <Box bgcolor={'lightseagreen'} flex='0.15'>Price Details</Box>
                  <Box bgcolor={'lightslategrey'} flex='0.5'>Price (2 Items)</Box>
                  <Box bgcolor={'lightsalmon'} flex='0.2'>adf</Box>
                  <Box bgcolor={'lightblue'} flex='0.15'>adf</Box>
                </Box>
            </Box>
        </Box>


    </Box>
  )
}

export default CartProducts