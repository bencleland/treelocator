export async function handler(event, context) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  };

  if(event.httpMethod === "OPTIONS"){
    return { statusCode:200, headers:corsHeaders, body:"" };
  }
  try {
    if(event.httpMethod === "GET"){
      const response = await fetch("https://script.google.com/macros/s/AKfycbzShy9aPdn6Tb-gmsvm4YbJ1Hf_Q_NI0AI8Rqwxti0XiJUYt3ZS7XTcSnVYnzZSv7en/exec");
      const data = await response.text();
      return { statusCode:200, headers:{...corsHeaders,"Content-Type":"application/json"}, body:data };
    } else if(event.httpMethod === "POST"){
      const response = await fetch("https://script.google.com/macros/s/AKfycbzShy9aPdn6Tb-gmsvm4YbJ1Hf_Q_NI0AI8Rqwxti0XiJUYt3ZS7XTcSnVYnzZSv7en/exec", {
        method:"POST", body:event.body, headers:{ "Content-Type":"application/json" }
      });
      const data = await response.text();
      return { statusCode:200, headers:{...corsHeaders,"Content-Type":"application/json"}, body:data };
    }
  } catch(err){
    return { statusCode:500, headers:corsHeaders, body:JSON.stringify({error:err.message})};
  }
}
