import React from 'react';
import { Box,CardMedia } from '@mui/material';

const ShowProduct = () => {
  return (
    <>
        <Box display={'flex'} height={'85vh'}>
            <Box flex={0.4} display={'flex'} justifyContent={'center'} alignItems={'flex-end'}>
                <CardMedia
                    sx={{ height: '90%',width:'90%'}}
                    image="https://images.pexels.com/photos/16660871/pexels-photo-16660871.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load"
                    title="green iguana"
                />
            </Box>
            <Box bgcolor={'pink'} flex={0.6} display={'flex'} flexDirection={'column'} boxSizing={'border-box'} py='1rem'>
                <Box bgcolor={'greenyellow'} py='1rem'>Adidas</Box>
                <Box bgcolor={'yellow'}>Men's T Shirt</Box>
                <Box bgcolor={'orange'}>$ 139</Box>
                <Box bgcolor={'red'}>Size</Box>
                <Box bgcolor={'grey'}>Adidas</Box>
            </Box>
        </Box>
    </>
  )
}

export default ShowProduct