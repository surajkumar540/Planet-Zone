import * as React from 'react';

import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Header from "../components/Header/Header";
import DeleteIcon from '@mui/icons-material/Delete';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import DeleteModal from '../components/Modals/DeleteModal';
import { experimentalStyled as styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import LocationOnIcon from '@mui/icons-material/LocationOn';


export default function ContactEmail() {

    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }));


    const dummyData = [
        {
            name: "Suraj kumar",
            email: "surajgautam56878@gmail.com",
            city: "Haider pur delhi 110088",
            message:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type."
        },
        {
            name: "Jai kumar",
            email: "priya@gmail.com",
            city: "Haider pur delhi 110088",
            message:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type.n"
        }, {
            name: "Pranay kumar",
            email: "jai@gmail.com",
            city: "Haider pur delhi 110088",
            message:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type.n"
        }, {
            name: "Priya kumar",
            email: "surajgautam56878@gmail.com",
            city: "Haider pur delhi 110088",
            message:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type.n"
        }, {
            name: "Raki kumar",
            email: "rakiggdsy8@gmail.com",
            city: "Haider pur delhi 110088",
            message:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type.n"
        }, {
            name: "Criuspus kumar",
            email: "crsiuhhsbpos8@gmail.com",
            city: "Haider pur delhi 110088",
            message:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type.n"
        }, {
            name: "Satyam kumar",
            email: "satyam8@gmail.com",
            city: "Haider pur delhi 110088",
            message:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type.n"
        }
    ]



    return (
        <>
            <Header />

            <Box bgcolor='lightgray' minHeight="88vh" p={1}>

                <Box display="flex" justifyContent="space-between">
                    <Box display="flex" justifyContent="start">
                        <Typography fontSize="30px" fontWeight="bold" pl={2} >Contacts Mail</Typography>
                        <EmailOutlinedIcon />
                    </Box>
                    {
                        dummyData.length >= 1 &&
                        <Box mr={2}>
                            <DeleteModal />
                        </Box>
                    }

                </Box>

                <Grid container spacing={2} columns={12} p={2}>
                    {
                        dummyData.map((item) => {
                            return (
                                <Grid item  xs={3.9}  bgcolor="white" borderRadius="10px" m={"0.3rem"}>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box display="flex" alignItems="center">
                                        <Avatar alt={item.name} sx={{height:60, width:60 }} src="/static/images/avatar/1.jpg" />
                                        <Box >
                                            <Typography pl={1} >{item.name}</Typography>
                                            <Box display="flex" alignItems="center" pl={1} gap={0.4}>
                                                <EmailOutlinedIcon sx={{ fontSize: '17px', color:"green" }} />
                                                <Typography fontSize='13px' >{item.email}</Typography>
                                            </Box>
                                    <Box display="flex" pl={1} alignItems="center" gap={0.3} >
                                        <LocationOnIcon sx={{ fontSize: '17px', color:"blueviolet" }}/>
                                        <Typography  fontSize='13px'>{item.city}</Typography>
                                    </Box>
                                        </Box>
                                        </Box>
                                        <Box pr={2}>
                                            <DeleteIcon sx={{ fontSize: '20px', cursor: "pointer", color: "red" }} />
                                        </Box>
                                    </Box>

                                    <Box px={1} py={1}  display="flex"  >
                                        <Typography  >{item.message}</Typography>
                                    </Box>
                                </Grid>

                            )
                        })
                    }
                </Grid>
            </Box>


        </>
    );
}