import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 300,
    bgcolor: 'background.paper',
    borderRadius: '5px',
    boxShadow: 24,
    p: 4,
    textAlign:"center"
};

export default function DeleteModal() {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <Box>
            <Button sx={{textTransform:'capitalize'}} variant='contained' color='error' onClick={handleOpen} >Delete All</Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography fontSize="17px">
                       Are you sure want to delete all mails ?
                    </Typography>


                    <Box pt={2}  display="flex" justifyContent="center" gap={2} >
                        <Button sx={{textTransform:'capitalize',width:'50%'}} variant='outlined' onClick={handleClose}>Cancel</Button>
                        <Button sx={{textTransform:'capitalize',width:'50%'}} variant='contained' color='error' onClick={handleClose}> Delete</Button>
                    </Box>

                </Box>
            </Modal>
        </Box>
    );
}
