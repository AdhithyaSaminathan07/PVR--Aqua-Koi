const axios = require('axios');

async function testDelete() {
    try {
        // 1. Get products to find an ID
        console.log('Fetching products from port 3000...');
        const res = await axios.get('http://127.0.0.1:3000/api/products');
        console.log('Got', res.data.length, 'products');
        
        if (res.data.length === 0) {
            console.log('No products to delete. Creating one...');
            const createRes = await axios.post('http://127.0.0.1:3000/api/products', {
                name: 'Temp Product for Delete',
                price: 1,
                stock: 1,
                category: 'Temp'
            });
            res.data.push(createRes.data);
        }
        
        const id = res.data[0]._id;
        console.log('Attempting to delete ID:', id, 'via port 3000');
        
        const deleteRes = await axios.delete(`http://127.0.0.1:3000/api/products/${id}`);
        console.log('Delete Response:', deleteRes.status, deleteRes.data);
        
    } catch (err) {
        if (err.response) {
            console.error('Error status:', err.response.status);
            console.error('Error data:', err.response.data);
        } else {
            console.error('Error:', err.message);
        }
    }
}

testDelete();
