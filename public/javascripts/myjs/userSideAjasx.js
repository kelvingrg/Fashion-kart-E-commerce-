const { get } = require("jquery")

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
function changeQuantity(cartId,prodId,count){
  event.preventDefault();

  quantity=parseInt(document.getElementById(prodId).innerHTML)
  if(quantity>1){
    $.ajax({
      url:'/changeProductQuantity',
      data:{
        cart: cartId,
        product:prodId,
        count:count
      },
      method:'post',
      success:(response)=>{
        document.getElementById(prodId).innerHTML=quantity+count
    }
    })
  }
  else if(count==1){
    $.ajax({
      url:'/changeProductQuantity',
      data:{
        cart: cartId,
        product:prodId,
        count:count
      },
      method:'post',
      success:(response)=>{
        document.getElementById(prodId).innerHTML=quantity+count
    }
    })

  }
}

  