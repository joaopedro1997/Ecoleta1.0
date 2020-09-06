import express, { Router, json, request, response } from 'express'
import axios from 'axios';
import PointsController from './controllers/PointsController'
import ItemsController from './controllers/ItemsController';


const routes = express.Router();
const pointsController = new PointsController(); 
const itemsController = new ItemsController(); 

routes.get('/items',itemsController.index);

routes.post('/points',pointsController.create);
routes.get('/points/:id',pointsController.show);
routes.get('/points/',pointsController.index);

// index, show, create, update, delete 

// routes.get('/teste', async (request, response )=>{
  
//     const api = await axios.get('https://agendjango.herokuapp.com/api/pessoas/')
//     var api_serialize = api.data;
//     // return response.json(api_serialize);
// })

export default routes;