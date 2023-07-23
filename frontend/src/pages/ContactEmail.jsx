import * as React from 'react';
import { useState, useEffect } from 'react';
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
import { getContactUs } from '../api/devApi';


export default function ContactEmail() {

    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }));


   

    const [formValues, setFormValues] = useState()


    const fetchContactUsData = async () => {

        try {
    
          const response = await getContactUs();
          console.log(response);
          setFormValues(response);
        }
        catch (error) {
          console.log(error);
        }
      }
    
    
      useEffect(() => {
        fetchContactUsData();
      }, [])



    return (
        <>

            <Box bgcolor='#C4D7B2' minHeight={"87vh"}  p={1}>

                <Box display="flex" justifyContent="space-between">
                    <Box display="flex" justifyContent="start">
                        <Typography fontSize="30px" fontWeight="bold" color="#17594A" pl={2} >Contacts Mail</Typography>
                        <EmailOutlinedIcon />
                    </Box>
                    {
                        formValues?.data?.length >= 1 &&
                        <Box mr={2}>
                            <DeleteModal />
                        </Box>
                    }

                </Box>

                <Grid container spacing={2} columns={12} p={2}>
                    {
                        formValues?.data?.map((item) => {
                            return (
                                <Grid item  xs={3.9}  bgcolor="white" minHeight="130px" borderRadius="10px" m={"0.3rem"}>
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