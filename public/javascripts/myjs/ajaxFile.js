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
        swal("The password has been updated !", {
          icon: "success"})
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
//  fetch subcatagory from data base to add option 
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
    $("#subCatagory option[id='temporarySubCat']").remove(); // to delete existing subcatagories
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
// to add subcatagories input option 
  function addSubCatagories() {
    event.preventDefault();

      let select = document.querySelector("#subCatagory")
      var new_input="<input type='text' id='subCatagory' name='subCatagory'class='custom-form subCatagory'>";
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
// delete subcategory option 


// order more details @ admin side 
function moreDetails(orderId,userId){

 
  event.preventDefault();
console.log(orderId,userId);
  $.ajax({
    url: "/admin/orderDepthDetails",
    data: {
      orderId:orderId,
      userId:userId
    },
    method: "post",

    success: (response) => {
 

      window.location.href = '/admin/viewMoreOrderDetails'
      
    }

})
}



// cancel order 

function cancelOrder(orderId){

 
  event.preventDefault();
swal({
  title: "Are you sure?",
  text: "Once Cancelled, you will not be able to recover this Order!",
  icon: "warning",
  buttons: true,
  dangerMode: true,
})
.then((willDelete) => {
  if (willDelete) {
    swal("The orfer has been Cancelled!", {
      icon: "success"
    })
      $.ajax(
        {
        url: "/admin/cancelOrder",
        data: {
          orderId:orderId,
        },
        method: "post",
    
        success: (response) => {
          location.reload();
           }
    
    }) 
     
    }
   else
   {
    swal("action has been cancelled ");
  }
})
}


// order status update 
function orderStatus(orderId){

  let status=document.getElementById(orderId).value
  swal({
    title: "Are you sure?",
    icon: "warning",
    buttons: true,
    dangerMode: true,})
  $.ajax({
    url: "/admin/orderStatusUpdate",
    data: {
      orderId,
      status
      
    },
    method: "post",

    success: (response) => {}
  })
}

// delete catagory -- check product listed or not 
function deleteCategory(cataId){
  
  let cataName=document.getElementById(cataId).innerHTML
  swal({
    title:"are you sure " ,
    text:  " will delete the catagory ",
    icon: "warning",
    buttons: true,
    dangerMode: true})

  $.ajax({
    url:'/admin/deleteCatagory',
    data:{cataId,cataName},
    method:'post',
    success:(response)=>{
      if(response){
        swal({
          title:"There are '"+response+"' Products were listed under "+cataName,
          text:  " Clicking 'Ok' will delete the products as well as "+cataName+" Category ",
          icon: "warning",
          buttons: true,
          dangerMode: true,
         }).then((willDelete)=>{
          if(willDelete)
          deleteCatagoryWithProd(cataId,cataName);
          
        })   
      }
      else if(response==0){
        swal({
          title:"are you sure " ,
          text:  " will delete the catagory ",
          icon: "warning",
          buttons: true,
          dangerMode: true}).then((willDelete)=>{
            if(willDelete)
            deleteCatagoryWithProd(cataId,cataName)

          })
      
       
      }
      else{ 
        swal("something went wrong")
      }
    }
  })
}

// delete catagory with products 

function deleteCatagoryWithProd(cataId,cataName){
 
  $.ajax({
    
    url:'/admin/deleteCatagoryWithProd',
    data:{cataId,cataName},
    method:'post',
     success:(response)=>{
       console.log(response)
       location.reload()
   }
})
}
   
function removeSubCatagories(){
  event.preventDefault();

  var select = document.getElementById('addSubCatagory');
  select.removeChild(select.lastChild);
}

// enable catagoory edit 
function subCatachangeInput(cataName){
  event.preventDefault()

  let classname='.'+cataName
  let btnId=cataName+'btn'
  console.log(classname,'........name',cataName)
  console.log('reched at function ',cataName)
  document.querySelector(classname).removeAttribute('readonly')
  document.getElementById(cataName).style.visibility="hidden"
 
  document.getElementById(btnId).style.visibility="visible"
}

function subCatachangeUpdate(cataName,cataId){
  event.preventDefault()
  swal({
    title:"Are you sure to Change",
    text:  " Clicking 'Ok' will also update the products belogs to "+cataName,
    icon: "warning",
    buttons: true,
    dangerMode: true,
   }).then((willDelete)=>{
    if(willDelete){
      let btnId=cataName+'btn'
      let classname='.'+cataName
      console.log(classname,'class name ')
      document.getElementById(cataName).style.visibility="visible"
      //document.querySelectorAll(classname).removeAttribute('readonly') 
      $(classname).prop('readonly', true);
      document.getElementById(btnId).style.visibility="hidden"
      newCataName=document.querySelector(classname).value
      
      $.ajax({
        url:'/admin/updateSubCata',
        data:{
          cataName,cataId,newCataName
        },
    method:'post',
    success:(response)=>{
    
    }
      })
    }
   })


  
}
function mainCatachangeInput(cataName){
  event.preventDefault()

  let classname='.'+cataName
  let btnId=cataName+'btn'
  console.log(classname,'........name',cataName)
 
  document.querySelector(classname).removeAttribute('readonly')
  document.getElementById(cataName).style.visibility="hidden"
 
  document.getElementById(btnId).style.visibility="visible"
}


function mainCatachangeUpdate(cataName,cataId){
  event.preventDefault()
  swal({
    title:"Are you sure to Change",
    text:  " Clicking 'Ok' will also update the products belogs to "+cataName,
    icon: "warning",
    buttons: true,
    dangerMode: true,
   }).then((willDelete)=>{
    if(willDelete){
      let btnId=cataName+'btn'
      let classname='.'+cataName
      document.getElementById(cataName).style.visibility="visible"
      $(classname).prop('readonly', true);
      document.getElementById(btnId).style.visibility="hidden"
      newCataName=document.querySelector(classname).value
      
      $.ajax({
        url:'/admin/updateMainCata',
        data:{
          cataName,cataId,newCataName
        },
    method:'post',
    success:(response)=>{
    
    }
      })
    }
   })

  }

  function addSubCatagoriesAtEdit() {
    event.preventDefault();
      let select = document.querySelector("#subCatagory")
      var new_input="<input type='text' id='subCatagory' name='subCatagory' class='form-control w-75 mt-2'>";
      $('#addSubCatagory').append(new_input);
      document.getElementById("submit").style.visibility="visible"
    
      
   
  }


// function generateRevenueReport(){
//   let selectedYear=document.getElementById("yearSelected").value
//   swal("djbcxkmsl,",selectedYear)
//   $.ajax({
//     url:"/admin/revenueSalesReport/",
//     method:"post",
//     data:{selectedYear},
//     success:(data)=>{
//       console.log(data)
//      window.location.href="/admin/revenueSalesReport/"+data
   
//     }
//   })

// }

function addNewCatagoryOffer(catagory){
 
  swal.fire({
title: 'add offer Percentage',
html: `<input type="number" id="offerPercentage" class="swal2-input" placeholder="Offer Percentage">`,
confirmButtonText: 'Add Offer',
focusConfirm: false,
preConfirm: () => {
const offer = Swal.getPopup().querySelector('#offerPercentage').value

if (!offer) {
Swal.showValidationMessage(`Please enter valild percentage`)
}
return { offerPercentage: offerPercentage }
}
}).then((result) => {
console.log("going to upfdate offer",catagory)
$.ajax({
  url:'/admin/addCatagoryOffer',
  data:{catagory},
method:'post'
})
})

}