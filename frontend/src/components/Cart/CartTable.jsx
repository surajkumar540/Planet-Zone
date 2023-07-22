import React, { useEffect,useState } from 'react'
import { Box,Typography,Divider } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { setPrice } from '../../redux/reducers/orderSlice'

const CartTable = () => {
    const dispatch=useDispatch()
    const {data:products}=useSelector((state)=>state?.cart);
    const [totalPrice,setTotalPrice]=useState(0)
    const [totalDiscount,setTotalDiscount]=useState(0)
    
    const totalPriceFun=()=>{
        let total=0;
        let discount=0;
        products.forEach((item)=>{
            total+= item.totalPrice*item.qty
            discount+=item.price*(item.discount/100)*item.qty
        })
        setTotalPrice(total)
        setTotalDiscount(discount)
        dispatch(setPrice(total));
    }

    useEffect(()=>{
        totalPriceFun()
    },[products])

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
                <Typography fontSize='1.1rem'>₹ {Math.floor(totalPrice)+Math.floor(totalDiscount)}</Typography>
            </Box>
            <Box display={'flex'} justifyContent={'space-between'}>
                <Typography fontSize='1.1rem'>Save</Typography>
                <Typography fontSize='1.1rem'> ₹ {Math.floor(totalDiscount)}</Typography>
            </Box>
            <Box display={'flex'} justifyContent={'space-between'}>
                <Typography fontSize='1.1rem'>Delivery Charges</Typography>
                <Typography fontSize='1.1rem'>
                    <Typography as='del' fontSize='1rem' sx={{color:"grey",fontWeight:400}}>₹40</Typography> <Typography as='span' fontSize='1rem' fontWeight={600} color='#388E3C'>Free</Typography> </Typography>
            </Box>
            </Box>
            <Divider/>

            <Box flex='0.18' display={'flex'} justifyContent={'space-between'} alignItems={'center'} >
                <Typography fontSize='1.1rem' fontWeight={'600'}>Total Amount</Typography>
                <Typography fontSize='1.1rem' color='#388e3c' fontWeight={'600'}>₹ {Math.floor(totalPrice)}</Typography>
            </Box>
            <Divider/>

            <Box flex='0.17' display={'flex'} alignItems={'center'}>
            <Typography color='#388e3c' fontWeight={600}>You will save ₹{Math.floor(totalDiscount)+40} on this order</Typography>
            </Box>
        </Box>
    </Box>
  )
}

export default CartTable