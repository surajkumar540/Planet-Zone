import { Box, Typography, Paper } from '@mui/material'
import Button from '@mui/material/Button';
import React from 'react'
import OrganicImg from "../../assets/Auth/Organic.jpg"

const Poster2 = () => {
    const styles = {
        background: `url(${OrganicImg}) no-repeat center center fixed`,
        backgroundSize: "cover",
        height: "100vh",
        width: "100%",
    };
    return (
        <>
            <Box sx={styles} >
                <Box position={'relative'} bgcolor='rgba(0, 0, 0, 0.5)'>

                    <Box height='100vh' flex='0.5' display='flex'>
                        <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' width='100%' >

                            <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
                                <Typography fontFamily='sans-serif' fontWeight='700' fontSize="60px" color='white' >Natural</Typography>

                                <Typography fontFamily='sans-serif' fontWeight='700' paddingBottom="20px"  fontSize="60px" color='white' >World Organic</Typography>
                            </Box>


                            <Typography color='white' paddingBottom="20px" fontWeight='200' >The World is your </Typography>



                            <Box paddingTop='40px'>
                                <Button variant="outlined" style={{
                                    borderRadius: 5,
                                    color:'white',
                                    paddingInlineStart: "30px",
                                    paddingInlineEnd: "30px"

                                }} width='400px'  >Learn More</Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box >
        </>
    )
}

export default Poster2;