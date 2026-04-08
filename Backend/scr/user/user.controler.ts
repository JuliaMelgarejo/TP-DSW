import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import { User } from './user.entity.js'
import { orm } from '../zshare/db/orm.js'
import jwt from 'jsonwebtoken'
import { UserRole } from '../common/enums/user-role.enum.js'
import { Person } from '../person/person.entity.js'
import { Shelter } from '../shelter/shelter.entity.js'
import { Address } from '../address/address.entity.js'

type ValidationErrors = Record<string, string>;

function isBlank(value: any): boolean {
  return value === undefined || value === null || String(value).trim() === '';
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isStrongPassword(value: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);
}

function validateAddress(address: any, prefix: string, errors: ValidationErrors) {
  if (!address) {
    errors[prefix] = 'La dirección es obligatoria';
    return;
  }

  if (isBlank(address.latitude)) errors[`${prefix}.latitude`] = 'La latitud es obligatoria';
  if (isBlank(address.longitude)) errors[`${prefix}.longitude`] = 'La longitud es obligatoria';
  if (isBlank(address.formattedAddress)) errors[`${prefix}.formattedAddress`] = 'La dirección es obligatoria';
  if (isBlank(address.city)) errors[`${prefix}.city`] = 'La ciudad es obligatoria';
  if (isBlank(address.province)) errors[`${prefix}.province`] = 'La provincia es obligatoria';
  if (isBlank(address.country)) errors[`${prefix}.country`] = 'El país es obligatorio';
}

function validateRegistrationInput(input: any): ValidationErrors {
  const errors: ValidationErrors = {};

  if (isBlank(input?.username)) {
    errors['username'] = 'El usuario es obligatorio';
  } else if (String(input.username).trim().length < 3) {
    errors['username'] = 'El usuario debe tener al menos 3 caracteres';
  }

  if (isBlank(input?.password)) {
    errors['password'] = 'La contraseña es obligatoria';
  } else if (!isStrongPassword(String(input.password))) {
    errors['password'] = 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo';
  }

  if (!Object.values(UserRole).includes(input?.role)) {
    errors['role'] = 'El rol no es válido';
  }

  if (!input?.person) {
    errors['person'] = 'Los datos personales son obligatorios';
  } else {
    if (isBlank(input.person.name)) errors['person.name'] = 'El nombre es obligatorio';
    if (isBlank(input.person.surname)) errors['person.surname'] = 'El apellido es obligatorio';
    if (isBlank(input.person.doc_type)) errors['person.doc_type'] = 'El tipo de documento es obligatorio';
    if (isBlank(input.person.doc_nro)) errors['person.doc_nro'] = 'El número de documento es obligatorio';
    if (isBlank(input.person.birthdate)) errors['person.birthdate'] = 'La fecha de nacimiento es obligatoria';

    if (!isBlank(input.person.email) && !isValidEmail(String(input.person.email))) {
      errors['person.email'] = 'El email no es válido';
    }

    validateAddress(input.person.address, 'person.address', errors);
  }

  if (input?.role === UserRole.SHELTER) {
    if (!input?.shelter) {
      errors['shelter'] = 'Los datos del refugio son obligatorios';
    } else {
      if (isBlank(input.shelter.name)) errors['shelter.name'] = 'El nombre del refugio es obligatorio';
      if (isBlank(input.shelter.phoneNumber)) errors['shelter.phoneNumber'] = 'El teléfono del refugio es obligatorio';
      if (isBlank(input.shelter.tuitionVet)) errors['shelter.tuitionVet'] = 'La matrícula veterinaria es obligatoria';

      const maxCapacity = Number(input.shelter.max_capacity);
      if (!input.shelter.max_capacity || Number.isNaN(maxCapacity) || maxCapacity <= 0) {
        errors['shelter.max_capacity'] = 'La capacidad máxima debe ser mayor a 0';
      }

      validateAddress(input.shelter.address, 'shelter.address', errors);
    }
  }

  if (input?.role !== UserRole.SHELTER && input?.shelter) {
    errors['shelter'] = `Solo los usuarios con rol ${UserRole.SHELTER} pueden tener un refugio asociado`;
  }

  return errors;
}

