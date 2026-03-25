import React from "react";
import { Box, Typography } from "@mui/material";
import Product from "./Product";
import ProdFilterModal from "../Modals/ProdFilterModal";

const Products = ({ products, heading, title }) => {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1400px",
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        py: 4,
        boxSizing: "border-box",
      }}
    >
      {/* Header Section */}
      <Box textAlign="center" mb={5}>
        <Typography
          sx={{
            fontFamily: "'Playfair Display', serif",
            fontSize: { xs: "2rem", sm: "2.8rem" },
            fontWeight: 700,
            color: "#1A1A1A",
            letterSpacing: "-0.02em",
            mb: 1,
          }}
        >
          {heading || "Featured Collection"}
        </Typography>
        <Typography
          sx={{
            fontSize: "1rem",
            color: "#666",
            maxWidth: "600px",
            mx: "auto",
            lineHeight: 1.6,
          }}
        >
          {title || "Handpicked essentials for a natural lifestyle"}
        </Typography>
      </Box>

      {/* Filter Bar */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="body2" sx={{ color: "#888", fontWeight: 500 }}>
          {products?.length || 0} Products
        </Typography>
        <ProdFilterModal />
      </Box>

      {/* Product Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)", // 2 items on mobile
            sm: "repeat(3, 1fr)", // 3 items on tablet
            md: "repeat(4, 1fr)", // 4 items on desktop
          },
          gap: { xs: 2, sm: 3 }, // Responsive gap
        }}
      >
        {products?.map((item, index) => (
          <Product key={item._id || index} obj={item} />
        ))}
      </Box>
    </Box>
  );
};

export default Products;