import {Request, Response} from 'express'
import bcrypt from 'bcrypt'; 
import { User } from './user.entity.js';
import { orm } from '../zshare/db/orm.js';
import jwt from 'jsonwebtoken';
import { UserRole } from '../common/enums/user-role.enum.js';
import { Person } from '../person/person.entity.js';
import { Shelter } from '../shelter/shelter.entity.js';

export const newUser = async(req: Request, res: Response) => {
  const em = orm.em.fork();
  const {username, password, role, person, shelter } = req.body;
    // Validamos si el usuario ya existe en la base de datos
  const user = await em.findOne(User, { username: username } );

  if(user) {
       return res.status(400).json({
        msg: `Ya existe un usuario con el nombre ${username}`
    })
} 

  if(Object.values(UserRole).includes(role)) {
  }
  else {
    return res.status(400).json({
      msg: `El rol ${role} no es valido`
    })
  }

  const hashedpassword = await bcrypt.hash(password, 10);
  console.log(hashedpassword);
  console.log(req.body);
  console.log(req.body.person);
  console.log(req.body.shelter);
  try{
    //validamos
    console.log("entro al try");
    console.log("Datos de usuario: ", {username, password, role });
    const user = await em.create(User, {
        username,
        password: hashedpassword, 
        role,
      });
      console.log("se creo usuario");
    const newPerson = em.create(Person, {
      ...person
    });
    console.log(newPerson);
    console.log("se creo persona");
    user.person = newPerson;
    console.log("Se asigno persona al usuario");
    
    if (role === UserRole.USER && !shelter) {
      await em.persistAndFlush([user, newPerson]);
      return res.status(201).json({
        msg: `Usuario ${username} y persona creado exitosamente!`, data:user 
      })
    } else if (role === UserRole.SHELTER && shelter) {
      const newShelter = em.create(Shelter, {
        ...shelter
      });
      console.log("Refugio a guardar: ", newShelter);
      
      user.shelter = newShelter;

      await em.persistAndFlush([user, newPerson, newShelter]);
      return res.status(201).json({
        msg: `Usuario ${username}, persona y refugio creado exitosamente!`, data:user 
      })
    }
    else if (role !== UserRole.SHELTER && shelter) {
      return res.status(400).json({
        msg: `Solo los usuarios con rol ${UserRole.SHELTER} pueden tener un refugio asociado`
      })
    }
  } catch (error) {
      res.status(400).json({
      msg: 'Upps ocurrio un error',
      error,
      person,
    })
  }
}

export const login = async(req: Request, res: Response) => {
  const em = orm.em
  const {username, password} = req.body;
  //validamos si el usuario ya existe en la base de datos
  const user = await em.findOne(User, { username: username } );

  if(!user) {
    return res.status(400).json({
        msg: `No existe un usuario con el nombre ${username} en la base datos`
    })
  }

  const passwordValid = await bcrypt.compare(password, user.password);
  console.log(passwordValid);
  
     if(!passwordValid) {
    return res.status(400).json({
        msg: `Password Incorrecta`
    })
   }

     // Generamos token
   const token = jwt.sign({
    username: username, 
    role: user.role, 
    personId : user.person?.id, 
    shelterId: user.shelter?.id
   }, process.env.SECRET_KEY || 'pepito123');
   
   res.json(token);
}