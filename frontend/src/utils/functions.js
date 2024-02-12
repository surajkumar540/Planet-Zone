export function getUserId(){
    return localStorage.getItem("userId")
}

export function getToken(){
    return localStorage.getItem("token")
}

export function getAdmin(){
    return localStorage.getItem("admin")
}


export function loadScript() {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
}


export function getClothes(products){
    const clothesArr=products.filter((item)=>{
        return item.category==='Clothes'
    })

    if(clothesArr.lenght>4)
    {
        clothesArr.slice(0,4)
    }else if(clothesArr.length>8)
    {
        return clothesArr(0,8);
    }else{
        return []
    }
}