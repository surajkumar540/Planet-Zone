import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Grid,
  Paper,
  Avatar,
  IconButton,
} from "@mui/material";
import React from "react";
import Banner from "../components/Tools/Banner";
import Location from "../components/Tools/Location";
import { useState } from "react";
import { contactUsApi } from "../api/contactApi";
import Footer from "../components/Footer/Footer";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import SendIcon from "@mui/icons-material/Send";

const ContactUs = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");

  const handleSendMail = async (e) => {
    e.preventDefault();
    try {
      const obj = { name, email, city, message };
      const response = await contactUsApi(obj);
      // Optionally add a success toast here
      setName("");
      setEmail("");
      setCity("");
      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  // Team data for cleaner mapping
  const teamMembers = [
    {
      name: "John Doe",
      role: "Senior Manager",
      phone: "+234 567 890",
      email: "john@planet.com",
      color: "#3CB815",
    },
    {
      name: "Sarah Smith",
      role: "Sales Lead",
      phone: "+234 567 891",
      email: "sarah@planet.com",
      color: "#FF9800",
    },
    {
      name: "Mike Johnson",
      role: "Customer Support",
      phone: "+234 567 892",
      email: "mike@planet.com",
      color: "#2196F3",
    },
  ];

  return (
    <>
      <Banner
        title="#Contact Us"
        text="Connect with us to be part of our family"
      />
      <Location />

      {/* Main Container */}
      <Box sx={{ bgcolor: "#FDFBF7", py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="flex-start">
            {/* LEFT SIDE - Contact Form */}
            <Grid item xs={12} md={7}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 5 },
                  borderRadius: 4,
                  border: "1px solid rgba(0,0,0,0.05)",
                  background: "#fff",
                }}
              >
                <Box mb={4}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: 700,
                      color: "#1A1A1A",
                      mb: 1,
                    }}
                  >
                    Send a Message
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    We'd love to hear from you. Fill out the form below and
                    we'll get back to you shortly.
                  </Typography>
                </Box>

                <form onSubmit={handleSendMail}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Your Name"
                        variant="outlined"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="City"
                        variant="outlined"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={5}
                        label="Your Message"
                        variant="outlined"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        endIcon={<SendIcon />}
                        sx={{
                          bgcolor: "#3CB815",
                          color: "#fff",
                          px: 5,
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 700,
                          textTransform: "none",
                          boxShadow: "0 4px 14px rgba(60, 184, 21, 0.25)",
                          "&:hover": { bgcolor: "#2fa012" },
                        }}
                      >
                        Send Message
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            </Grid>

            {/* RIGHT SIDE - Team Contacts */}
            <Grid item xs={12} md={5}>
              <Box display="flex" flexDirection="column" gap={3}>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    color: "#1A1A1A",
                    mb: 1,
                  }}
                >
                  Talk to Us Directly
                </Typography>

                {teamMembers.map((member, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 2.5,
                      border: "1px solid #f0f0f0",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
                        borderColor: "rgba(0,0,0,0.1)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    {/* Avatar with Initials & Color */}
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: member.color,
                        fontWeight: 700,
                        fontSize: "1.5rem",
                      }}
                    >
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </Avatar>

                    <Box flex={1}>
                      <Typography
                        fontWeight={700}
                        variant="subtitle1"
                        color="#333"
                      >
                        {member.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {member.role}
                      </Typography>
                      <Box display="flex" flexDirection="column" gap={0.5}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PhoneIcon sx={{ fontSize: 14, color: "#888" }} />
                          <Typography variant="caption" color="text.secondary">
                            {member.phone}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <EmailIcon sx={{ fontSize: 14, color: "#888" }} />
                          <Typography variant="caption" color="text.secondary">
                            {member.email}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Footer />
    </>
  );
};

export default ContactUs;
