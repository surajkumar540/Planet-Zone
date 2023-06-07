import { Box, Typography, TextField, Button } from "@mui/material";
import React from "react";
import Avatar from '@mui/material/Avatar';
const ContactUs = () => {
    return (
        <>
            <Box display='flex' margin={3} padding={4} border="1px solid #D9D9D9" borderRadius='6px'>
                <Box display='flex' flexDirection='column' flex='0.5' gap={2}>
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

                <Box display='flex' flex='0.5' paddingLeft={16} flexDirection="column" justifyContent='center' alignItems='start' gap={4} >
                    <Box display='flex' gap={1} justifyContent='center' alignItems='center'>
                        <Avatar alt="Travis Howard" src="https://images.rawpixel.com/image_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcm0zMjgtMzY2LXRvbmctMDhfMS5qcGc.jpg" sx={{ width: 60, height: 60 }} />
                        <Box>
                            <Typography fontWeight='bold' >John Doe</Typography>
                            <Typography fontSize="12px" color="#A6A6A6" >Senior Developer Manager</Typography>
                            <Typography fontSize="12px">
                                Phone: +234567890
                            </Typography>
                            <Typography fontSize="12px">
                                Email: contact@example.com
                            </Typography>
                        </Box>
                    </Box>

                    <Box display='flex' gap={1} justifyContent='center' alignItems='center'>
                        <Avatar alt="Travis Howard" src="https://images.rawpixel.com/image_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcm0zMjgtMzY2LXRvbmctMDhfMS5qcGc.jpg" sx={{ width: 60, height: 60 }} />
                        <Box>
                            <Typography fontWeight='bold' >John Doe</Typography>
                            <Typography fontSize="12px" color="#A6A6A6" >Senior Developer Manager</Typography>
                            <Typography fontSize="12px">
                                Phone: +234567890
                            </Typography>
                            <Typography fontSize="12px">
                                Email: contact@example.com
                            </Typography>
                        </Box>
                    </Box>

                    <Box display='flex' gap={1} justifyContent='center' alignItems='center'>
                        <Avatar alt="Travis Howard" src="https://images.rawpixel.com/image_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcm0zMjgtMzY2LXRvbmctMDhfMS5qcGc.jpg" sx={{ width: 60, height: 60 }} />
                        <Box>
                            <Typography fontWeight='bold' >John Doe</Typography>
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
        </>
    )
}
export default ContactUs;