import React from 'react';
import { Box, Typography } from '@mui/material';
import SingleCartProduct from './SingleCartProduct';
import CartTable from './CartTable';

const CartProducts = ({products}) => {

  return (
    <Box bgcolor={'#F1F3F6'}>
        <Box textAlign={'center'} mb={4}>
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
            
            <CartTable/>

        </Box>


    </Box>
  )
}

export default CartProducts