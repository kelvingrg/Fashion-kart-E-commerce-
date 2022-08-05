//  password reset

$("#passwordReset").submit((event) => {
  event.preventDefault();
  $.ajax({
    url: "/passwordReset",
    method: "POST",
    data: $("#passwordReset").serialize(),
    success: (response) => {
      if (response.updatepass) {
        location.href = "/myAccount";
        alert("password has been  successfully changed");
      } else {
        alert("Please enter the correct passsword ");
      }
    },
  });
});

// personal data Update

$("#personalDataUpdate").submit((event) => {
  event.preventDefault();

  $.ajax({
    url: "/personalDataUpdate",
    method: "post",
    data: $("#personalDataUpdate").serialize(),
    success: (response) => {
      if (response) {
        location.href = "/myAccount";
        alert("password has been  successfully changed");
      } else {
        alert("Please enter the correct passsword ");
      }
    },
  });
});

function callSubCatagory() {
  var cata = document.getElementById("mainCatagory").value;
  $.ajax({
    url: "/admin/getSubCatagory",
    data: {
      subCatagory: cata,
    },
    method: "post",
    success: (response) => {
    //  let temporary=document.querySelectorAll("#subCatagory")
    //   temporary.removeChild("temporarySubCat")
    $("#subCatagory option[id='temporarySubCat']").remove();
      let select = document.querySelector("#subCatagory");
      for (let i = 0; i < response.length; i++) {
        var opt = document.createElement("option");
        opt.value = response[i].subCatagory;
        opt.id="temporarySubCat"
        opt.innerHTML = response[i].subCatagory;
        select.appendChild(opt);
      }
    }
  });
}

  function addSubCatagories() {
    event.preventDefault();
  
      let select = document.querySelector("#subCatagory")
      var new_input="<input type='text' id='subCatagory' name='subCatagory'class='custom-form'>";
      $('#addSubCatagory').append(new_input);
    
      
   
  }
function navProductDetails(cataName){
  alert("password has been  successfully changed c",cataName);
 
  event.preventDefault();
  var cata = document.getElementById("navbarCatagory").value;
console.log(cata);
  $.ajax({
    url: "/admin/getCatagory",
    data: {
      catagory:cata
    },
    method: "post",
    success: (response) => {
      
    }

})
}
