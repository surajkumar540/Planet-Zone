import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AccountMenu from '../Tools/AccountMenu';
import Badge from '@mui/material/Badge';

const drawerWidth = 240;
const navItems = ['Home', 'Shop','About', 'Contact',"Cart"];

const pageTheme={
  "/":"#2D4356",
  "/about":"#161A30",
  "/cart":"#163020",
  "/profile":"#3CB815",
  "/contact":"#596FB7",
  "/login":"#38A0F0",
  "/signup":"#058F71",
  "/otp":"#F7300D",
  "/change-password":"#FF9900",
}

function Header(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate=useNavigate();
  const isUserLogged=useSelector((state)=>state?.user?.isUserLogged);
  const cartItems=useSelector((state)=>state?.cart?.data)

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
      Planet
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton sx={{ textAlign: 'center' }}>
              <ListItemText primary={item}/>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar component="nav" sx={{
        boxShadow:location.pathname!=='/'&&"rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
        bgcolor:(pageTheme[location.pathname] || "#3CB815"),
        }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block'
            ,color:"white",
            textDecoration:'none'
          } }}
          component={Link} to={'/'}
          >
            Planet
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'flex' },alignItems:'center'}}>

              <Button sx={{ color: 'white',textTransform:'capitalize' }} component={Link} to={'/'}>
                Home
              </Button>

              <Button sx={{ color: 'white',textTransform:'capitalize' }} component={Link} to={'/shop'}>
                Shop
              </Button>

              <Button sx={{ color: 'white',textTransform:'capitalize' }} component={Link} to={'/about'}>
                About
              </Button>

              <Button sx={{ color: 'white',textTransform:'capitalize' }} component={Link} to={'/contact'}>
                Contact
              </Button>

              {isUserLogged&&<Button sx={{ color: 'white',textTransform:'capitalize' }} component={Link} to={'/orders'}>
                Orders
              </Button>}

              <Button sx={{ color:'white',textTransform:'capitalize',mr:'.5rem'}} component={Link} to={'/cart'} size='small'>
              <Badge
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                badgeContent={cartItems.length}
                color='primary'
              >
                
                <Typography sx={{pr:'.5rem'}}>Cart</Typography>
              </Badge>
              </Button>
            
            {
              isUserLogged?<AccountMenu/>:(
            <>
              <Button variant='contained' sx={{textTransform:'capitalize',bgcolor:'white',color:(pageTheme[location.pathname]|| "#3CB815"),'&:hover': {background: "whitesmoke"}}} onClick={()=>navigate("/login")}>Login</Button>
              <Button variant='contained' sx={{textTransform:'capitalize',bgcolor:'white',ml:'1rem',color:(pageTheme[location.pathname]|| "#3CB815"),'&:hover': {background: "whitesmoke"}}} onClick={()=>navigate("/signup")}>Sign up</Button>
            </>
            )
            
            }
            
   
            
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth},
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" >
        <Toolbar />
      </Box>
    </Box>
  );
}


export default Header;
