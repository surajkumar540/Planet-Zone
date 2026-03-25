import { Typography, Grid, Box } from "@mui/material";

const ProductHeading = () => {
  return (
    <Box 
      sx={{ 
        bgcolor: '#FAFAFA', 
        borderBottom: '1px solid #E0E0E0',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}
    >
      <Grid container sx={{ paddingY: 1.5, px: 3 }}>
        <Grid item xs={1} alignSelf="center">
          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            S.No
          </Typography>
        </Grid>

        <Grid item xs={1} display="flex" justifyContent="center" alignItems="center">
          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Image
          </Typography>
        </Grid>

        <Grid item xs={3} alignSelf="center">
          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Product Name
          </Typography>
        </Grid>

        <Grid item xs={2} alignSelf="center">
          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Brand
          </Typography>
        </Grid>
        
        <Grid item xs={2} alignSelf="center">
          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Category
          </Typography>
        </Grid>

        <Grid item xs={2} alignSelf="center">
          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Price
          </Typography>
        </Grid>

        <Grid item xs={1} alignSelf="center" textAlign="center">
          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Action
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductHeading;