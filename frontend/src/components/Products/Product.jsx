import React from 'react';
import { Box, CardMedia, Typography, IconButton } from '@mui/material';
import Bag from "../../assets/Home/bag.jpg"
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync } from '../../redux/reducers/cartSlice';

const Product = ({ obj }) => {
    const { _id } = obj;
    const navigate = useNavigate();
    const dispatch = useDispatch()

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
        <Box onClick={() => navigate(`/product/${_id}`)}
            sx={{
                height: '20rem', width: '15rem' , borderRadius: '10px', display: 'flex', flexDirection: 'column', cursor: 'pointer', zIndex: '0', padding:"3px",border:"1px solid #f5f2f2",
                '&:hover': { boxShadow:"rgba(0, 0, 0, 0.16) 0px 1px 4px",transform:"scale(1.02)",transition:"all .3s ease-in-out" }
            }} >

            <Box flex={0.68} boxSizing={'border-box'}>
                <CardMedia
                    sx={{ height: '100%', borderRadius: '10px', objectFit: 'cover' }}
                    image={obj?.image}
                    title="green iguana"
                />
            </Box>
            <Box flex={0.32} p={'.5rem'}>
                <Box>
                    <Box>
                        <Typography fontSize={'.8rem'} color={'grey'}>{obj?.brand || 'Default'}</Typography>
                    </Box>
                    <Box>
                        <Typography>{obj?.name || "Cloth Bags"}</Typography>
                    </Box>

                    <Box display={'flex'}  width={'100%'}>

                        <Box flex={0.6}>
                            {/* <Box display={'flex'}>
                            <StarIcon sx={{color:'#ffc107'}} fontSize='small'/>
                            <StarIcon sx={{color:'#ffc107'}} fontSize='small'/>
                            <StarIcon sx={{color:'#ffc107'}} fontSize='small'/>
                            <StarIcon sx={{color:'#ffc107'}} fontSize='small'/>
                            <StarOutlineIcon sx={{color:'#ffc107'}} fontSize='small'/>
                        </Box> */}
                            <Box  display={'flex'} flexDirection={'column'} alignItems={'flex-start'} justifyContent={'space-evenly'}>
                                <Typography fontSize={'1.2rem'} fontWeight={600} color='#388E3C'>
                                    ₹{Math.floor(obj?.totalPrice)}{" "}
                                    <Typography as='del' fontSize='1rem' sx={{ color: "grey", fontWeight: 400 }}>{obj?.price && `₹${obj?.price}`}</Typography>
                                </Typography>
                                    <Typography as='span' fontSize='1rem' color='#388E3C'>{obj?.discount && `${obj?.discount - obj?.gst}% off`}</Typography>
                            </Box>
                        </Box>

                        <Box flex={0.4} display={'flex'} justifyContent={'center'} alignItems={'center'}  zIndex={500}
                        // onClick={handleCart}
                        >
                            <IconButton >
                                <ShoppingCartOutlinedIcon sx={{ color: '#1976D2' }} />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default Product