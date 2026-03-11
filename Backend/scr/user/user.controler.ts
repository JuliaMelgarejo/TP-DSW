import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'; 
import { User } from './user.entity.js';
import { orm } from '../zshare/db/orm.js';
import jwt from 'jsonwebtoken';
import { UserRole } from '../common/enums/user-role.enum.js';
import { Person } from '../person/person.entity.js';
import { Shelter } from '../shelter/shelter.entity.js';
import { Address } from '../address/address.entity.js';

async function newUser(req: Request, res: Response) {
  const em = orm.em.fork();
  const input = req.body.sanitizedUser;
  const {username, password, role, person, shelter } = input;
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
      ...person,
      address: em.create(Address, person.address)
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
        ...shelter,
        address: em.create(Address, shelter.address)
      });
      console.log("Refugio a guardar: ", newShelter);
      
      user.shelter = newShelter;

      await em.persistAndFlush([user, newPerson, newPerson.address, newShelter, newShelter.address]);
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
      msg: 'Upps ocurrio un error' + error,
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

function sanitizeUserInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedUser = {
    username: req.body.username,
    password: req.body.password,
    role: req.body.role,
    person: req.body.person ? {
      name: req.body.person.name,
      surname: req.body.person.surname,
      doc_nro: req.body.person.doc_nro,
      doc_type: req.body.person.doc_type,
      email: req.body.person.email,
      phoneNumber: req.body.person.phoneNumber,
      birthdate: req.body.person.birthdate,
      nroCuit: req.body.person.nroCuit,
      address: {
        latitude: req.body.person.address.latitude,
        longitude: req.body.person.address.longitude,
        formattedAddress: req.body.person.address.formattedAddress,
        placeId: req.body.person.address.placeId,
        street: req.body.person.address.street,
        streetNumber: req.body.person.address.streetNumber,
        city: req.body.person.address.city,
        postalCode: req.body.person.address.postalCode,
        province: req.body.person.address.province,
        country: req.body.person.address.country,
      },
    } : undefined,
    shelter: req.body.shelter ? {
      name: req.body.shelter.name,
      phoneNumber: req.body.shelter.phoneNumber,
      tuitionVet: req.body.shelter.tuitionVet,
      max_capacity: req.body.shelter.max_capacity,
      address: {
        latitude: req.body.shelter.address.latitude,
        longitude: req.body.shelter.address.longitude,
        formattedAddress: req.body.shelter.address.formattedAddress,
        placeId: req.body.shelter.address.placeId,
        street: req.body.shelter.address.street,
        streetNumber: req.body.shelter.address.streetNumber,
        city: req.body.shelter.address.city,
        postalCode: req.body.shelter.address.postalCode,
        province: req.body.shelter.address.province,
        country: req.body.shelter.address.country,
      }
    } : undefined
  };

  if (req.body.sanitizedUser) {
    Object.keys(req.body.sanitizedUser).forEach((key) => {
      if (req.body.sanitizedUser[key] === undefined) {
        delete req.body.sanitizedUser[key];
      }
    });
  }

  next();
}

export { newUser, sanitizeUserInput }