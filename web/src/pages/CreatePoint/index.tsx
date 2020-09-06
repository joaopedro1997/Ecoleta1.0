import React,{useEffect,useState, ChangeEvent, FormEvent} from 'react';
import './styles.css'
import {FiArrowLeft} from 'react-icons/fi'
import api from '../../services/api'
import axios from 'axios';

import {Map, TileLayer, Marker, Popup } from 'react-leaflet';
import {LeafletMouseEvent} from 'leaflet'

import logo from '../../assets/logo.svg'
import {Link, useHistory} from 'react-router-dom';
import Axios from 'axios';
import { strict } from 'assert';

// sempre que a gente cria um estado para um array ou um objeto a gente precisa
// informar manualmenteo tipo da variavel que vai nele

  interface Item{
    id:number,
    title:string,
    image_url:string
  };


const CreatePoint = () =>{

  const [items, setItem] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]); 
  const [cities, setCities] = useState<string[]>([]);
  const [formData, serFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  })
  const [selectedUf, setSelectedUf] = useState('0'); 
  const [selectedCity, setSelectedCity] = useState('0'); 
  const [selectedPosition, setselectedPosition] = useState<[number,number]>([0,0])
  const [initialPosition, setInitialPosition] = useState<[number,number]>([0,0])
  const [selectedItems, setSelectedItems] = useState<number[]>([])

  useEffect(() => {
    api.get('items').then(response=>{
      setItem(response.data);
    })
  }, [])

 
  interface IBGEUFResponse{
    sigla: string;
  }
  interface IBGECityResponse{
    nome: string;
  }
  
  function handleMapClick(event: LeafletMouseEvent){
    setselectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ])
  }

  const history = useHistory();

  useEffect(() => {
    console.log(navigator.geolocation.getCurrentPosition(position=>{
      const {latitude, longitude} = position.coords
      setInitialPosition([latitude,longitude]);
    }))
  },[])

  useEffect(()=>{
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados/')
    .then(response=>{
      const ufinitials = response.data.map(uf => uf.sigla)

      setUfs(ufinitials);
      
    })
  })

  useEffect(() => {
    if(selectedUf==='0'){
      return
    };
    //carregar a cidades sempre que a uf mudar
    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
    .then(response=>{
      const cityNames = response.data.map(city=>city.nome)
      setCities(cityNames);
    })
  }, [selectedUf]);

  function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>){
    const uf = event.target.value;
    setSelectedUf(uf);
  }
  function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>){
    const city = event.target.value;
    setSelectedCity(city);
  }

  function handleInputChange(event:ChangeEvent<HTMLInputElement>){
      console.log(event.target.name, event.target.value)
      const{ name, value } = event.target;
      serFormData({...formData, [name]: value})
  }

  function handleSelectItem(id: number){

    const alreadySelected = selectedItems.findIndex(item => item === id);
    if(alreadySelected >=0){
      const filteredItems = selectedItems.filter(item => item != id)
      setSelectedItems(filteredItems)
      
    }else{
      setSelectedItems([...selectedItems, id])
    }

  }

  function handleSubmite(event: FormEvent){
    event.preventDefault()

    const { name, email, whatsapp} = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const items = selectedItems;
    const [latitude, longitude] = selectedPosition; 

    const data = {
      name,
      email,
      whatsapp,
      city,
      uf,
      items,
      latitude,
      longitude
    }
    api.post('points',data).then(Response=>{
      alert('Ponto de coleta salvo com sucesso')
      history.push('/')
      
    });
  }


  return(
    <div id="page-create-point">
      <header>
        <img src={logo} alt="ecoleta"/>
        <Link to="/" >
          <FiArrowLeft/>
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmite}>
        <h1>Cadastro do<br/> Ponto  de Coleta</h1>
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

            <div className="field">
              <label htmlFor="name">Nome da Entidade</label>
              <input 
                type="text"
                name="name"
                id="name"
                onChange={handleInputChange}
              /> 
            </div>
            <div className="field-group">
              <div className="field">
                <label htmlFor="email">E-mail da Entidade</label>
                <input 
                  type="email"
                  name="email"
                  id="email"
                  onChange={handleInputChange}
                /> 
              </div> 
              <div className="field">
                <label htmlFor="email">Whatsapp</label>
                <input 
                  type="number"
                  name="whatsapp"
                  id="whatsapp"
                  onChange={handleInputChange}
                /> 
              </div> 
            </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereços</h2>
            <span>Selecione um endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onclick={handleMapClick}>
            <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={selectedPosition}
            />
          </Map>

          <div className="field-group">
              <div className="field">
                <label htmlFor="uf">Estado (UF)</label>
                <select
                 name="uf" 
                 id="uf"
                 onChange={handleSelectedUf}
                 value={selectedUf}
                 > 
                  <option value="0">Selecione uma UF</option>
                  {ufs.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))} 
                </select>
              </div>
              <div className="field">
                <label htmlFor="city">Cidade </label>
                <select name="city" id="city" value={selectedCity} onChange={handleSelectedCity} >
                  <option value="0">Selecione uma cidade</option>
                  {cities.map(city=>(
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de Coleta</h2>
            <span>Selecione um ou mais ítens no abaixo</span>
          </legend>
          <ul className="items-grid">
            {items.map(item => (
              <li key={item.id} 
              onClick={ () =>handleSelectItem(item.id)}
              className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt={item.title}/>
                <span>{item.title}</span>
              </li> 
            ))}
            
          </ul>
        </fieldset>

        <button type="submit">
          Cadastrar Ponto de Coleta
        </button>
      </form>

    </div>
  )
};

export default CreatePoint;