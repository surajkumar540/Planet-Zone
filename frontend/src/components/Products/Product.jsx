import React from 'react';
import { Box,CardMedia, Typography,IconButton } from '@mui/material';
import Bag from "../../assets/Home/bag.jpg"
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';
import { useDispatch,useSelector } from 'react-redux';
import { addToCartAsync } from '../../redux/reducers/cartSlice';

const Product = ({obj}) => {
    const {_id}=obj;
    const navigate=useNavigate();
    const dispatch=useDispatch()

    //Send item to cart 
    // const handleCart=()=>{
    //     const dummy={
    //         id:obj?._id,
    //         qty:1
    //     }
    //     dispatch(addToCartAsync(dummy))
    //     navigate("/cart")
    // }

  return (
    <Box onClick={()=>navigate(`/product/${_id}`)} 
    sx={{height:'20rem',width:'15rem', bgcolor:'white', borderRadius:'10px', display:'flex', flexDirection:'column',boxShadow:'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px', cursor:'pointer', zIndex:'0',
    '&:hover': {transform: 'scale(1.01)',transition:'0.5s ease-in-out'}
    }} >

        <Box flex={0.68} boxSizing={'border-box'} p={'.5rem'}>
            <CardMedia
            sx={{ height: '100%',borderRadius:'10px',objectFit:'cover'}}
            image={obj?.image}
            title="green iguana"
            />
        </Box>
        <Box flex={0.32} p={'.5rem'}>
            <Box>
                <Box>
                    <Typography fontSize={'.8rem'} color={'grey'}>{obj?.brand||'Default'}</Typography>
                </Box>
                <Box>
                    <Typography>{obj?.name||"Cloth Bags"}</Typography>
                </Box>

                <Box display={'flex'}>
                    
                    <Box>
                        <Box display={'flex'}>
                            <StarIcon sx={{color:'#ffc107'}} fontSize='small'/>
                            <StarIcon sx={{color:'#ffc107'}} fontSize='small'/>
                            <StarIcon sx={{color:'#ffc107'}} fontSize='small'/>
                            <StarIcon sx={{color:'#ffc107'}} fontSize='small'/>
                            <StarOutlineIcon sx={{color:'#ffc107'}} fontSize='small'/>
                        </Box>
                        <Box>
                            <Typography fontSize={'1.2rem'} fontWeight={600} color={'#009688'}>₹{Math.floor(obj?.totalPrice)} <Typography as='del' fontSize='1rem' sx={{color:"grey",fontWeight:400}}>{obj?.price&&`₹${obj?.price}`}</Typography> <Typography as='span' fontSize='1rem' color='#388E3C'>{`${obj?.discount}% off`}</Typography> 
                            </Typography>
                        </Box>
                    </Box>

                    {/* <Box flex={0.4} display={'flex'} justifyContent={'center'} alignItems={'center'} bgcolor={'pink'} zIndex={500} 
                    // onClick={handleCart}
                    >
                        <IconButton >
                            <ShoppingCartOutlinedIcon sx={{ color: '#009688' }}/>
                        </IconButton>
                    </Box> */}
                </Box>
            </Box>
        </Box>
    </Box>
  )
}

export default Product