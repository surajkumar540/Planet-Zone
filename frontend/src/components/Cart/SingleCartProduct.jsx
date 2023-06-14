import React,{useState,useEffect} from "react";
import {Box,CardMedia,Typography,IconButton,TextField,Button} from "@mui/material";
import Bag from "../../assets/Home/bag.jpg";
import { useDispatch } from 'react-redux';
import { addToCartAsync } from '../../redux/reducers/cartSlice';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import RemoveCircleOutlinedIcon from '@mui/icons-material/RemoveCircleOutlined';

const SingleCartProduct = ({ obj }) => {
    const dispatch=useDispatch();
    const [qty,setQty]=useState(1)
    
    const handleCart=(quantity)=>{
        const dummy={
            id:obj?._id,
            qty:quantity
        }
        dispatch(addToCartAsync(dummy))
    }
    
    useEffect(()=>{
        setQty(obj.qty)
    },[])

    useEffect(()=>{
        
    })

  return (
    <Box
      sx={{
        display: "flex",
        height: "12rem",
        mb: "3rem",
        width: "88%",
        bgcolor: "white",
        borderRadius: "10px",
        boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
      }}
    >
      <Box flex={0.2} boxSizing={"border-box"} p="0.5rem">
        <CardMedia
          sx={{ height: "100%", width: "100%", borderRadius: "10px" }}
          image={Bag}
          title="green iguana"
        />
      </Box>

      <Box
        flex={0.58}
        boxSizing={"border-box"}
        display={"flex"}
        flexDirection={"column"}
        p=".5rem"
      >
        <Box flex={0.2} display={"flex"} alignItems={"center"}>
          <Typography fontSize="1.2rem">{obj.name}</Typography>
        </Box>
        
        <Box flex={0.3} display={"flex"} flexDirection={"column"} justifyContent={"space-evenly"}>
          <Typography fontSize={".8rem"}>
            Response Time: 5 ms, 60 Hz Refresh Rate
          </Typography>
          <Typography fontSize={".9rem"}>{obj.brand}</Typography>
        </Box>

        <Box flex={0.2} display={"flex"} alignItems={'center'}>
            
            <Typography fontWeight={600} fontSize={"1.1rem"} mr='1rem'>
                ₹{obj.price*obj.qty}
            </Typography>

          <Typography fontSize={".8rem"} color="#388e3c">
            Free Delivery worth ₹40
          </Typography>
        </Box>
        
        <Box flex={0.25} display='flex' alignItems='center'>
            <Box>
                <IconButton aria-label="Example" color='primary'>
                    <RemoveCircleOutlinedIcon />
                </IconButton>
                
                <TextField
                value={qty}
                disabled
                sx={{width:'3rem'}}
                size="small"
                />

                <IconButton aria-label="Example" color='primary'>
                    <AddCircleOutlinedIcon/>
                </IconButton>
            </Box>
            
            <Box ml='1rem'>
                <Button variant="outlined" sx={{background:'white',color:'black',textTransform:'capitalize'}}>
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
