import React from 'react';
import { Box, Typography } from '@mui/material';
import Product from './Product';
import Grid from '@mui/material/Grid';
import ProductSkeleton from '../Tools/ProductSkeleton';

const Products = ({ products, heading, title, isLoading=false }) => {
  return (
    <Box display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'} mb='5rem'>
      <Box textAlign={'center'} my={4}>
        <Typography fontSize={'3rem'}>{heading || "Featured Products"}</Typography>
        <Typography>{title || "Summer brakes products at your point"}</Typography>
      </Box>


      <Box flexGrow={1} width={'95%'}>
        <Grid container spacing={2} rowSpacing={{ xs: 1, sm: 2, md: 8 }}>
          {
            isLoading ? (
              Array(4).fill({})?.map((item, index) => {
                return <Grid item key={index} xs={6} md={4} lg={3} display={"flex"} justifyContent={"center"}>
                  <ProductSkeleton />
                </Grid>
              })
            ) : (products?.map((item, index) => {
              return <Grid item key={index} xs={6} md={4} lg={3} display={"flex"} justifyContent={"center"}>
                <Product key={index} obj={item} />
              </Grid>
            }))
          }
        </Grid>
      </Box>


    </Box>
  )
}

export default Products




