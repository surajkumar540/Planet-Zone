import { Typography, Grid, Box, Avatar, Chip, IconButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

const ProductRow = ({obj,sno}) => {
  return (
    <Box marginX={'2rem'} marginY={'1rem'}>
    <Grid container sx={{bgcolor:'whitesmoke',paddingY:'.8rem',borderRadius:"10px",textAlign:'center'}}>
      <Grid item xs={1} alignSelf={"center"}>
      <Typography>{sno}</Typography>
      </Grid>

      <Grid item xs={1} display={"flex"} justifyContent={"center"} alignItems={"center"} bgcolor={"coral"}>
            
      </Grid>


      <Grid item xs={3} alignSelf={"center"}>
        <Typography>{obj?.name}</Typography>
      </Grid>


      <Grid item xs={2} alignSelf={"center"}>
        <Typography>{obj?.brand}</Typography>
      </Grid>
      
     
      <Grid item xs={2} alignSelf={"center"}>
        <Typography>
            {obj?.category}
        </Typography>
      </Grid>

      <Grid item xs={2} alignSelf={"center"}>
        <Typography>
            ₹ {obj?.price}
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
