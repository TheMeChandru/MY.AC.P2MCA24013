const axios = require('axios');
const userInfo = {
    email: "ramkrishna@abc.edu",
    name: "Ram Krishna",
    mobileNo:"9999999999",
    githubUsername: "github",
    rollNo: "aa1bb",
    collegeName:"ABC University",
    accessCode: "SwuuKE" 
};
axios.post("http://20.244.56.144/evaluation-service/register", userInfo).then(response =>{
    console.log(response.data);
    console.log("Registeration is successfull");
 })
 .catch(error =>{
    console.error("Registeration is failed due to issues");
    if(error.response){
        console.error(error.response.data);
    }else{
        console.error(error.message);
    }
 });

