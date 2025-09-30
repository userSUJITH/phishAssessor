const axios = require("axios");     
const express = require("express");
const cors = require("cors");       
require("dotenv").config();
const app = express();
app.use(cors());

api_url ="https://threatfox-api.abuse.ch/api/v1/"
const API_KEY =process.env.API_KEY

app.get("/check/:inp", async (req, res) => {
  const{inp}=req.params
  try {
    const response = await axios.post(
      api_url,
      {
        query: "search_ioc",
        search_term:inp ,
      },
      {
        headers: {
          "Auth-Key": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(response.data);  
    res.json(response.data.data || []); 
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
  } finally{
   
  }
});
app.listen(5500,()=>{
  console.log("server started")
   console.log(API_KEY)
})