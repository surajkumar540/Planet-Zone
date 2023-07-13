import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Header from "../components/Header/Header";
import RemoveCircleOutlinedIcon from '@mui/icons-material/RemoveCircleOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import DeleteModal from '../components/Modals/DeleteModal';

import { Box, Button } from '@mui/material';

export default function ContactEmail() {

    const dummyData = [
        {
            name: "Suraj kumar",
            email: "surajgautam56878@gmail.com",
            phoneNo: "+91 9560234568",
            city: "Haider pur delhi 110088"
        }, {
            name: "Jai kumar",
            email: "priya@gmail.com",
            phoneNo: "+91 9560234568",
            city: "Haider pur delhi 110088"
        }, {
            name: "Pranay kumar",
            email: "jai@gmail.com",
            phoneNo: "+91 9560234568",
            city: "Haider pur delhi 110088"
        }, {
            name: "Priya kumar",
            email: "surajgautam56878@gmail.com",
            phoneNo: "+91 9560234568",
            city: "Haider pur delhi 110088"
        }, {
            name: "Raki kumar",
            email: "rakiggdsy8@gmail.com",
            phoneNo: "+91 9560234568",
            city: "Haider pur delhi 110088"
        }, {
            name: "Criuspus kumar",
            email: "crsiuhhsbpos8@gmail.com",
            phoneNo: "+91 9560234568",
            city: "Haider pur delhi 110088"
        }, {
            name: "Satyam kumar",
            email: "satyam8@gmail.com",
            phoneNo: "+91 9560234568",
            city: "Haider pur delhi 110088"
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

                {
                    dummyData.map((item) => {
                        return (
                            <List sx={{ bgcolor: 'white', m: 1, borderRadius: '8px' }} >
                                <ListItem display="flex">
                                    <ListItemAvatar >
                                        <Avatar alt={item.name} src="/static/images/avatar/1.jpg" />
                                    </ListItemAvatar>
                                    <Box display="flex" alignItems="center" width={"100%"} >
                                        <Typography width="80%" textAlign="left"  >{item.name}</Typography>
                                        <Box display="flex" width="100%" justifyContent="left" alignItems="center" gap={1}>
                                            <EmailOutlinedIcon sx={{ fontSize: '18px' }} />
                                            <Typography textAlign="left" color="green"  >{item.email}</Typography>
                                        </Box>
                                        <Typography textAlign="center" width="100%" color="gray" >{item.phoneNo}</Typography>
                                        <Typography textAlign="center" width="100%" >{item.city}</Typography>
                                        <Box textAlign="center" width="100%">
                                            <RemoveCircleOutlinedIcon sx={{ cursor: "pointer", color: "red" }} />
                                        </Box>
                                    </Box>
                                </ListItem>

                            </List>
                        )
                    })
                }
            </Box>


        </>
    );
}