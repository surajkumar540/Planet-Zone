import React from 'react';
import { Box, Typography } from '@mui/material';
import Product from './Product';

const Products = ({products,heading,title}) => {

  return (
    <Box display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'} mb='5rem'>
        <Box textAlign={'center'} my={4}>
            <Typography fontSize={'3rem'}>{heading||"Featured Products"}</Typography>
            <Typography>{title||"Summer brakes products at your point"}</Typography>
        </Box>
        <Box display={'flex'}  p={2} gap={12} flexWrap={'wrap'} width={'85%'}>
          {
            products?.map((item,index)=>{
              return <Product key={index} obj={item}/>
            })
          }
        
        </Box>
    </Box>
  )
}

export default Products