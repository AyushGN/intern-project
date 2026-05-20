const testOrderRoute = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/orders/my-orders');
    console.log('my-orders status:', res.status);
    const text1 = await res.text();
    console.log('my-orders response:', text1);
    
    const res2 = await fetch('http://localhost:5000/api/orders/my');
    console.log('my status:', res2.status);
    const text2 = await res2.text();
    console.log('my response:', text2);
  } catch(e) {
    console.error(e);
  }
};
testOrderRoute();
