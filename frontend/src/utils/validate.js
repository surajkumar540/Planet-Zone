export const validateSignUpPage = (values) => {

    const errors = {};
    const passwordRegex = new RegExp("^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z].*[a-z]).{8,20}$");
    const emailRegex = new RegExp("[a-z0-9]+@[a-z]+\.[a-z]{2,3}");

    if (!values.name) {
      errors.name = "First name is required";
    }

    if (!values.email) {
      errors.email = "Email is required";
    }

    else if (!emailRegex.test(values.email)) {
      errors.email = "Enter valid email"
    }

    if (!passwordRegex.test(values.password)) {
      errors.password = "It must contain 1 capital,1 small letter,1 special sign,1 number "
    }
    if (values.password.length === 0) {
      errors.password = "Password is required";
    }
    if (values.password.length < 8 && values.password.length > 0) {
      errors.password = 'Password is too short'
    }
    if (values.password.length > 20) {
      errors.password = "Password should be 8-20 characters"
    }


    if (values.confirmPassword.length === 0) {
      errors.confirmPassword = "Confirm Password is required";
    }
    if (values.confirmPassword !== values.password) {
      errors.confirmPassword = "Confirm Password did not match";
    }

    return errors;
  }

  export const validateSignInPage = (values) => {
    const errors = {};
    const passwordRegex=new RegExp("^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z].*[a-z]).{8,20}$");
    const emailRegex=new RegExp("[a-z0-9]+@[a-z]+\.[a-z]{2,3}");

    if (!values.firstName) {
        errors.firstName = "First name is required";
    }

    if (!values.lastName){
        errors.lastName = 'Last name is required'
    }

    if (!values.email) {
        errors.email = "Email is required";
    }
    else if(!emailRegex.test(values.email))
    {
        errors.email="Enter valid email"
    }

    if(!passwordRegex.test(values.password))
    {
        errors.password="It must contain 1 capital,1 small letter,1 special sign,1 number "
    }    
    if (values.password.length === 0) {
        errors.password = "Password is required";
    }
    if(values.password.length < 8&& values.password.length>0){
        errors.password = 'Password is too short'
    }
    if(values.password.length>20)
    {
        errors.password="Password should be 8-20 characters"
    }


    return errors;
}