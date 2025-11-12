const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const todosRouter = require('./routes/todos');


const app = express();
const PORT = process.env.PORT || 3000;


app.use(morgan('dev')); 
app.use(express.json()); 
app.use(cors()); 
app.use(express.static('public'));


app.use('/api/todos', todosRouter);


app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
    }
    res.status(404).send('Not found');
});


app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Internal Server Error' });
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));