import React, { useState } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { Box, Typography, TextField,CardMedia,InputLabel,MenuItem,Select,FormControl, Button } from "@mui/material";
import C from "../assets/Auth/c.jpg"

const Profile = () => {
    const [firstName,setFirstName]=useState("Jai")
    const [lastName,setLastName]=useState("Singh")
    const [email,setEmail]=useState("jaibhandari804@gmail.com")
    const [gender,setGender]=useState("male")
    const [phoneNo,setPhoneNo]=useState("9667201750")
    const [linkedIn,setLinkedIn]=useState("jai-singh-linked")
    const [twitter,setTwitter]=useState("jaisingh2000")
    const [address,setAddress]=useState("B-1750, Holambi kalan Metro vihar phase- 2");
    const [edit,setEdit]=useState(false);

  return (
    <>
      <Header />
      <Box p={{xs:'.6rem',md:'1rem',lg:"2rem"}}>
        <Box>
          <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
            <Typography sx={{fontSize:{xs:"1.8rem",md:"2rem",lg:'3rem'}}}>My Profile</Typography>
            <Button variant="contained" sx={{textTransform:'capitalize',borderRadius:'5px'}} onClick={()=>setEdit((prev)=>!prev)}>Edit</Button>
          </Box>

          <Box mt="1.8rem">
            <Box display={"flex"} mb='1.5rem'>
              
              <Box flex={0.75} display={'flex'} flexDirection={'column'} justifyContent={'space-around'}>
                <Box display={'flex'} mb={{xs:'1rem',md:'0rem'}}>
                    <Box flex={0.5}>
                      <TextField disabled={edit===false?true:false} value={firstName} onChange={(e)=>setFirstName(e.target.value)} id="outlined-basic" label="First name" variant="outlined" sx={{width:"95%"}}/>
                    </Box>
                    <Box flex={0.5} display={'flex'} justifyContent={'flex-end'}>
                      <TextField disabled={edit===false?true:false} value={lastName} onChange={(e)=>setLastName(e.target.value)} id="outlined-basic" label="Last name" variant="outlined" sx={{width:"95%"}}/>
                    </Box>
                </Box>
                <Box >
                  <TextField disabled={edit===false?true:false} value={email} onChange={(e)=>setEmail(e.target.value)} id="outlined-basic" label="Email" variant="outlined" fullWidth />
                </Box>
              </Box>

              <Box flex={0.25} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                <CardMedia
                  sx={{ height: {xs:'5rem',sm:'7rem',md:'10rem',lg:"11rem"},width: {xs:'5rem',sm:'7rem',md:'10rem',lg:"11rem"},borderRadius:'100%',ml:'.5rem' }}
                  image={C}
                  title="green iguana"
                />
              </Box>

            </Box>

            <Box display={'flex'} width={{xs:'100%',sm:'80%'}} mb='1rem'>
                <Box flex={0.5}>
                <FormControl sx={{width:"95%"}} >
                    <InputLabel id="demo-simple-select-autowidth-label">Gender</InputLabel>
                    <Select
                    labelId="demo-simple-select-autowidth-label"
                    id="demo-simple-select-autowidth"
                    value={gender}
                    onChange={(e)=>setGender(e.target.value)}
                    autoWidth
                    disabled={edit===false?true:false}
                    label="Gender"
                    >
                    <MenuItem value="">Select</MenuItem>
                    <MenuItem value={'male'}>Male</MenuItem>
                    <MenuItem value={'female'}>Female</MenuItem>
                    </Select>
                </FormControl>
                </Box>
                <Box flex={0.5} display={'flex'} justifyContent={'flex-end'}>
                    <TextField disabled={ edit===false?true:false} value={phoneNo} onChange={(e)=>setPhoneNo(e.target.value)} id="outlined-basic" variant="outlined" sx={{width:"95%"}} label="Phone no"/>
                </Box>
            </Box>
            
            
            <Box display={'flex'} my={'1.5rem'} width={{xs:'100%',sm:'80%'}}>
                <Box flex={0.5}>
                    <TextField disabled={ edit===false?true:false} value={linkedIn} onChange={(e)=>setLinkedIn(e.target.value)} id="outlined-basic" variant="outlined" sx={{width:"95%"}} label="Linked In"/>
                </Box>
                <Box flex={0.5} display={'flex'} justifyContent={'flex-end'}>
                    <TextField disabled={edit===false?true:false} value={twitter} onChange={(e)=>setTwitter(e.target.value)} id="outlined-basic" variant="outlined" sx={{width:"95%"}} label="Twitter"/>
                </Box>
            </Box>
            
            <Box display={'flex'} my={'1.5rem'} width={{xs:'100%',sm:'80%'}}>
            <TextField disabled={ edit===false?true:false}
            fullWidth
                id="outlined-multiline-static"
                label="Address"
                multiline
                rows={3}
                value={address}
                onChange={(e)=>setAddress(e.target.value)}
                />
            </Box>
            
            {edit&&<Box>
                <Button variant="contained" sx={{width:'10rem',textTransform:'capitalize'}}>Save</Button>
            </Box>}
          </Box>

        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default Profile;
