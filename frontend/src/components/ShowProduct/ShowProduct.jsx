import React, { useState } from 'react';
import { Box,CardMedia,Typography, Button,FormControl,MenuItem,Select,InputLabel } from '@mui/material';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/reducers/cartSlice';

const ShowProduct = ({obj}) => {
    const [qty,setQty]=useState(1);

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
                        {/* <Box>
                            <Typography>Quantity</Typography>
                        </Box> */}
                        <Box>
                        <FormControl fullWidth  size="small" sx={{ m: 1, minWidth: 60 }}>
                        <InputLabel id="demo-simple-select-label">Qty</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={qty}
                            label="Age"
                            onChange={(e)=>setQty(e.target.value)}
                        >
                            {
                                [...Array(obj?.countInStock).keys()].map((item)=>{
                                    return <MenuItem value={item+1}>{item+1}</MenuItem>
                                })
                            }
                        </Select>
                        </FormControl>
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