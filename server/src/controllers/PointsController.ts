import knex from '../database/connection'
import { Request, Response} from 'express'


class PointsController {

  async index(request: Request, response: Response){
    // cidade, uf, items
    const { city, uf, items} = request.query;
    
    const parsedItems = String(items)
    .split(',')
    .map(item => Number(item.trim()));
    
    const points = await knex('points')
    .join('point_items','points.id','=','point_items.point_id')
    .whereIn('point_items.item_id', parsedItems)
    .where('city', String(city))
    .where('uf', String(uf))
    .distinct()
    .select('points.*')

    return response.json(points)
  }

  async show(request: Request, response: Response){
    const id =  request.params.id;

    const point  = await knex('points').where('id',id).first(); 
    
    if(!point){
      return response.status(400).json({ message: 'Point not found.' })
    }

    const items = await knex('items')
    .join('point_items', 'items.id', '=', 'point_items.item_id')
    .where('point_items.point_id', id)

    return response.json({point, items})
  };
  
  async create (request: Request, response: Response){
    const name = request.body.name
    const email = request.body.email
    const whatsapp = request.body.whatsapp
    const latitude = request.body.latitude
    const longitude = request.body.longitude
    const city = request.body.city
    const uf = request.body.uf
    const items = request.body.items
    
    const trx  = await knex.transaction();//utizalo evita que um insert n rode caso o outro falhar.
  
    const point = {
      image:'https://images.unsplash.com/photo-1556767576-5ec41e3239ea?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
      name: name,
      email: email,
      whatsapp: whatsapp,
      latitude: latitude,
      longitude: longitude,
      city: city,
      uf: uf
    }
    const insertedIds = await trx('points').insert(point);
  
    const point_id = insertedIds[0]
    
    const pointItems = items.map((item_id: Number) => {
        return {
          item_id,
          point_id
        } 
    } )
  
    await trx('point_items').insert(pointItems)
    await trx.commit();
    
    return response.json({
      ...point,
      id: point_id
    })
  }
}




export default PointsController