// adding to cart
function addToCart(prodId) {

    $.ajax({

        url: '/addToCart/' + prodId,
        method: 'get',
        success: (response) => {
            console.log(response.status)
            if (response.status) {
                let count = $('#cartCount').html()

                count = parseInt(count) + 1

                $('#cartCount').html(count)

            } else 
                swal('Something Went wrong ')

            

        }

    })


}

// change Quantity of in cart page
function changeQuantity(cartId, prodId, userId, count) {
    event.preventDefault();

    quantity = parseInt(document.getElementById(prodId).innerHTML)
    if (quantity > 1) {
        $.ajax({
            url: '/changeProductQuantity',
            data: {
                cart: cartId,
                product: prodId,
                user: userId,
                count: count
            },
            method: 'post',
            success: (response) => {
                console.log(quantity + count)
                let cartCount = parseInt(document.getElementById("cartCount").innerHTML)
                document.getElementById("cartCount").innerHTML = cartCount + count
                document.getElementById(prodId).innerHTML = quantity + count
                document.getElementById("totalValue").innerHTML = response.total[0].total
                document.getElementById("totalMrp").innerHTML = response.total[0].mrp
                let offerPrice=document.getElementById("offerPrice"+prodId).innerHTML
                document.getElementById("subtotal"+prodId).innerHTML =parseInt(offerPrice)*parseInt(quantity + count)


            }
        })
    } else if (count == 1) {
        $.ajax({
            url: '/changeProductQuantity',
            data: {
                cart: cartId,
                product: prodId,
                user: userId,
                count: count
            },
            method: 'post',
            success: (response) => {
                console.log(response)
                console.log(quantity + count)
                let cartCount = parseInt(document.getElementById("cartCount").innerHTML)
                document.getElementById("cartCount").innerHTML = cartCount + count
                document.getElementById(prodId).innerHTML = quantity + count
                document.getElementById("totalValue").innerHTML = response.total[0].total
                document.getElementById("totalMrp").innerHTML = response.total[0].mrp
                let offerPrice=document.getElementById("offerPrice"+prodId).innerHTML
                document.getElementById("subtotal"+prodId).innerHTML =parseInt(offerPrice)*parseInt(quantity + count)

            }
        })

    }
}


// place an order from cx
$("#placeOrder").submit((event) => {
    event.preventDefault();
    
    $.ajax({
        url: "/placeOrder",
        method: "post",
        data: $("#placeOrder").serialize(),
        success: (response) => {
            if (response.cod) {
                window.location.href = '/orderPlacementSuccess/' + response.insertedId;

            } else if (response.razorPay) {
                razorpayPayment(response)
            } else if (response.payPal) {
                for (let i = 0; i < response.links.length; i++) {
                    if (response.links[i].rel === "approval_url") {
                        location.href = response.links[i].href;
                    }
                }
            }else if(response.wallet){
              console.log("reached at user side ajax")
              window.location.href = 'success/' 
            } 
            else if(response.insufficientWallet){
              window.location.href = "/checkOut"
            } 
            
            
            else {
                swal("action cancelled");
            }


        }
    });
});

function verifyPayment(payment, order) {
    console.log(payment, order)
    $.ajax({
        url: '/verifyPayments',
        data: {
            payment,
            order
        },
        method: 'post',
        success: (response) => {
            if (response.status) {
                window.location.href = '/orderPlacementSuccess/' + response.insertedId;
            } else {
                swal('Payment Failed ')
            }


        }

    })
}


