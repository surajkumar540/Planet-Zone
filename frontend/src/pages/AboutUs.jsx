import React from "react";
import { Box, Typography, Container } from "@mui/material";
import Features from "../components/Tools/Features";
import Banner from "../components/Tools/Banner";
import Footer from "../components/Footer/Footer";

const AboutUs = () => {
  return (
    <>
      <Banner
        title="About Us"
        text="Dedicated to purity, sustainability, and your well-being."
      />

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Section 1 */}
        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          alignItems="center"
          gap={6}
          mb={10}
        >
          {/* Left */}
          <Box
            flex={1}
            sx={{
              position: "relative",
              height: { xs: "300px", md: "450px" },
              width: "100%",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "10%",
                left: "10%",
                width: "80%",
                height: "80%",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
              }}
            />

            <Box
              sx={{
                position: "absolute",
                top: "20%",
                right: "5%",
                width: "250px",
                height: "300px",
                borderRadius: "20px",
                bgcolor: "#fff",
                boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: "#3CB815",
                  opacity: 0.2,
                }}
              />
            </Box>
          </Box>

          {/* Right */}
          <Box flex={1}>
            <Typography
              sx={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: { xs: "32px", md: "42px" },
                mb: 3,
              }}
            >
              Who We Are
            </Typography>

            <Typography sx={{ mb: 2 }}>
              We are a community of farmers, artisans, and nature enthusiasts
              dedicated to bringing the purest organic products to your table.
            </Typography>

            <Typography sx={{ borderLeft: "4px solid #3CB815", pl: 2 }}>
              From the fields to your doorstep, we ensure sustainability and
              transparency.
            </Typography>
          </Box>
        </Box>

        {/* Section 2 */}
        <Box
          display="flex"
          flexDirection={{ xs: "column-reverse", md: "row" }}
          alignItems="center"
          gap={6}
        >
          {/* Left */}
          <Box flex={1}>
            <Typography
              sx={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: { xs: "32px", md: "42px" },
                mb: 3,
              }}
            >
              Our Mission
            </Typography>

            <Typography sx={{ mb: 2 }}>
              Our mission is to connect farmers directly with consumers and
              promote sustainable shopping.
            </Typography>

            <Typography>
              Every purchase supports a healthier planet and local economy.
            </Typography>
          </Box>

          {/* Right */}
          <Box
            flex={1}
            sx={{
              position: "relative",
              height: { xs: "300px", md: "450px" },
              width: "100%",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 2,
              }}
            >
              {[...Array(9)].map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    bgcolor: i % 2 === 0 ? "#F1F8E9" : "#fff",
                    borderRadius: "16px",
                  }}
                >
                  {i === 4 && (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: "#3CB815",
                        m: "auto",
                        mt: "40%",
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>

      <Features />
      <Footer />
    </>
  );
};

export default AboutUs;