import { Box, Typography } from '@mui/material'
import Button from '@mui/material/Button';
import React from 'react'
import b from "../../assets/Auth/b.jpg"
const Poster3 = () => {
    const styles = {
        background: `url(${b}) no-repeat center center fixed`,
        backgroundSize: "cover",
        height: "100vh",
        width: "100%",
    };
    return (
        <>
            <Box sx={styles}>
                <Box display='flex'>
                    <Box height='100vh' flex='0.5' > </Box>
                    <Box bgcolor='#B22222' height='100vh' flex='0.5' display='flex'>
                        <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' >

                            <Typography display='flex' justifyContent='start' width="77%" fontFamily='sans-serif' fontWeight='700' fontSize="40px" color='white' paddingBottom="10px">All About Organic</Typography>

                            <Typography color='white' paddingBottom="20px" fontWeight='200' paddingX={10}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim suhsah suha  aisa  sia sii isa  suhua veniam. </Typography>

                            <Typography color='white' fontWeight='200' paddingX={10}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod  </Typography>

                            <Box width='76%' paddingTop='40px'>
                                <Button variant="contained" style={{
                                    borderRadius: 20,
                                    backgroundColor: "#000000",
                                    paddingInlineStart:"30px",
                                    paddingInlineEnd:"30px"
                                   
                                }} width='400px' bgcolor='green' >Learn More</Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </>
    )
}

export default Poster3