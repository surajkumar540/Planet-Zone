import { Typography, Grid, Box, Avatar, Chip, IconButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

const ProductRow = () => {
  return (
    <Box marginX={'2rem'} marginY={'1rem'}>
    <Grid container sx={{bgcolor:'whitesmoke',paddingY:'.8rem',borderRadius:"10px",textAlign:'center'}}>
      <Grid item xs={1} alignSelf={"center"}>
      <Typography>1</Typography>
      </Grid>

      <Grid item xs={1} display={"flex"} justifyContent={"center"} alignItems={"center"} bgcolor={"coral"}>
            
      </Grid>


      <Grid item xs={3} alignSelf={"center"}>
        <Typography>Iphone 11</Typography>
      </Grid>


      <Grid item xs={2} alignSelf={"center"}>
        <Typography>Apple</Typography>
      </Grid>
      
     
      <Grid item xs={2} alignSelf={"center"}>
        <Typography>
            Mobiles
        </Typography>
      </Grid>

      <Grid item xs={2} alignSelf={"center"}>
        <Typography>
            ₹12000
        </Typography>
      </Grid>
  
        <Grid item xs={1} alignSelf={"center"}>
          <IconButton sx={{color:"red"}} size="small">
            <DeleteIcon/>
          </IconButton>
        </Grid>
 
    </Grid>
    </Box>
  );
};

export default ProductRow;