async function newUser(req: Request, res: Response) {
  const em = orm.em.fork();
  const input = req.body.sanitizedUser;
  const { username, password, role, person, shelter } = input;

  const validationErrors = validateRegistrationInput(input);
  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({
      msg: 'Hay errores de validación',
      errors: validationErrors
    });
  }

  const existingUser = await em.findOne(User, { username });
  if (existingUser) {
    return res.status(400).json({
      msg: 'Hay errores de validación',
      errors: {
        username: `Ya existe un usuario con el nombre ${username}`
      }
    });
  }

  const existingPerson = await em.findOne(Person, {
    doc_type: person.doc_type,
    doc_nro: person.doc_nro
  });

  if (existingPerson) {
    return res.status(400).json({
      msg: 'Hay errores de validación',
      errors: {
        'person.doc_nro': 'Ya existe una persona con ese documento'
      }
    });
  }

  try {
    const hashedpassword = await bcrypt.hash(password, 10);

    const user = em.create(User, {
      username,
      password: hashedpassword,
      role,
    });

    const newPerson = em.create(Person, {
      ...person,
      address: em.create(Address, person.address)
    });

    user.person = newPerson;

    if (role === UserRole.USER && !shelter) {
      await em.persistAndFlush([user, newPerson, newPerson.address]);
      return res.status(201).json({
        message: `Usuario ${username} creados exitosamente`,
        data: user
      });
    }

    if (role === UserRole.SHELTER && shelter) {
      const newShelter = em.create(Shelter, {
        ...shelter,
        address: em.create(Address, shelter.address)
      });

      user.shelter = newShelter;

      await em.persistAndFlush([
        user,
        newPerson,
        newPerson.address,
        newShelter,
        newShelter.address
      ]);

      return res.status(201).json({
        message: `Usuario ${username} y refugio ${newShelter.name} creados exitosamente`,
        data: user
      });
    }

    return res.status(400).json({
      msg: 'Datos inválidos',
      errors: {
        role: 'La combinación de rol y datos enviados no es válida'
      }
    });
  } catch (error: any) {
    return res.status(400).json({
      msg: 'No se pudo crear el usuario',
      errors: {
        general: error?.message || 'Error desconocido'
      }
    });
  }
}
async function login(req: Request, res: Response){
  const em = orm.em.fork();
  const { username, password } = req.body;
  const user = await em.findOne(User, { username });
  if (!user) {
    return res.status(400).json({
      msg: `No existe un usuario con el nombre ${username} en la base de datos ${user}`
      
    });
  }

  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) {
    return res.status(400).json({
      msg: `Password incorrecta`
    });
  }

  const token = jwt.sign({
    username: username,
    role: user.role,
    personId: user.person?.id,
    shelterId: user.shelter?.id
  }, process.env.SECRET_KEY || 'pepito123');

  res.json(token);
}

async function checkUsername(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const username = String(req.params.username || '').trim();

    if (!username) {
      return res.status(400).json({
        exists: false,
        msg: 'Username requerido'
      });
    }

    const user = await em.findOne(User, { username });

    return res.status(200).json({
      exists: !!user
    });
  } catch (error: any) {
    return res.status(500).json({
      exists: false,
      msg: error.message
    });
  }
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
      address: req.body.person.address ? {
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
      } : undefined,
    } : undefined,
    shelter: req.body.shelter ? {
      name: req.body.shelter.name,
      phoneNumber: req.body.shelter.phoneNumber,
      tuitionVet: req.body.shelter.tuitionVet,
      max_capacity: req.body.shelter.max_capacity,
      address: req.body.shelter.address ? {
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
      } : undefined
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

export { newUser, sanitizeUserInput, checkUsername, login };