// razor pay fnunction
function razorpayPayment(order) {
    console.log('razor pay reached at 2nd fn usesrside ajax 109')

    var options = {
        "key": "rzp_test_0V5jZIcqZdR0p8", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Fashion Kart",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, // This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response) {

            verifyPayment(response, order);
        },
        "prefill": {
            "name": "Fashion Kart",
            "email": "support@fk.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };

    var rzp1 = new Razorpay(options); // / for pop up
    rzp1.open();


}


// delete product from cart
function deleteProduct(prodId, userId) {

    swal({
        title: "Are you sure?",
        text: "The Item will be removed from the cart",
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then((willDelete) => {
        if (willDelete) {
            swal("the Item has been removed from cart!", {icon: "success"})

            $.ajax({

                url: '/deleteOneCarProduct',
                data: {
                    prodId: prodId,
                    userId: userId
                },
                method: 'post',
                success: (response) => {
                    console.log(response.status)
                    if (response.status) {
                   let   totalValue =  document.getElementById("totalValue").innerHTML 
                   let totalMrp=     document.getElementById("totalMrp").innerHTML 
                    let quantity= document.getElementById(prodId).innerHTML 
                   let subtotal=document.getElementById("subtotal"+prodId).innerHTML 
                   let prodMrp=document.getElementById("uniqueMrp"+prodId).innerHTML 
                        document.getElementById("totalValue").innerHTML =parseInt(totalValue)-parseInt(subtotal)
                        document.getElementById("totalMrp").innerHTML =parseInt(totalMrp)-parseInt(quantity)*parseInt(prodMrp)



                    }
                }
            })


        } else {
            swal("Something Went Wrong");
        }
    });


}
function checkCouponCode(userId, totalValue) {


    let couponCode = document.getElementById("couponCodeInput").value
    console.log(couponCode, userId, totalValue, '..................ihf')
    $.ajax({
        url: '/couponCodeCheck',
        data: {
            userId,
            couponCode
        },
        method: 'post',
        success: (couponData) => {


            if (couponData.usage) {
                swal("this coupon code is Already used")

                document.getElementById('couponDiscount').innerHTML = "not available"
                document.getElementById('finalTotal').innerHTML = totalValue

            } else if (couponData.notAvailable) {
                swal("invalid coupon code")
                document.getElementById('couponDiscount').innerHTML = "not available"
                document.getElementById('finalTotal').innerHTML = totalValue
            } else if (couponData.finalAmount) {
                swal(" coupon code is applied")

                document.getElementById('finalTotal').innerHTML = couponData.finalAmount
                document.getElementById('couponDiscount').innerHTML = couponData.offerAmountAvailable

                console.log(couponData.offerAmountAvailable, couponData.offerAmountActual, couponData.finalAmount, '..............1');
            } else {
                swal('something went wrong')
                document.getElementById('couponDiscount').innerHTML = "not available"
                document.getElementById('finalTotal').innerHTML = totalValue
            }

        }

    })

}
// to set coupon code stored as global variable into null on each refresh
function couponAppliedSetNull() {
    $.ajax({url: "/couponAppliedSetNull", method: 'post'})
}


//


function productsVeiwSubCata(subcata) {
    event.stopPropagation(); // to avoid event bubbling  idt prvents from parent event
    window.location.href = '/productsVeiwSubCata/' + subcata

}
function productsVeiwMainCata(maincata) {
    window.location.href = '/productsVeiwMainCata/' + maincata
}

function viewSavedAddresses() {
    event.preventDefault()
    window.location.href = "/viewSavedAddresses";
}
function cancelOrder(orderId) {
    swal({
        title: "Are you sure?",
        text: "The will be cancelled ",
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then((willDelete) => {
        if (willDelete) {
            $.ajax({
                url: '/cancelOrder',
                data: {
                    orderId
                },
                method: 'post',
                success: (response) => {

                    location.reload();
                }
            })

        }
    })
}

function returnOrder(orderId, userId) {
    swal({
        title: "Are you sure?",
        text: "The will be cancelled and initiate Return Process ",
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then((willDelete) => {
        if (willDelete) {
            $.ajax({
                url: "/returnOrder",
                data: {
                    orderId,
                    userId
                },
                method: 'post',
                success: (response) => {
                    swal("reched at response back at user ajax ")
                }
            })
        }
    })
}


function checkwalletAmount(wallet) {
    wallet = parseInt(wallet)
    let finalTotal = parseInt(document.getElementById("finalTotal").innerHTML)
    console.log(finalTotal, wallet)
    if (wallet < finalTotal) {
        document.getElementById('wallet').setAttribute = "disabled"
        document.getElementById('cod').checked = true
        swal("insufficient Amount please use other options")
    }
}
 function deleteAddress(addId){
$.ajax({
  url:'/deleteAddress/'+addId,
  method:'get',
  success:(response)=>{
    window.location.reload()
  }
})
 }

