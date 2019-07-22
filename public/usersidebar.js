  function showsidebar()
  {
      var element = document.getElementById("viewscreen");
      element.classList.toggle("toggle-pc");

      var element = document.getElementById("sidebar");
      element.classList.toggle("sidebar-width");


      var element = document.getElementById("rightview");
      element.classList.toggle("set-rightview");
  }

  function open_home_page()
  { 
      window.location = "/home"
  }

  function open_changepassword_page()
  {
      window.location ='/changepassword'
  }

  function openeditpage()
  {
    window.location = '/home'
  }

  function open_logout()
  {
    function openLogoutPage()
    {
      $.confirm({
        title: 'Confirm Logout!',
        content: 'Do you want to logout?',
        buttons: {
            Yes: {
              btnClass: 'btn-success',
              action: function(){
                window.location.replace("/logout");
              }
            },
            No: {
              btnClass: 'btn-danger'
            }
          },
        theme: 'supervan'
      });
    }
  
  }
  function open_communities_page()
  {
    window.location = '/communities'
  }
