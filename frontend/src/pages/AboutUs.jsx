import React from 'react'
import { Box, Typography, CardMedia } from '@mui/material'
import Features from "../components/About/Features";
import Banner from '../components/Tools/Banner';
import Footer from '../components/Footer/Footer';

const AboutUs = () => {
    return (
        <>
            <Banner title='#About Us' text='Know us better and connect with us' />


            <Box display='flex' height='80vh' justifyContent='center'>
                <Box flex={0.5} display='flex' justifyContent="center" alignItems='center'
                // bgcolor={'pink'}
                >
                    <CardMedia
                        sx={{ width: 650 }}
                        component="img"
                        image="https://img.freepik.com/free-vector/internship-job-training-illustration_23-2148753207.jpg?w=740&t=st=1688705529~exp=1688706129~hmac=7faaed6fcc19758060db0a4686794a65ae056bcf739351ad5daf0c9261b56ef8"
                    />
                </Box>

                <Box display='flex' flex='0.5'>
                    <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
                        <Box paddingX={5}>

                            <Typography display='flex' justifyContent='start' width="77%" fontFamily='sans-serif' fontWeight='700' fontSize="40px" paddingBottom="10px" >Who We Are?</Typography>

                            <Typography paddingBottom="20px" fontWeight='200' >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim suhsah suha  aisa  sia sii isa  suhua veniam. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim suhsah suha  aisa  sia sii isa  suhua veniam. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim suhsah suha  aisa  sia sii isa  suhua veniam.  </Typography>

                            <Typography fontWeight='200' >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod  </Typography>

                        </Box>

                    </Box>
                </Box>

            </Box>



            <Box display='flex' height='80vh' justifyContent='center'>

                <Box display='flex' flex='0.5'>
                    <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
                        <Box paddingX={5}>

                            <Typography display='flex' justifyContent='start' width="77%" fontFamily='sans-serif' fontWeight='700' fontSize="40px" paddingBottom="10px" >Who Are We Doing This?</Typography>

                            <Typography paddingBottom="20px" fontWeight='200' >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim suhsah suha  aisa  sia sii isa  suhua veniam. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim suhsah suha  aisa  sia sii isa  suhua veniam. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim suhsah suha  aisa  sia sii isa  suhua veniam.  </Typography>

                            <Typography fontWeight='200' >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod  </Typography>

                        </Box>

                    </Box>
                </Box>
                <Box flex={0.5} display='flex' justifyContent="center" alignItems='center'>
                    <CardMedia
                        sx={{ width: 650 }}
                        component="img"
                        image="https://img.freepik.com/free-vector/business-team-putting-together-jigsaw-puzzle-isolated-flat-vector-illustration-cartoon-partners-working-connection-teamwork-partnership-cooperation-concept_74855-9814.jpg?w=996&t=st=1688705579~exp=1688706179~hmac=594f834ac990a3ccecf094111a6f2a36241f9231f8c4286b1068cc5b2c3b2dc1"
                    />
                </Box>
            </Box>

            <Features />
            <Footer />
        </>
    )
}

export default AboutUs