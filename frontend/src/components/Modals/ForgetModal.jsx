import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import { forgetOtp } from '../../api/devApi';
import { useNavigate } from "react-router-dom"
import { useSelector } from 'react-redux';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: '5px',
    boxShadow: 24,
    p: 4,
};

export default function ForgetModal() {
    const navigate = useNavigate()
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // const emailRex = useSelector((state) => state.user.email);

    const handleSendForgetOtp = async () => {

        const dummy = {
            "email": "surajgautam56878@gmail.com"
        }


        try {
            const response = await forgetOtp(dummy);

            if (response.status) {
                navigate("/change-password");
            }

        } catch (error) {
            console.log(error)
        }
    }


    return (
        <Box>
            <Typography mt={'.3rem'} textAlign={'center'} color={'red'} sx={{ cursor: 'pointer' }} onClick={() => { handleOpen(); handleSendForgetOtp(); }}>Forgot Password ?</Typography>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2" textAlign={'center'}>
                        Forget Password
                    </Typography>

                    <Box marginTop={3} marginBottom={4}>
                        <TextField type='email' label="mail@example.com" variant="outlined" fullWidth />
                    </Box>

                    <Box textAlign='center' bgcolor={'pink'}>
                        <Button variant='contained' fullWidth onClick={() => navigate("/change-password")}>Send Otp</Button>
                    </Box>

                </Box>
            </Modal>
        </Box>
    );
}
