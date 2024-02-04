import { Box, Typography,CardMedia } from '@mui/material'
import Button from '@mui/material/Button';
import React from 'react'
import b from "../../assets/Auth/b.jpg"
const Poster3 = () => {

    return (
        <>
            <Box>
                <Box display='flex' height={{xs:'50vh',sm:'60vh'}}>
                    <Box flex='0.5' display={{xs:'none',sm:'block'}}>
                    <CardMedia
                        sx={{ height: '100%',objectFit:"cover" }}
                        image={'https://wallpapercave.com/wp/wp2599594.jpg'}
                        title="green iguana"
                        />
                    </Box>

                    <Box bgcolor='#DB4444' flex={{xs:'1',sm:'0.5'}} display='flex' justifyContent={'center'}>
                        <Box display='flex' width={'85%'} flexDirection='column'  justifyContent='center' >

                            <Typography display='flex' justifyContent='start' fontFamily='sans-serif' fontWeight='700' fontSize={{xs:'1.4rem',sm:'1.8rem',md:"40px"}} color='white' paddingBottom="10px">All About Organic</Typography>
                            
                            <Box >

                            <Typography fontSize={{xs:".8rem",md:'.9rem'}} color='white' paddingBottom="20px" fontWeight='200'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim suhsah suha  aisa  sia sii isa  suhua veniam. </Typography>

                            <Typography fontSize={{xs:".8rem",md:'.9rem'}} color='white' fontWeight='200'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod  </Typography>

                            </Box>

                            <Box paddingTop='40px'>
                                <Button variant="contained" style={{
                                    borderRadius: 20,
                                    backgroundColor: "whitesmoke",
                                    paddingInlineStart:"30px",
                                    paddingInlineEnd:"30px"
                                }} width='400px' sx={{textTransform:'capitalize',color:'black'}} >Learn More</Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </>
    )
}

export default Poster3