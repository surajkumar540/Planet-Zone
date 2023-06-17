import { Box, Typography, TextField, Button } from "@mui/material";
import React from "react";
import Avatar from '@mui/material/Avatar';
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Location from "../components/Contact/Location";
import Banner from "../components/Tools/Banner";

const ContactUs = () => {
    return (
        <>
            <Header/>
            <Banner title='#Contact Us' text='Connect with us to be part of our family'/>
            <Location/>

            <Box display='flex' margin={3} border="1px solid #D9D9D9" borderRadius='6px'>
                <Box display='flex' flexDirection='column' flex='0.7' gap={2} p='2rem'>
                    <Typography >Leave a Message</Typography>
                    <Typography fontSize="25px" fontWeight="bold">We love to hear from you</Typography>
                    <TextField size='small' fullWidth label="Your Name" id="name" />
                    <TextField size='small' fullWidth label="E-mail" id="email" />
                    <TextField size='small' fullWidth label="Subject" id="subject" />
                    <TextField multiline rows={5} fullWidth label="Your Message" id="message" />
                    <Button variant="contained" sx={{width:'100px'}} color="success">
                        Submit
                    </Button>
                </Box>

                <Box display='flex' flex='0.3' flexDirection="column" justifyContent='center' alignItems='start' gap={4}>

                    <Box display='flex' gap={3} justifyContent='center' width={'100%'} alignItems='center'>
                        <Avatar alt="Travis Howard" src="https://images.rawpixel.com/image_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcm0zMjgtMzY2LXRvbmctMDhfMS5qcGc.jpg" sx={{ width: 65, height: 65 }} />
                        <Box>
                            <Typography fontWeight='bold' fontSize={'1.1rem'}>John Doe</Typography>
                            <Typography fontSize="12px" color="#A6A6A6" >Senior Developer Manager</Typography>
                            <Typography fontSize="12px">
                                Phone: +234567890
                            </Typography>
                            <Typography fontSize="12px">
                                Email: contact@example.com
                            </Typography>
                        </Box>
                    </Box>

                    <Box display='flex' gap={3} justifyContent='center' width={'100%'} alignItems='center'>
                        <Avatar alt="Travis Howard" src="https://images.rawpixel.com/image_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcm0zMjgtMzY2LXRvbmctMDhfMS5qcGc.jpg" sx={{ width: 65, height: 65 }} />
                        <Box>
                            <Typography fontWeight='bold' fontSize={'1.1rem'}>John Doe</Typography>
                            <Typography fontSize="12px" color="#A6A6A6" >Senior Developer Manager</Typography>
                            <Typography fontSize="12px">
                                Phone: +234567890
                            </Typography>
                            <Typography fontSize="12px">
                                Email: contact@example.com
                            </Typography>
                        </Box>
                    </Box>

                    <Box display='flex' gap={3} justifyContent='center' width={'100%'} alignItems='center'>
                        <Avatar alt="Travis Howard" src="https://images.rawpixel.com/image_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcm0zMjgtMzY2LXRvbmctMDhfMS5qcGc.jpg" sx={{ width: 65, height: 65 }} />
                        <Box>
                            <Typography fontWeight='bold' fontSize={'1.1rem'}>John Doe</Typography>
                            <Typography fontSize="12px" color="#A6A6A6" >Senior Developer Manager</Typography>
                            <Typography fontSize="12px">
                                Phone: +234567890
                            </Typography>
                            <Typography fontSize="12px">
                                Email: contact@example.com
                            </Typography>
                        </Box>
                    </Box>


                    
                </Box>

            </Box>
            <Footer/>
        </>
    )
}
export default ContactUs;