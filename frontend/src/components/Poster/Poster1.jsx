import React, { useEffect, useRef } from "react";
import { Box, Typography, Button, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Poster1 = () => {
  const navigate = useNavigate();

  const heroProduct = {
    name: "Grow Bag",
    brand: "Iconic",
    originalPrice: 400,
    discount: 4,
    finalPrice: 388,
    tag: "Eco-Friendly",
  };

  return (
    <Box
      sx={{
        mx: { xs: 2, sm: 3, md: 4 },
        mt: { xs: 2, sm: 3 },
        mb: { xs: 4, sm: 5 },
        borderRadius: "28px",
        overflow: "hidden",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        minHeight: { xs: "auto", md: "560px" },
        boxShadow: "0 32px 80px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.06)",
        position: "relative",
      }}
    >
      {/* LEFT — Content Area */}
      <Box
        sx={{
          flex: { md: "0 0 52%" },
          background: "#F8F6F1",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: { xs: 4, sm: 5, md: 8, lg: 10 },
          py: { xs: 6, md: 8 },
          position: "relative",
          zIndex: 2,
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #D8D4C9 1px, transparent 0)",
            backgroundSize: "24px 24px",
            opacity: 0.45,
            zIndex: -1,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            width: "120px",
            height: "100%",
            background:
              "linear-gradient(to right, transparent, rgba(248,246,241,0.9))",
            zIndex: 1,
          },
        }}
      >
        {/* Eco Tag */}
        <Chip
          label={`✦  ${heroProduct.tag}`}
          sx={{
            width: "fit-content",
            bgcolor: "#E6F4EA",
            color: "#2A6E30",
            fontWeight: 700,
            fontSize: "11px",
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            mb: 3.5,
            height: "30px",
            border: "1px solid #B9DFC0",
          }}
        />

        {/* Headline */}
        <Typography
          component="h1"
          sx={{
            fontFamily: "'Cormorant Garamond', 'Georgia', serif",
            fontSize: { xs: "52px", sm: "60px", md: "72px", lg: "80px" },
            fontWeight: 700,
            lineHeight: 0.95,
            color: "#1C1C1A",
            mb: 3,
            letterSpacing: "-1px",
          }}
        >
          Cultivate
          <br />
          <Box
            component="span"
            sx={{
              color: "#4A7C30",
              fontStyle: "italic",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: "4px",
                left: 0,
                right: 0,
                height: "3px",
                background: "linear-gradient(to right, #4A7C30, transparent)",
                borderRadius: "2px",
              },
            }}
          >
            Your Life
          </Box>
        </Typography>

        {/* Product Info Card */}
        <Box
          sx={{
            mb: 4,
            p: 3,
            borderRadius: "16px",
            bgcolor: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(74,124,48,0.15)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            position: "relative",
            zIndex: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 800,
                fontSize: "18px",
                color: "#1C1C1A",
              }}
            >
              {heroProduct.name}
            </Typography>
            <Box
              sx={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                bgcolor: "#4A7C30",
              }}
            />
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                color: "#888",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {heroProduct.brand}
            </Typography>
          </Box>

          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px",
              color: "#777",
              mb: 2,
              lineHeight: 1.6,
            }}
          >
            Premium quality for your home garden. Begin your organic journey
            with confidence.
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              sx={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "36px",
                fontWeight: 700,
                color: "#2A6E30",
                lineHeight: 1,
              }}
            >
              ₹{heroProduct.finalPrice}
            </Typography>
            <Typography
              sx={{
                fontSize: "16px",
                color: "#bbb",
                textDecoration: "line-through",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              ₹{heroProduct.originalPrice}
            </Typography>
            <Box
              sx={{
                bgcolor: "#FFEBE6",
                color: "#C93B1A",
                fontWeight: 800,
                fontSize: "11px",
                px: 1.2,
                py: 0.4,
                borderRadius: "6px",
                letterSpacing: "0.5px",
              }}
            >
              {heroProduct.discount}% OFF
            </Box>
          </Box>
        </Box>

        {/* CTA */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/shop")}
            sx={{
              bgcolor: "#2A6E30",
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              letterSpacing: "0.5px",
              px: 4,
              py: 1.6,
              borderRadius: "14px",
              boxShadow: "0 12px 28px rgba(42, 110, 48, 0.35)",
              textTransform: "none",
              "&:hover": {
                bgcolor: "#1B5224",
                transform: "translateY(-3px)",
                boxShadow: "0 18px 36px rgba(42, 110, 48, 0.45)",
              },
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            Shop Now →
          </Button>
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px",
              color: "#999",
              cursor: "pointer",
              "&:hover": { color: "#4A7C30" },
              transition: "color 0.2s",
            }}
          >
            View all products
          </Typography>
        </Box>
      </Box>

      {/* RIGHT — Visual Panel */}
      <Box
        sx={{
          flex: { md: "0 0 48%" },
          background:
            "linear-gradient(145deg, #3D6B27 0%, #1B4520 50%, #0F3016 100%)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          minHeight: { xs: "360px", md: "auto" },
        }}
      >
        {/* Background texture circles */}
        {[
          { size: 700, top: "-250px", right: "-200px", opacity: 0.06 },
          { size: 500, bottom: "-180px", left: "-150px", opacity: 0.08 },
          { size: 300, top: "50%", left: "50%", opacity: 0.05 },
        ].map((c, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: c.size,
              height: c.size,
              border: "1.5px solid rgba(255,255,255,0.3)",
              borderRadius: "50%",
              top: c.top,
              bottom: c.bottom,
              left: c.left,
              right: c.right,
              transform: i === 2 ? "translate(-50%,-50%)" : undefined,
              opacity: c.opacity * 5,
            }}
          />
        ))}

        {/* Radial glow */}
        <Box
          sx={{
            position: "absolute",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle, rgba(139,195,74,0.25) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Leaf compositions */}
        <Box sx={{ position: "relative", width: 280, height: 280, zIndex: 2 }}>
          {/* Outer leaf ring */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              border: "2px dashed rgba(255,255,255,0.12)",
              borderRadius: "50%",
            }}
          />

          {/* Leaf 1 — large back */}
          <Box
            sx={{
              position: "absolute",
              width: 230,
              height: 230,
              bgcolor: "rgba(255,255,255,0.07)",
              borderRadius: "0 60% 0 60%",
              border: "1.5px solid rgba(255,255,255,0.2)",
              backdropFilter: "blur(4px)",
              transform: "rotate(-40deg)",
              top: 20,
              left: 20,
            }}
          />

          {/* Leaf 2 — mid */}
          <Box
            sx={{
              position: "absolute",
              width: 180,
              height: 180,
              bgcolor: "rgba(139,195,74,0.2)",
              borderRadius: "0 60% 0 60%",
              transform: "rotate(-40deg)",
              top: 50,
              left: 50,
              boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
              border: "1px solid rgba(139,195,74,0.35)",
            }}
          />

          {/* Leaf 3 — small accent */}
          <Box
            sx={{
              position: "absolute",
              width: 80,
              height: 80,
              bgcolor: "rgba(255,255,255,0.12)",
              borderRadius: "0 50% 0 50%",
              transform: "rotate(135deg)",
              bottom: 30,
              right: 20,
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          />

          {/* Center icon */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 5,
              textAlign: "center",
              bgcolor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              borderRadius: "50%",
              width: 110,
              height: 110,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            <Typography sx={{ fontSize: "44px", lineHeight: 1 }}>🌱</Typography>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.85)",
                fontSize: "9px",
                fontWeight: 800,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                mt: 0.5,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Natural
            </Typography>
          </Box>
        </Box>

        {/* Bottom label strip */}
        <Box
          sx={{
            position: "absolute",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 3,
            alignItems: "center",
          }}
        >
          {["Organic", "Sustainable", "Homegrown"].map((label) => (
            <Typography
              key={label}
              sx={{
                color: "rgba(255,255,255,0.45)",
                fontSize: "10px",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
              }}
            >
              {label}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Poster1;
