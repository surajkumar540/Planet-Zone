import { Box } from "@mui/material";
import Card from '@mui/material/Card';
import CardMedia from "@mui/material/CardMedia";

const Features = () => {
    return (
        <Box my='4rem'>
            <Box display='flex' justifyContent={'space-evenly'} alignItems={'center'}>
                <Box diplay='flex' justifyContent="center" alignItems='center' sx={{ textAlign: 'center', bgcolor: 'white' }} paddingY={1} borderRadius="6px" >
                    <Card sx={{ width: 199 }}>
                        <CardMedia
                            sx={{ height: 200}}
                            component="img"
                            image="https://img.freepik.com/free-vector/way-concept-illustration_114360-1191.jpg?w=740&t=st=1686113563~exp=1686114163~hmac=06ad626dcc0a17c9a9c568e74bb7a0e6c59ded77d997ee1c70ef0b164785d044"
                        />
                    </Card>
                    <Box paddingTop='10px' display='flex' justifyContent='center'>
                        <Box bgcolor='#9BABB8' color='green' fontSize="16px" borderRadius='5px' paddingX={"5px"} >
                            Free Shiping
                        </Box>
                    </Box>
                </Box>

                <Box diplay='flex' justifyContent="center" alignItems='center' sx={{ textAlign: 'center', bgcolor: 'white' }} paddingY={1} borderRadius="6px" >
                    <Card sx={{ width: 199 }}>
                        <CardMedia
                            sx={{ height: 200}}
                            component="img"
                            image="https://img.freepik.com/free-vector/order-food-concept-illustration_114360-6860.jpg?w=740&t=st=1686112710~exp=1686113310~hmac=4d837465eaf5ccadf549bafad848d87abe9f3e2ab3d674b9514a8224f5636bf7"
                        />
                    </Card>
                    <Box paddingTop='10px' display='flex' justifyContent='center'>
                        <Box bgcolor='#D7C0AE' color='green' fontSize="16px" borderRadius='5px' paddingX={"5px"} >
                            Online Order
                        </Box>
                    </Box>
                </Box>

                <Box diplay='flex' justifyContent="center" alignItems='center' sx={{ textAlign: 'center', bgcolor: 'white' }} paddingY={1} borderRadius="6px" >
                    <Card sx={{ width: 199 }}>
                        <CardMedia
                            sx={{ height: 200 }}
                            component="img"
                            image="https://img.freepik.com/free-vector/indian-rupee-investment-concept_23-2148005752.jpg?w=740&t=st=1686112884~exp=1686113484~hmac=dd72aed42e2cf6393a6f0c5be306454e143db2922f102a4292fc241719e6ecc1"
                        />
                    </Card>
                    <Box paddingTop='10px' display='flex' justifyContent='center'>
                        <Box bgcolor='#F3BCC8' color='green' fontSize="16px" borderRadius='5px' paddingX={"5px"} >
                            Save Money
                        </Box>
                    </Box>
                </Box>

                <Box diplay='flex' justifyContent="center" alignItems='center' sx={{ textAlign: 'center', bgcolor: 'white' }} paddingY={1} borderRadius="6px" >
                    <Card sx={{ width: 199 }}>
                        <CardMedia
                            sx={{ height: 200 }}
                            component="img"
                            image="https://img.freepik.com/free-vector/marketing-promotion-concept-illustration_114360-17617.jpg?w=740&t=st=1686112965~exp=1686113565~hmac=e0c9bedcd681d965f9362d800570943c293c1afa247401ade6805f8cd8b4484d"
                        />
                    </Card>
                    <Box paddingTop='10px' display='flex' justifyContent='center'>
                        <Box bgcolor='#B799FF' color='green' fontSize="16px" borderRadius='5px' paddingX={"5px"} >
                            Promotion
                        </Box>
                    </Box>
                </Box>

                <Box diplay='flex' justifyContent="center" alignItems='center' sx={{ textAlign: 'center', bgcolor: 'white' }} paddingY={1} borderRadius="6px" >
                    <Card sx={{ width: 199 }}>
                        <CardMedia
                            sx={{ height: 200}}
                            component="img"
                            image="https://img.freepik.com/free-vector/flat-hand-drawn-people-shopping-sale_52683-55361.jpg?w=740&t=st=1686113032~exp=1686113632~hmac=717b6b60295179e80030682544bb614c25ade2ff893b2a09217be4d45c52da1e"
                        />
                    </Card>
                    <Box paddingTop='10px' display='flex' justifyContent='center'>
                        <Box bgcolor='#99A98F' color='green' fontSize="16px" borderRadius='5px' paddingX={"5px"} >
                            Happy Sale
                        </Box>
                    </Box>
                </Box>
                <Box diplay='flex' justifyContent="center" alignItems='center' sx={{ textAlign: 'center', bgcolor: 'white' }} paddingY={1} borderRadius="6px" >
                    <Card sx={{ width: 199 }}>
                        <CardMedia
                            sx={{ height: 200 }}
                            component="img"
                            image="https://img.freepik.com/free-vector/service-24-7-concept-illustration_114360-7380.jpg?w=740&t=st=1686113158~exp=1686113758~hmac=8f5763b0c7a13838e5978bf5d7c46dc3e7d8c5caed34ca4e051adbb07652a1dc"
                        />
                    </Card>
                    <Box paddingTop='10px' display='flex' justifyContent='center'>
                        <Box bgcolor='#FFD966' color='green' fontSize="16px" borderRadius='5px' paddingX={"5px"} >
                            24/7 Support
                        </Box>
                    </Box>
                </Box>

            </Box>
        </Box>
    )
}
export default Features;