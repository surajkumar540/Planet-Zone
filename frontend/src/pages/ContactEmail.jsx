import * as React from 'react';
import { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import DeleteModal from '../components/Modals/DeleteModal';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { deleteMail, getContactUs } from '../api/devApi';
import blankHome from "../assets/Images/admin_empty.webp"

export default function ContactEmail() {
    const [messages, setMessages] = useState()

    const fetchAllMails = async () => {
        try {
            const response = await getContactUs();
            setMessages(response.data);
        }
        catch (error) {
            console.log(error);
        }
    }

    const deleteMailFunction = async (emailId) => {
        try {
            await deleteMail(emailId);
            fetchAllMails()
        } catch (error) {
            console.log(error)
        }
    }


    useEffect(() => {
        fetchAllMails();
    }, [])



    return (
        <Box p={1}>

            <Box display="flex" justifyContent="space-between">
                <Box display="flex" justifyContent="start" marginTop={2} marginBottom={4}>
                    <Typography fontSize="30px" pl={2} pr='1rem'>Contacts Mail</Typography>
                    <EmailOutlinedIcon />
                </Box>
                {
                    messages?.length >= 1 &&
                    <Box mr={2} marginTop={2}>
                        <DeleteModal fetchAllMails={fetchAllMails}/>
                    </Box>
                }

            </Box>


            {
                messages?.length === 0 &&
                <Box display={'flex'} justifyContent={'center'} flexDirection={'columnn'} alignContent={'center'}>
                    <Box>
                        <CardMedia
                            sx={{ height: 440, width: 440 }}
                            image={blankHome}
                            title="green iguana"
                        />
                        <Typography textAlign={'center'} fontWeight={500} fontSize={'22px'}>No Messages Found</Typography>
                    </Box>
                </Box>
            }

            <Grid container spacing={2} columns={12} p={2}>
                {
                    messages?.map((item, index) => {
                        return (
                            <Grid key={index} item xs={3.9} minHeight="130px" borderRadius="10px" m={"0.3rem"} sx={{ background: "whitesmoke" }}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Box display="flex">
                                        <Avatar alt={item.name} sx={{ height: 50, width: 50 }} src="/static/images/avatar/1.jpg" />
                                        <Box >
                                            <Typography pl={1} fontWeight={600}>
                                                {item.name}
                                            </Typography>
                                            <Box display="flex" pl={1} alignItems={'center'}>
                                                <Typography fontSize='13px'>{item.email} - </Typography>
                                                <Typography fontSize='13px' sx={{ display: 'flex', alignItems: 'center'}}>
                                                    <LocationOnIcon sx={{ fontSize: '17px', color: "darkorange" }} />
                                                    {item.city}
                                                </Typography>

                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box pr={2}>
                                        <IconButton aria-label="delete" onClick={() => deleteMailFunction(item._id)}>
                                            <DeleteIcon sx={{ fontSize: '20px', cursor: "pointer", color: "red" }} />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Box px={1} py={1} display="flex"  >
                                    <Typography sx={{ textTransform: "lowercase" }}>{item.message}</Typography>
                                </Box>
                            </Grid>

                        )
                    })
                }
            </Grid>
        </Box>
    );
}