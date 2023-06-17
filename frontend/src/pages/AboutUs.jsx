import React from 'react'
import { Box, Typography } from '@mui/material'
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Features from "../components/About/Features";
import Banner from '../components/Tools/Banner';

const AboutUs = () => {
    const styles = {
        // background: `url(${OrganicImg}) no-repeat center center fixed`,
        backgroundSize: "cover",
        height: "100vh",
        width: "100%",
    };
    return (
        <>
            <Header/>
            <Banner title='#About Us' text='Know us better and connect with us'/>
            <Box display='flex' height='80vh'  justifyContent='center'>

                <Box flex={0.5} display='flex' justifyContent="center" alignItems='center' 
                // bgcolor={'dodgerblue'}
                >
                    <img src="https://img.freepik.com/free-vector/ecommerce-web-page-concept-illustration_114360-8204.jpg?w=740&t=st=1685942652~exp=1685943252~hmac=a966b7b2a7e13e82c32bf8cf3fa770098cf415695e3d63d38195db561e122e53" width='650px'/>
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

            <Box display='flex' height='80vh'  justifyContent='center'>
               
                <Box display='flex' flex='0.5'>
                    <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
                        <Box paddingX={5}>

                            <Typography display='flex' justifyContent='start' width="77%" fontFamily='sans-serif' fontWeight='700' fontSize="40px" paddingBottom="10px" >Who We Are?</Typography>

                            <Typography paddingBottom="20px" fontWeight='200' >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim suhsah suha  aisa  sia sii isa  suhua veniam. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim suhsah suha  aisa  sia sii isa  suhua veniam. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim suhsah suha  aisa  sia sii isa  suhua veniam.  </Typography>

                            <Typography fontWeight='200' >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod  </Typography>

                        </Box>

                    </Box>
                </Box>
                <Box flex={0.5} display='flex' justifyContent="center" alignItems='center' 
                // bgcolor={'pink'}
                >
                    <img src="https://img.freepik.com/free-vector/ecommerce-web-page-concept-illustration_114360-8204.jpg?w=740&t=st=1685942652~exp=1685943252~hmac=a966b7b2a7e13e82c32bf8cf3fa770098cf415695e3d63d38195db561e122e53" width='650px'/>
                </Box>
            </Box>
            <Features/>
            <Footer/>
        </>
    )
}

export default AboutUs