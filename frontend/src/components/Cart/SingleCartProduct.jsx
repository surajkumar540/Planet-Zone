import React,{useState,useEffect} from "react";
import {Box,CardMedia,Typography,IconButton,TextField,Button} from "@mui/material";
import Bag from "../../assets/Home/bag.jpg";
import { useDispatch } from 'react-redux';
import { addToCartAsync,removeFromCart } from '../../redux/reducers/cartSlice';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import RemoveCircleOutlinedIcon from '@mui/icons-material/RemoveCircleOutlined';
import { useNavigate } from "react-router-dom";

const SingleCartProduct = ({ obj }) => {
    const dispatch=useDispatch();
    const navigate=useNavigate()
    const [qty,setQty]=useState(obj.qty)
    
    const handleCart=(quantity)=>{
        const dummy={
            id:obj?._id,
            qty:quantity
        }
        dispatch(addToCartAsync(dummy))
    }

    const removeFromCartFun=(id)=>{
      dispatch(removeFromCart(id))
    }
    
    const handlePlus=()=>{
        if(qty<obj.countInStock)
        {
            const value=qty+1;
            setQty(value)
            handleCart(value)
        }
    }
   
    const handleMinus=()=>{
        if(qty>1)
        {
            const value=qty-1;
            setQty(value)
            handleCart(value)
        }
    }

    const showProductFun=()=>{
      navigate(`/product/${obj._id}`)
    }

  return (
    <Box sx={{ display: "flex", height: "12rem", mb: "3rem", width: "88%", bgcolor: "white", borderRadius: "10px", boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",cursor:'pointer' ,'&:hover': {transform: 'scale(1.01)',transition:'0.5s ease-in-out'} }} >

      <Box flex={0.2} boxSizing={"border-box"} p="0.5rem" onClick={showProductFun}>
        <CardMedia
          sx={{ height: "100%", width: "100%", borderRadius: "10px" }}
          image={obj?.image}
          title="green iguana"
        />
      </Box>

      <Box flex={0.58} boxSizing={"border-box"} display={"flex"} flexDirection={"column"} p=".5rem">

        <Box flex={0.2} display={"flex"} alignItems={"center"} onClick={showProductFun}>
          <Typography fontSize="1.2rem">{obj.name}</Typography>
        </Box>
        
        <Box flex={0.3} display={"flex"} flexDirection={"column"} justifyContent={"space-evenly"} onClick={showProductFun}>
          <Typography fontSize={".8rem"}>
            Response Time: 5 ms, 60 Hz Refresh Rate
          </Typography>
          <Typography fontSize={".9rem"}>{obj.brand}</Typography>
        </Box>

        <Box flex={0.2} display={"flex"} alignItems={'center'} onClick={showProductFun}>
            
            <Typography fontWeight={600} fontSize={"1.1rem"} mr='1rem'>
                ₹{Math.floor(obj.totalPrice*obj.qty)}
            </Typography>

          <Typography fontSize={".8rem"} color="#388e3c">
            Free Delivery worth ₹40
          </Typography>
        </Box>
        

        <Box flex={0.25} display='flex' alignItems='center'>
            <Box>
                <IconButton aria-label="Example" color='primary' onClick={handleMinus}>
                    <RemoveCircleOutlinedIcon />
                </IconButton>
                
                <TextField
                value={qty}
                disabled
                sx={{width:'3rem'}}
                size="small"
                onChange={(e)=>setQty(e.target.value)}
                />

                <IconButton aria-label="Example" color='primary' onClick={handlePlus}>
                    <AddCircleOutlinedIcon/>
                </IconButton>
            </Box>
            
            <Box ml='1rem'>
                <Button variant="outlined" sx={{background:'white',color:'black',textTransform:'capitalize'}} onClick={()=>removeFromCartFun(obj._id)}>
                Remove
                </Button>
            </Box>

        </Box>
        
      </Box>

      <Box flex={0.22} p=".5rem">
        <Box mt=".5rem">
          <Typography>
            Delivery by{" "}
            <Typography as="span" fontWeight={600}>
              Jun 12, Mon
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SingleCartProduct;
