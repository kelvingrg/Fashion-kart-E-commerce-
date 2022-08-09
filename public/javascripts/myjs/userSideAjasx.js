

// adding to cart 
function addToCart(prodId){
    
    $.ajax({
     
        url:'/addToCart/'+prodId,
        method:'get',
        success:(response)=>{
            console.log(response.status)
            if(response.status){
                let count=$('#cartCount').html()
               
                count = parseInt(count)+1
              
                $('#cartCount').html(count)
        //         let count=document.getElementById('cartCount').value
        //  console.log(count)
        //         count = parseInt(count)+1
        //         document.getElementById('cartCount').value=count
            }
            else
            alert('Added to Cart ')
        }

    })
    
    
} 

// change Quantity of in cart page 
function changeQuantity(cartId,prodId,userId,count){
  event.preventDefault();

  quantity=parseInt(document.getElementById(prodId).innerHTML)
  if(quantity>1){
    $.ajax({
      url:'/changeProductQuantity',
      data:{
        cart: cartId,
        product:prodId,
        user:userId,
        count:count
      },
      method:'post',
      success:(response)=>{
        document.getElementById(prodId).innerHTML=quantity+count
        document.getElementById("totalValue").innerHTML=response.total[0].total
      }
    })
  }
  else if(count==1){
    $.ajax({
      url:'/changeProductQuantity',
      data:{
        cart: cartId,
        product:prodId,
        user:userId,
        count:count
      },
      method:'post',
      success:(response)=>{
        console.log(response)
        document.getElementById(prodId).innerHTML=quantity+count
        document.getElementById("totalValue").innerHTML=response.total[0].total
       
    }
    })

  }
}

$("#placeOrder").submit((event) => {
  event.preventDefault();
  alert('order Placed')
  $.ajax({
    url: "/placeOrder",
    method: "post",
    data: $("#placeOrder").serialize(),
    success: (response) => {
    
    alert('hai')
   window.location.href = '/orderHistory'
    },
  });
});


// delete product from cart 
function deleteProduct(prodId,userId){
  $.ajax({
     
    url:'/deleteOneCarProduct',
    data:{
      prodId:prodId,
      userId:userId
    },
    method:'post',
    success:(response)=>{
        console.log(response.status)
        if(response.status){

}
}
})
}