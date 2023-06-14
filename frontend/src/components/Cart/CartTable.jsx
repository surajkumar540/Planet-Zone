import React, { useEffect,useState } from 'react'
import { Box,Typography,Divider } from '@mui/material'
import { useSelector } from 'react-redux'

const CartTable = () => {
    const {data:products}=useSelector((state)=>state?.cart);
    const [totalPrice,setTotalPrice]=useState(0)
    
    const totalPriceFun=()=>{
        let total=0;
        products.forEach((item)=>{
            total+= item.price*item.qty
        })
        setTotalPrice(total)
    }

    useEffect(()=>{
        totalPriceFun()
    },[])

  return (
    <Box flex={0.3} pr='3rem' height={'19rem'} position={'sticky'} top={'5rem'} boxSizing={'border-box'} mb='2rem'>
        <Box bgcolor={'white'} px={'1rem'} height={'100%'} display={'flex'} flexDirection={'column'}>
            
            <Box display='flex' justifyContent='center' alignItems={'center'} flex='0.15'>
            <Typography fontSize='1.3rem'>Price Details</Typography>
            </Box>
            <Divider/>
            
            <Box flex='0.5' display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}>
            <Box display={'flex'} justifyContent={'space-between'}>
                <Typography fontSize='1.1rem'>Price ({products?.length} item)</Typography>
                <Typography fontSize='1.1rem'>₹ {totalPrice}</Typography>
            </Box>
            <Box display={'flex'} justifyContent={'space-between'}>
                <Typography fontSize='1.1rem'>Discount</Typography>
                <Typography fontSize='1.1rem'>− ₹ 0</Typography>
            </Box>
            <Box display={'flex'} justifyContent={'space-between'}>
                <Typography fontSize='1.1rem'>Delivery Charges</Typography>
                <Typography fontSize='1.1rem'>Free</Typography>
            </Box>
            </Box>
            <Divider/>

            <Box flex='0.18' display={'flex'} justifyContent={'space-between'} alignItems={'center'} >
                <Typography fontSize='1.1rem' fontWeight={'600'}>Total Amount</Typography>
                <Typography fontSize='1.1rem' color='#388e3c' fontWeight={'600'}>₹ {totalPrice}</Typography>
            </Box>
            <Divider/>

            <Box flex='0.17' display={'flex'} alignItems={'center'}>
            <Typography color='#388e3c' fontWeight={600}>You will save ₹ 0 on this order</Typography>
            </Box>
        </Box>
    </Box>
  )
}

export default CartTable