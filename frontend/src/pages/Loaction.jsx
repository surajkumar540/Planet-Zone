import React, { useEffect, useState } from 'react'
import { Box, Icon, Input, Typography } from '@mui/material'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CallIcon from '@mui/icons-material/Call';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
const AboutUs = () => {
    const [location, setLocation] = useState("Shalimar Bagh")
    const [mapLink, setMapLink] = useState("https://maps.google.com/?q=28.6129,77.2295;&output=embed");

    const handleChangeLocation = async (e) => {
        setLocation(e.target.value)

    }

    const handleSearchLocation = async (e) => {
        e.preventDefault()
        // console.log("checkkk")
        try {
            const response = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=38%20Upper%20Montagu%20Street%2C%20Westminster%20W1H%201LJ%2C%20United%20Kingdom&apiKey=25a6015c3c6c4f91952b38ff62d67334`)
            // console.log(response)
        } catch (error) {
            // console.log(error)
        }
    }

    useEffect(() => {
        const lat = 28.6129;
        const lon = 77.2295;
        const src = `https://maps.google.com/maps?q=${lat},${lon}&hl=es;&output=embed`
        setMapLink(src)
    }, [])

    return (


        <>
            <Box display='flex' justifyContent='center' >
                <Box display='flex' justifyContent='center' paddingLeft='4rem' flexDirection="column" flex='0.4'  >
                    <Box>
                        <Typography color='gray' sx={{ fontSize: "15px" }} >GET In Touch</Typography>
                        <Typography fontWeight="bold" fontSize="30px" >Visit one of our agency locations of contact us today</Typography>
                        <Typography fontWeight="bold" sx={{ fontSize: "15px" }}>Head Office</Typography>
                    </Box>

                    <Box display='flex' justifyContent='center' flexDirection="column" paddingY={2} gap={1}>
                        <Box display='flex' gap={1.5} alignItems='center'>
                            <LocationOnOutlinedIcon sx={{ fontSize: 15 }} />
                            <Typography sx={{ fontSize: "13px", color: 'gray' }}>6 Shalimar Street Rohini Delhi, India</Typography>
                        </Box>

                        <Box display='flex' gap={1.5} alignItems='center'>
                            <EmailOutlinedIcon sx={{ fontSize: 15 }} />
                            <Typography sx={{ fontSize: "13px", color: 'gray' }}>suraj@gmail.com</Typography>
                        </Box>

                        <Box display='flex' gap={1.5} alignItems='center'>
                            <CallIcon sx={{ fontSize: 15 }} />
                            <Typography sx={{ fontSize: "13px", color: 'gray' }}>9560323232</Typography>
                        </Box>

                        <Box display='flex' gap={1.5} alignItems='center'>
                            <AccessTimeIcon sx={{ fontSize: 15 }} />
                            <Typography sx={{ fontSize: "13px", color: 'gray' }}>Monday to Sunday: 9:00 am to 6:00 pm</Typography>
                        </Box>
                    </Box>
                </Box>
                <Box display='flex' flex='0.5'>
                    <Box display="flex" justifyContent={'center'}  width="90%" height="400px" flexDirection='column' >

                        <Box display="flex" flex={0.15} bg='whitesmoke'  justifyContent={'center'} alignItems='center'>
                            <Box display="flex" flex={0.9} bg='white'>
                                <Input
                                    _focusVisible={false} bgcolor='white'
                                    type={'search'} name='search' value={location} onChange={handleChangeLocation}
                                />
                            </Box>
                            <Box display="flex" flex={0.1} justifyContent='center' alignItems='center'>
                                {/* <Icon as={BiSearch} bgcolor='#1B72E8' color={'white'} padding='2' borderRadius={'10px'} onClick={handleSearchLocation} /> */}
                            </Box>
                        </Box>
                        <Box display="flex" flex={0.85}>
                            <iframe src={mapLink} width="100%" height="100%" allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                        </Box>
                    </Box>

                </Box>
            </Box>
        </>
    )
}

export default AboutUs