



function loadLineChart(){
swal('loadlinechart')
     $.ajax({
        url:'/admin/test',
       
        method:'post',
        success:(response)=>{   
    const labels = response.year

    const data = {
      labels: labels,
      datasets: [{
        label: 'Annual Revenue Graph',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: response.sum
      }]
    };
  
    const config = {
      type: 'line',
      data: data,
      options: {}
    };

    const myChart = new Chart(
      document.getElementById('myChart'),
      config
    );

  }
})

}

// get total revenue
function getRevenueData(day=7){
$.ajax({
    url:'/admin/getRevenueData',
    data:{
day
    },
method:'POST',
success:(response)=>{

let time
  if(day==365)
  time='1 Year'
  if(day==3650)
  time='10 Year'
  if(day==7) time='7 Days'
  if(day==30) time='30 Days'
  document.getElementById("totalRevenueAfterFilter").innerHTML= 'Last '+time+' : <strong>₹  '+response[0].totalAmounts+'</strong>' 

}

})
}


// get new users Data

function newUsersData(day=7){

  $.ajax({
      url:'/admin/newUsersData',
      data:{
  day
      },
  method:'POST',
  success:(response)=>{

  let time
    if(day==365)
    time='1 Year'
    if(day==3650)
    time='10 Year'
    if(day==7) time='7 Days'
    if(day==30) time='30 Days'
    document.getElementById("newUsersCount").innerHTML= 'Last '+time+' : <strong> '+response[0].usersCount+" Users </strong>"
  
  }
  
  })
  }
 
  function getCancelledOrderData(day=7){

    $.ajax({
        url:'/admin/getCancelledOrderData',
        data:{
    day
        },
    method:'POST',
    success:(response)=>{
      
    let time
      if(day==365)
      time='1 Year'
      if(day==3650)
      time='10 Year'
      if(day==7) time='7 Days'
      if(day==30) time='30 Days'
      document.getElementById("cancelledOrderCount").innerHTML= 'Last '+time+' : <strong> '+response[0].cancelledOrderCount+" Orders </strong> "              
    
    }
    
    })
    }
 
// order count 
function orderCount(day=7){

  $.ajax({
      url:'/admin/orderCount',
      data:{
  day
      },
  method:'POST',
  success:(response)=>{
  let time
    if(day==365)
    time='1 Year'
    if(day==3650)
    time='10 Year'
    if(day==7) time='7 Days'
    if(day==30) time='30 Days'
    document.getElementById("orderCountData").innerHTML= 'Last '+time+' : <strong> '+response[0].OrderCountData+" Orders </strong> "              
  
  }
  
  })
  }


  // donut chart
function loadDonutChart(){
swal('haahhuudk')
$.ajax({
  url:"/admin/loadDonutChart",
  method:'post',
  success:(data)=>{
    if(data){

    google.charts.load("current", {packages:["corechart"]});
    google.charts.setOnLoadCallback(drawChart);
    let x=parseInt( data[0].count )
    let y=parseInt( data[1].count )
    let z=parseInt( data[2].count )
    function drawChart() {
      var data = google.visualization.arrayToDataTable([
        ['Payment Method', 'Nos.'],
        ['COD',    x],
        ['PayPal',     y],
        ['RazorPay',  z],
      
      ]);

      var options = {
        title: 'Payment Method chart',
        pieHole: 0.4,
      };

      var chart = new google.visualization.PieChart(document.getElementById('donutchart'));
      chart.draw(data, options);
    }
 
  } }

  })
}


    
