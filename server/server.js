import { app } from './app.js'; 

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('The server is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
});