import React from 'react';
import { Box,CardMedia, Typography,IconButton } from '@mui/material';
import Bag from "../../assets/Home/bag.jpg"
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarIcon from '@mui/icons-material/Star';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Product = ({data}) => {
    const {id}=data;
    const navigate=useNavigate();
  return (
    <Box onClick={()=>navigate(`/product/${id}`)} sx={{height:'20rem',width:'15rem',bgcolor:'white',borderRadius:'10px',display:'flex',flexDirection:'column',boxShadow:'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px',cursor:'pointer'}} >

        <Box flex={0.68} boxSizing={'border-box'} p={'.5rem'}>
            <CardMedia
            sx={{ height: '100%',borderRadius:'10px' }}
            image={Bag}
            title="green iguana"
            />
        </Box>
        <Box flex={0.32} p={'.5rem'}>
            <Box>
                <Box>
                    <Typography fontSize={'.8rem'} color={'grey'}>{data?.brand||'Default'}</Typography>
                </Box>
                <Box>
                    <Typography>{data?.title||"Cloth Bags"}</Typography>
                </Box>

                <Box display={'flex'}>
                    
                    <Box flex={0.6}>
                        <Box display={'flex'}>
                            <StarIcon sx={{color:'#ffc107'}} fontSize='small'/>
                            <StarIcon sx={{color:'#ffc107'}} fontSize='small'/>
                            <StarIcon sx={{color:'#ffc107'}} fontSize='small'/>
                            <StarIcon sx={{color:'#ffc107'}} fontSize='small'/>
                            <StarOutlineIcon sx={{color:'#ffc107'}} fontSize='small'/>
                        </Box>
                        <Box>
                            <Typography fontSize={'1.2rem'} fontWeight={600} color={'#009688'}>{data?.price||'$78'}</Typography>
                        </Box>
                    </Box>

                    <Box flex={0.4} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                        <IconButton>
                            <ShoppingCartOutlinedIcon sx={{ color: '#009688' }}/>
                        </IconButton>
                    </Box>
                </Box>
            </Box>
        </Box>
    </Box>
  )
}

export default Product