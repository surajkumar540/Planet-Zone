import { Box } from "@mui/material";
import Card from '@mui/material/Card';
import CardMedia from "@mui/material/CardMedia";

const Features = () => {
    return (
        <Box my='4rem'>
            <Box display='flex' justifyContent={'space-evenly'} alignItems={'center'}>
                
                <Box diplay='flex' justifyContent="center" alignItems='center' sx={{ textAlign: 'center', bgcolor: 'white' }} paddingY={1} borderRadius="6px" >
                    <Card>
                        <CardMedia
                            sx={{ height: 200,width:200,objectFit:"contain"}}
                            component="img"
                            image="https://img.freepik.com/free-vector/food-delivery-service-abstract-concept-illustration-online-food-order-24-7-service-pizza-sushi-online-menu-payment-options-no-contact-delivery-download-app_335657-3507.jpg?w=740&t=st=1688709596~exp=1688710196~hmac=a76a772c61df5e63e191ec749482a61bda663ed2354d53e099f1345708b93d12"
                        />
                    </Card>
                    <Box paddingTop='10px' display='flex' justifyContent='center'>
                        <Box bgcolor='#8771E8' color='white' fontSize="16px" borderRadius='5px' paddingX={"5px"} >
                            Free Shiping
                        </Box>
                    </Box>
                </Box>
        
       
                
                <Box diplay='flex' justifyContent="center" alignItems='center' sx={{ textAlign: 'center', bgcolor: 'white' }} paddingY={1} borderRadius="6px" >
                    <Card sx={{ bgcolor:'whitesmoke' }}>
                        <CardMedia
                            sx={{ height: 200,width:200,objectFit:"contain"}}
                            component="img"
                            image="https://img.freepik.com/free-vector/marketing-promotion-concept-illustration_114360-17617.jpg?w=740&t=st=1686112965~exp=1686113565~hmac=e0c9bedcd681d965f9362d800570943c293c1afa247401ade6805f8cd8b4484d"
                        />
                    </Card>
                    <Box paddingTop='10px' display='flex' justifyContent='center'>
                        <Box bgcolor='#D268CA' color='white' fontSize="16px" borderRadius='5px' paddingX={"5px"} >
                            Promotion
                        </Box>
                    </Box>
                </Box>

                        
                <Box diplay='flex' justifyContent="center" alignItems='center' sx={{ textAlign: 'center', bgcolor: 'white' }} paddingY={1} borderRadius="6px" >
                    <Card sx={{ bgcolor:'whitesmoke' }}>
                        <CardMedia
                            sx={{ height: 200,width:200,objectFit:"contain"}}
                            component="img"
                            image="https://img.freepik.com/free-vector/order-food-concept-illustration_114360-7050.jpg?w=740&t=st=1688709480~exp=1688710080~hmac=dc8a4ef131ebc16e3badaaf1f1fda1894ecab3376c8acd62dc68973995477ebb"
                        />
                    </Card>
                    <Box paddingTop='10px' display='flex' justifyContent='center'>
                        <Box bgcolor='dodgerblue' color='white' fontSize="16px" borderRadius='5px' paddingX={"5px"} >
                            Online Order
                        </Box>
                    </Box>
                </Box>

                
                <Box diplay='flex' justifyContent="center" alignItems='center' sx={{ textAlign: 'center', bgcolor: 'white' }} paddingY={1} borderRadius="6px" >
                    <Card sx={{ bgcolor:'whitesmoke' }}>
                        <CardMedia
                            sx={{ height: 200,width:200,objectFit:"contain"}}
                            component="img"
                            image="https://img.freepik.com/free-vector/sales-promotion-cartoon-web-icon-marketing-strategy-rebate-advertising-discount-offer-low-price-idea-clearance-sale-customer-attraction-vector-isolated-concept-metaphor-illustration_335657-2752.jpg?w=740&t=st=1688709760~exp=1688710360~hmac=53efa31f83ec2e024cfe5f7dc599686032bbc9aeebd5186df5cb2da94f9b3750"
                        />
                    </Card>
                    <Box paddingTop='10px' display='flex' justifyContent='center'>
                        <Box bgcolor='#FCBD5E' color='white' fontSize="16px" borderRadius='5px' paddingX={"5px"} >
                            Happy Sale
                        </Box>
                    </Box>
                </Box>



                         
                <Box diplay='flex' justifyContent="center" alignItems='center' sx={{ textAlign: 'center', bgcolor: 'white' }} paddingY={1} borderRadius="6px" >
                    <Card sx={{ bgcolor:'whitesmoke' }}>
                        <CardMedia
                            sx={{ height: 200,width:200,objectFit:"contain"}}
                            component="img"
                            image="https://img.freepik.com/free-vector/indian-rupee-investment-concept_23-2148005752.jpg?w=740&t=st=1686112884~exp=1686113484~hmac=dd72aed42e2cf6393a6f0c5be306454e143db2922f102a4292fc241719e6ecc1"
                        />
                    </Card>
                    <Box paddingTop='10px' display='flex' justifyContent='center'>
                        <Box bgcolor='#FFC201' color='white' fontSize="16px" borderRadius='5px' paddingX={"5px"} >
                            Save Money
                        </Box>
                    </Box>
                </Box>



                
                <Box diplay='flex' justifyContent="center" alignItems='center' sx={{ textAlign: 'center', bgcolor: 'white' }} paddingY={1} borderRadius="6px" >
                    <Card sx={{ bgcolor:'whitesmoke' }}>
                        <CardMedia
                            sx={{ height: 200,width:200,objectFit:"contain"}}
                            component="img"
                            image="https://img.freepik.com/free-vector/call-center-abstract-concept-vector-illustration-handling-call-system-virtual-help-center-customer-service-point-product-support-market-research-communication-software-abstract-metaphor_335657-2885.jpg?w=740&t=st=1688710148~exp=1688710748~hmac=6b4858d5d01f5a8dd6885f44c9730bdd9d593ecc85ba4a42836c50f8ce12b5d6"
                        />
                    </Card>
                    <Box paddingTop='10px' display='flex' justifyContent='center'>
                        <Box bgcolor='#9BABB8' color='white' fontSize="16px" borderRadius='5px' paddingX={"5px"} >
                            24/7 Support
                        </Box>
                    </Box>
                </Box>


            </Box>
        </Box>
    )
}
export default Features;