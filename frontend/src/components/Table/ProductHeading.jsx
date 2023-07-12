import { Typography, Grid, Box, Avatar, Chip } from "@mui/material";

const ProductHeading = () => {
  return (
    <Box marginX={"2rem"}>
      <Grid
        container
        sx={{
          bgcolor: "dodgerblue",
          color: "white",
          paddingY: "1rem",
          borderRadius: "10px",
          textAlign: "center",
        }}
      >
        <Grid item xs={1} alignSelf={"center"}>
          <Typography fontWeight={600}>S.no</Typography>
        </Grid>

        <Grid
          item
          xs={1}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Typography fontWeight={600}>Image</Typography>
        </Grid>

        <Grid item xs={3} alignSelf={"center"}>
          <Typography fontWeight={600}>Product</Typography>
        </Grid>

        <Grid item xs={2} alignSelf={"center"}>
          <Typography fontWeight={600}>Brand</Typography>
        </Grid>

        <Grid item xs={2} alignSelf={"center"}>
          <Typography fontWeight={600}>Category</Typography>
        </Grid>

        <Grid item xs={2} alignSelf={"center"}>
          <Typography fontWeight={600}>Price</Typography>
        </Grid>

        <Grid item xs={1} alignSelf={"center"}>
        <Typography fontWeight={600}>Delete</Typography>
        </Grid>

      </Grid>
    </Box>
  );
};

export default ProductHeading;
