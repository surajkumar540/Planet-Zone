import React from 'react';
import { Box, CardMedia, Typography } from '@mui/material';
import SingleCartProduct from './SingleCartProduct';
import CartTable from "./CartTable"

const CartProducts = ({products}) => {

  return (
    <Box bgcolor={'#F8F8F8'}>
        <Box textAlign={'center'} mb={4}>
            <Typography fontSize={'3rem'}>Cart Products</Typography>
            <Typography>Summer brakes products at your point</Typography>
        </Box>

        <Box display={'flex'}> 
            <Box display={'flex'} justifyContent={'center'} flexWrap={'wrap'} flex={0.7} p='1rem'>
            {
                products?.map((item,index)=>{
                return <SingleCartProduct key={index} obj={item}/>
                })
            }
            </Box>
            {
              products.length>0&&<CartTable/>
            }
        </Box>

        {products.length===0&&<Box display={'flex'} justifyContent={'center'}>
          <img src="https://mir-s3-cdn-cf.behance.net/projects/404/95974e121862329.Y3JvcCw5MjIsNzIxLDAsMTM5.png"/>
        </Box>
}

    </Box>
  )
}

export default CartProducts