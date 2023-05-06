import React from 'react';
import { Box,CardMedia, Typography,Button} from '@mui/material';
import Bag from "../../assets/Home/bag.jpg"

const Poster1 = () => {
  return (
    <Box sx={{height:'80vh',display:'flex'}}>
        
        <Box bgcolor={'beige'} sx={{flex:0.45,display:'flex',alignItems:'center '}}>
            <Box width={'100%'} display={'flex'} flexDirection={'column'} justifyContent={'flex-end'} alignItems={'center'}>
                <Box width={'80%'} height={'80%'}>
                    <Box 
                    // color='#995732'
                    // color='#735e52'
                    color='#795548'
                    >
                        <Typography fontSize={'5rem'} fontWeight={600} lineHeight={'120%'}>The <br/> Sunday Sale</Typography>     
                    </Box>
                    <Box mb='1rem'>
                        <Typography pl='.6rem' fontSize={'1.3rem'} color='#694f4f'>Pocket friendly products everywhere</Typography>
                    </Box>
                    <Box ml='.5rem'>
                        <Button variant='contained' sx={{borderRadius:'50px',bgcolor:'#009688'}}>Order Now</Button>
                    </Box>
                </Box>
            </Box>
        </Box>


        <Box bgcolor={'grey'} flex={0.55}>
            <CardMedia
            sx={{ height:'100%' }}
            image={Bag}
            title="green iguana"
            />
        </Box>
    </Box>
  )
}

export default Poster1