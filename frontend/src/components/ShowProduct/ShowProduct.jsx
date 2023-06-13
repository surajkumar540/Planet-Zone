import React from 'react';
import { Box,CardMedia,Typography, Button } from '@mui/material';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/reducers/cartSlice';

const ShowProduct = ({obj}) => {

    const handleCart=()=>{
        // useDispatch(addToCart(obj._id))
    }

  return (
    <>
        <Box display={'flex'} height={'80vh'}>
            <Box flex={0.4} display={'flex'} justifyContent={'center'} alignItems={'flex-end'}>
                <CardMedia
                    sx={{ height: '95%',width:'90%',borderRadius:'20px' }}
                    image="https://images.pexels.com/photos/2850487/pexels-photo-2850487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                    title="green iguana"
                />
            </Box>
            <Box flex={0.6} display={'flex'} flexDirection={'column'} boxSizing={'border-box'} p='2rem'  justifyContent={'space-around'}>

                <Box flex='0.6' display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}>                
                    <Typography fontSize={'1rem'}>{obj?.brand}</Typography>
                    <Typography fontSize={'1.5rem'}>{obj?.name}</Typography>
                    <Typography fontSize={'28px'}>₹ {obj?.price}</Typography>
                    <Box py='1rem' display={'flex'} alignItems={'center'}>
                        <Box>
                            <Typography>Sizes</Typography>
                        </Box>
                        <Box display={'flex'} width={'30%'} justifyContent={'space-evenly'} >
                        <Button variant='outlined' sx={{color:"black",fontWeight:'500',fontSize:'1rem',borderColor:'grey'}}>S</Button>
                        <Button variant='outlined' sx={{color:"black",fontWeight:'500',fontSize:'1rem',borderColor:'grey'}}>M</Button>
                        <Button variant='outlined' sx={{color:"black",fontWeight:'500',fontSize:'1rem',borderColor:'grey'}}>L</Button>
                        </Box>
                    </Box>
                    <Box fontSize={'1.5rem'}>
                        <Button variant='contained' sx={{bgcolor:"#009688",marginRight:'1rem'}} onClick={handleCart}>Add to Cart</Button>
                        <Button variant='contained' sx={{bgcolor:"darkorange"}}>Buy Now</Button>
                    </Box>
                    
                </Box>

                <Box flex='0.38'>
                    <Typography variant='h5'>Products Details</Typography>
                    <Typography py='1rem'>{obj?.description}</Typography>
                </Box>
            </Box>
        </Box>
    </>
  )
}

export default ShowProduct