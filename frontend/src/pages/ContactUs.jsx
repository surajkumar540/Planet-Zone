import { Box, Typography, TextField, Button } from "@mui/material";
import React from "react";
import Avatar from '@mui/material/Avatar';
import Banner from "../components/Tools/Banner";
import Location from "../components/Tools/Location";
import { useState } from "react";
import { contactUsApi } from "../api/devApi";
import Footer from "../components/Footer/Footer";

const ContactUs = () => {

    const [name,setName]=useState("")
    const [email,setEmail]=useState("")
    const [city,setCity]=useState("");
    const [message,setMessage]=useState("");

    const handleSendMail=async(e)=>{
        e.preventDefault()
        try{
            const obj={name,email,city,message}
            const response=await contactUsApi(obj)
            if(response.status)
            {
                setName("")
                setEmail("")
                setCity("")
                setMessage("")
            }
            
        }catch(error)
        {
            console.log(error)
        }
    }

    return (
        <>
            <Banner title='#Contact Us' text='Connect with us to be part of our family'/>
            <Location/>

            <Box display='flex' margin={3} border="1px solid #D9D9D9" borderRadius='6px'>


                <Box display='flex' flexDirection='column' flex='0.7' gap={2} p='2rem'>
                <form onSubmit={handleSendMail}>
                    <Box mb='1rem'>
                    <Typography variant="h6">Leave a Message</Typography>
                    <Typography fontSize="30px" fontWeight="bold">We love to hear from you</Typography>
                    </Box>
                    
                    <Box mb='1rem'>
                    <TextField size='small' type="text" fullWidth label="Your Name" name="name" value={name} onChange={(e)=>setName(e.target.value)}/>
                    </Box>

                    <Box mb='1rem'>
                    <TextField size='small' type="email" fullWidth label="E-mail" name="email" value={email}  onChange={(e)=>setEmail(e.target.value)}/>
                    </Box>
                    
                    <Box mb='1rem'>
                    <TextField size='small' type="text" fullWidth label="City" name="city" value={city}  onChange={(e)=>setCity(e.target.value)}/>
                    </Box>
                    
                    <Box mb='1rem'>
                    <TextField multiline rows={5} fullWidth label="Your Message" name="message" value={message}  onChange={(e)=>setMessage(e.target.value)}/>
                    </Box>
                    
                    <Button variant="contained" sx={{width:'100px'}} type="submit">
                        Send
                    </Button>
                </form>
                </Box>

                <Box display='flex' flex='0.3' flexDirection="column" justifyContent='center' alignItems='start' gap={4}>

                    <Box display='flex' gap={3} justifyContent='center' width={'100%'} alignItems='center'>
                        <Avatar alt="Jai" src="https://media.licdn.com/dms/image/D4D03AQFWmgwlOhT3JA/profile-displayphoto-shrink_400_400/0/1687007524112?e=1696464000&v=beta&t=2dP9mDfwLlf3y7OMOAx-ORWamk-G-ffxNdJLMtjIFuM" sx={{ width: 65, height: 65 }} />
                        <Box>
                            <Typography fontWeight='bold' fontSize={'1.1rem'}>Jai Singh</Typography>
                            <Typography fontSize="12px" color="#A6A6A6" >Frontend Developer</Typography>
                            <Typography fontSize="12px">
                                Phone: +91 9667201750
                            </Typography>
                            <Typography fontSize="12px">
                                Email: jai.singh.corporate@gmail.com
                            </Typography>
                        </Box>
                    </Box>

                    <Box display='flex' gap={3} justifyContent='center' width={'100%'} alignItems='center'>
                        <Avatar alt="Suraj" src="https://media.licdn.com/dms/image/D4D03AQF48TaiZ9esPw/profile-displayphoto-shrink_400_400/0/1687546094231?e=1696464000&v=beta&t=48xXOZh030Hnu40tLrWeUOjUoq8fRMZKiPpQsg1nWwA" sx={{ width: 65, height: 65 }} />
                        <Box>
                            <Typography fontWeight='bold' fontSize={'1.1rem'}>Suraj Kumar</Typography>
                            <Typography fontSize="12px" color="#A6A6A6" >Frontend Developer</Typography>
                            <Typography fontSize="12px">
                                Phone: +91 9560234568
                            </Typography>
                            <Typography fontSize="12px">
                                Email: surajgautam56878@gmail.com
                            </Typography>
                        </Box>
                    </Box>
{/* 
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
                    </Box> */}


                    
                </Box>

            </Box>
            <Footer/>
        </>
    )
}
export default ContactUs;