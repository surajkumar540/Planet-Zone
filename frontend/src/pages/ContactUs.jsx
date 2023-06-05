import { Box, Typography,TextField } from "@mui/material";
import React from "react";

const ContactUs = () =>{
    return(
        <>
            <Box display='flex'>
                <Box  display='flex' flexDirection='column' flex='0.5'>
                    <Typography>Leave a Message</Typography>
                    <Typography>We love to hear from you</Typography>
                    <TextField fullWidth label="Your Name" id="name" />
                    <TextField fullWidth label="E-mail" id="email" />
                    <TextField fullWidth label="Subject" id="subject" />
                    <TextField fullWidth label="Your Message" id="message" />
                </Box>
                <Box>

                </Box>
            </Box>
        </>
    )
}
export default ContactUs;