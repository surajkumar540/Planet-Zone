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
        position: 'relative'
    };
    return (
        <>
            <Box sx={styles} >
                <Paper
                    sx={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                    elevation={0}
                />
                <Box>

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