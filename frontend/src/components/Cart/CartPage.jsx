import React from 'react';
import { Box, Button, CardMedia, Typography } from '@mui/material';
import SingleCartProduct from './SingleCartProduct';
import CartTable from "./CartTable"
import { useNavigate } from 'react-router-dom';


const CartProducts = ({ products }) => {

  const navigate = useNavigate();

const handleSubmit = ()=>{
  navigate("/shipping")
}

  return (
    <Box bgcolor={'#F8F8F8'} pt='3rem'>
      <Box textAlign={'center'} mb={3}>
        <Typography fontSize={'3rem'}>Cart Products</Typography>
        {/* <Typography>Summer brakes products at your point</Typography> */}
      </Box>

      <Box display={'flex'}>
        <Box display={'flex'} flexDirection="column" justifyContent={'center'} flexWrap={'wrap'} flex={0.7} p='1rem'>
          {
            products?.map((item, index) => {
              return <SingleCartProduct key={index} obj={item} />
            })
          }

          <Box display='flex' justifyContent="right" pr={15}>
            <Button variant='contained' onClick={handleSubmit}>Submit</Button>
          </Box>

        </Box>
        {
          products.length > 0 && <CartTable />
        }
      </Box>

      {products.length === 0 && <Box display={'flex'} justifyContent={'center'}>
        <img src="https://mir-s3-cdn-cf.behance.net/projects/404/95974e121862329.Y3JvcCw5MjIsNzIxLDAsMTM5.png" />
      </Box>
      }

    </Box>
  )
}

export default CartProducts