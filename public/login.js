var username=document.getElementById('username');
var password=document.getElementById("password");
var log=document.getElementById("logbtn");



log.addEventListener("click",function()
{
  if(username.value!=""&&password.value!="")
  {


    var request = new XMLHttpRequest();
      request.addEventListener('load', function()
      {
        var data=JSON.parse(request.responseText);
        console.log(data);
        if(data.length>0)
        {
          alert("sucessful");
        }
        else {
          alert("wrong username or password");
          password.value="";
        }
      });
      request.open('POST', '/log');
      request.setRequestHeader("Content-Type", "application/json");
      request.send(JSON.stringify({'username' : username.value , 'password' : password.value}));
  }
  else {
    alert("fill all the fields");
  }

});
