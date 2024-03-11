import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, CardMedia, InputLabel, MenuItem, Select, FormControl, Button } from "@mui/material";
import C from "../assets/Auth/c.jpg"
import { getProfile, setProfile } from "../api/userApi";
import Footer from "../components/Footer/Footer";

const Profile = () => {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("");
  const [edit, setEdit] = useState(false);
  
  const setProfileData = async () => {
    try {
      const obj = {
        firstName,
        lastName,
        email,
        linkedIn,
        twitter,
        address
      }
      console.log(obj)
      const response = await setProfile(obj);
      if (response.status) {
        setEdit(false)
        fetchProfileData()
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchProfileData = async () => {
    try {
      const { data } = await getProfile();
      setFirstName(data.firstName);
      setLastName(data.lastName);
      setEmail(data.email);
      setAddress(data.address)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchProfileData()
  }, [])

  return (
    <>
      <Box p={{ xs: '.6rem', md: '1rem', lg: "2rem" }}>
        <Box>
          <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
            <Typography sx={{ fontSize: { xs: "1.8rem", md: "2rem", lg: '3rem' } }}>My Profile</Typography>
            <Button variant="contained" sx={{ textTransform: 'capitalize', borderRadius: '5px' }} onClick={() => setEdit((prev) => !prev)}>Edit</Button>
          </Box>

          <Box mt="1.8rem">
            <Box display={"flex"} mb='1.5rem'>

              <Box flex={0.75} display={'flex'} flexDirection={'column'} justifyContent={'space-around'}>
                <Box display={'flex'} mb={{ xs: '1rem', md: '0rem' }}>

                  <Box flex={0.5}>
                    <TextField disabled={edit === false ? true : false} value={firstName} onChange={(e) => setFirstName(e.target.value)} id="outlined-basic" label="First name" variant="outlined" sx={{ width: "95%" }} />
                  </Box>

                  <Box flex={0.5} display={'flex'} justifyContent={'flex-end'}>
                    <TextField disabled={edit === false ? true : false} value={lastName} onChange={(e) => setLastName(e.target.value)} id="outlined-basic" label="Last name" variant="outlined" sx={{ width: "95%" }} />
                  </Box>
                </Box>
                <Box >
                  <TextField disabled value={email} onChange={(e) => setEmail(e.target.value)} id="outlined-basic" label="Email" variant="outlined" fullWidth />
                </Box>
              </Box>

              <Box flex={0.25} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                <CardMedia
                  sx={{ height: { xs: '5rem', sm: '7rem', md: '10rem', lg: "11rem" }, width: { xs: '5rem', sm: '7rem', md: '10rem', lg: "11rem" }, borderRadius: '100%', ml: '.5rem' }}
                  image={C}
                  title="green iguana"
                />
              </Box>

            </Box>


            <Box display={'flex'} my={'1.5rem'} width={{ xs: '100%', sm: '80%' }}>
              <TextField disabled={edit === false ? true : false}
                fullWidth
                id="outlined-multiline-static"
                label="Address"
                multiline
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Box>

            {edit && <Box>
              <Button variant="contained" sx={{ width: '10rem', textTransform: 'capitalize' }} onClick={setProfileData}>Save</Button>
            </Box>}
          </Box>

        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default Profile;
