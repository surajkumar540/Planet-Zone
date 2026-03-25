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
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AccountMenu from '../Tools/AccountMenu';
import Badge from '@mui/material/Badge';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import SpaIcon from '@mui/icons-material/Spa';
import { alpha } from '@mui/material/styles';

const drawerWidth = 280;

// Defined navigation structure
const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Shop', path: '/shop' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

// Theme configuration for different pages
const pageTheme = {
  "/": { bg: '#3CB815', text: '#fff' },
  "/about": { bg: '#3CB815', text: '#fff' },
  "/cart": { bg: '#3CB815', text: '#fff' },
  "/profile": { bg: '#3CB815', text: '#fff' },
  "/contact": { bg: '#3CB815', text: '#fff' },
  "/login": { bg: '#38A0F0', text: '#fff' },
  "/signup": { bg: '#058F71', text: '#fff' },
  "/otp": { bg: '#F7300D', text: '#fff' },
  "/change-password": { bg: '#FF9900', text: '#fff' },
};

function Header(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isUserLogged = useSelector((state) => state?.user?.isUserLogged);
  const cartItems = useSelector((state) => state?.cart?.data || []);

  // Get current theme based on path, fallback to default green
  const currentTheme = pageTheme[location.pathname] || { bg: '#3CB815', text: '#fff' };

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  // Mobile Drawer Content
  const drawer = (
    <Box 
      onClick={handleDrawerToggle} 
      sx={{ 
        textAlign: 'center', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#faf9f7' // Organic off-white background
      }}
    >
      {/* Drawer Header */}
      <Box sx={{ py: 3, bgcolor: currentTheme.bg, color: 'white' }}>
        <SpaIcon sx={{ fontSize: 32, mb: 1 }} />
        <Typography variant="h6" fontWeight={800} letterSpacing={1}>
          PLANET
        </Typography>
      </Box>
      
      <Divider />
      
      {/* Navigation Links */}
      <List sx={{ flexGrow: 1, pt: 2 }}>
        {navLinks.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton 
              sx={{ 
                textAlign: 'center',
                py: 1.5,
                '&:hover': {
                  bgcolor: alpha(currentTheme.bg, 0.1),
                  color: currentTheme.bg
                }
              }}
              component={Link}
              to={item.path}
            >
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ fontWeight: 600, fontSize: '1rem' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        
        {/* Mobile Cart Link */}
        <ListItem disablePadding>
          <ListItemButton 
            sx={{ textAlign: 'center', py: 1.5 }}
            component={Link}
            to="/cart"
          >
            <ListItemText 
              primary={`Cart (${cartItems.length})`} 
              primaryTypographyProps={{ fontWeight: 600, fontSize: '1rem' }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Auth Buttons at Bottom */}
      <Box sx={{ p: 3, bgcolor: '#fff', borderTop: '1px solid #eee' }}>
        {!isUserLogged ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ borderColor: currentTheme.bg, color: currentTheme.bg }}
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button 
              fullWidth 
              variant="contained" 
              sx={{ bgcolor: currentTheme.bg, boxShadow: 'none', '&:hover': { bgcolor: currentTheme.bg } }}
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </Button>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Logged in successfully
          </Typography>
        )}
      </Box>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        component="nav" 
        elevation={0}
        sx={{
          bgcolor: currentTheme.bg,
          color: currentTheme.text,
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 }, px: { xs: 2, sm: 4, md: 6 } }}>
          {/* Mobile Menu Icon */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              flexGrow: { xs: 1, sm: 0 },
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              fontFamily: "'Playfair Display', serif",
            }}
          >
            <SpaIcon sx={{ fontSize: '28px' }} />
            Planet
          </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', ml: 'auto' }}>
            {/* Nav Links */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {navLinks.map((item) => (
                <Button
                  key={item.label}
                  component={Link}
                  to={item.path}
                  sx={{
                    color: 'inherit',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '15px',
                    px: 2,
                    py: 1,
                    borderRadius: '8px',
                    position: 'relative',
                    // Active indicator
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 4,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: location.pathname === item.path ? '20px' : '0px',
                      height: '3px',
                      bgcolor: 'rgba(255,255,255,0.9)',
                      borderRadius: '2px',
                      transition: 'width 0.2s ease-in-out'
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.15)',
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            {/* Cart Button */}
            <IconButton 
              component={Link} 
              to="/cart" 
              sx={{ 
                color: 'inherit', 
                ml: 1,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
              }}
            >
              <Badge 
                badgeContent={cartItems.length} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '10px',
                    height: '18px',
                    minWidth: '18px',
                    fontWeight: 700,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }
                }}
              >
                <ShoppingCartOutlinedIcon sx={{ fontSize: '22px' }} />
              </Badge>
            </IconButton>

            {/* Auth Section */}
            <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {isUserLogged ? (
                <AccountMenu />
              ) : (
                <>
                  <Button
                    variant="text"
                    onClick={() => navigate('/login')}
                    sx={{
                      color: 'inherit',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '14px',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    disableElevation
                    onClick={() => navigate('/signup')}
                    sx={{
                      bgcolor: 'white',
                      color: currentTheme.bg,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '14px',
                      px: 2.5,
                      py: 0.8,
                      borderRadius: '50px', // Pill shape
                      '&:hover': {
                        bgcolor: 'whitesmoke',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
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
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRadius: '0 16px 16px 0',
              border: 'none'
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Spacer for content */}
      <Box component="main" sx={{ display: 'none' }}>
        <Toolbar />
      </Box>
    </Box>
  );
}

export default Header;