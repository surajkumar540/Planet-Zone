import React from 'react';
import { Box,CardMedia, Typography,Button} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import saleImg from "../../assets/Design/sale.jpg"

const Poster1 = () => {
    const navigate=useNavigate()
  return (
    <Box sx={{height:{xs:'50vh',sm:'80vh'},display:'flex'}}>
        {/* background: 'linear-gradient(to right bottom, #396afc,#2948ff)' */}
        <Box bgcolor={'beige'} width={'100%'} sx={{flex:{sm:0.5,md:0.45},display:'flex',alignItems:'center ',}}>
            <Box width={'100%'} display={'flex'} flexDirection={'column'} justifyContent={'flex-end'} alignItems={'center'}>
                <Box width={'80%'} height={'80%'}>
                    <Box color='#795548'>
                        <Typography variant='h3' fontSize={{sm:'3rem',md:'5rem'}} fontWeight={600} lineHeight={'120%'} color={"black"}>The <br/> Monsoon Sale</Typography>     
                    </Box>
                    <Box mb='1rem'>
                        <Typography pl={{sm:'.6rem'}} fontSize={{sm:'.8rem',md:'1.3rem'}} color='black'>Pocket friendly products everywhere</Typography>
                    </Box>
                    {/* <Box ml={{sm:'.5rem'}}>
                        <Button variant='contained' size='small' sx={{borderRadius:'50px',bgcolor:'#3CB815',textTransform:"capitalize"}}>Order Now</Button>
                    </Box> */}
                </Box>
            </Box>
        </Box>


        <Box flex={{sm:0.5,md:0.55}}>
            <CardMedia
            sx={{ height:'100%',objectFit:"cover" }}
            image={saleImg}
            title="green iguana"
            />
        </Box>
    </Box>
  )
}

export default Poster1