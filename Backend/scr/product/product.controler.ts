import { Request, Response, NextFunction } from 'express';
import { Product } from './product.entity.js';
import { orm } from '../zshare/db/orm.js';
import { Price } from '../price/price.entity.js';

const em = orm.em

function sanitizeProductInput(req: Request, res: Response, next:NextFunction){
  
  req.body.sanitizedProduct = {
    name: req.body.name,
    description: req.body.description,
    stock: req.body.stock,
    crossed_out_price: req.body.crossed_out_price,
    lineItemsOrders: req.body.lineItemsOrders,
    price: req.body.price,
    category: req.body.category,
    shelter: req.body.shelter,
    photos: req.body.photos,
    id: req.body.id,
  }
  if (req.body.sanitizedProduct){
    Object.keys(req.body.sanitizedProduct).forEach((key) => {
      if (req.body.sanitizedProduct[key] === undefined) {
        delete req.body.sanitizedProduct[key]
      }
    })
  }

  next();
}

async function findAll( req: Request, res: Response ){
  try{
    const { shelterId, categoryId, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

    const where: any = {
      prices: {
        endDate: null
      }
    };

    if (shelterId){
      where.shelter = Number(shelterId);
    }

    if (categoryId){
      where.category = Number(categoryId);
    }

    const products = await em.find(Product, where, { populate: ['prices', 'category', 'shelter', 'photos'], 
      populateWhere: {
        prices: {
          endDate: null
        }
      },
    });

    let filteredProducts = products;

    if (minPrice || maxPrice) {
      filteredProducts = filteredProducts.filter(product => {
        const activePrice = product.prices[0];
        if (!activePrice) return false;
        if (minPrice && activePrice.amount < Number(minPrice)) return false;
        if (maxPrice && activePrice.amount > Number(maxPrice)) return false;
        return true;
      });
    }

    if (sort === 'price_asc') {
      filteredProducts = [...filteredProducts].sort(
        (a, b) => a.prices[0].amount - b.prices[0].amount
      );
    }

    if (sort === 'price_desc') {
      filteredProducts = [...filteredProducts].sort(
        (a, b) => b.prices[0].amount - a.prices[0].amount
      );
    }

    // Paginación
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const start = (pageNumber - 1) * limitNumber;
    const end = start + limitNumber;

    const paginatedProducts = filteredProducts.slice(start, end);

    res.status(200).json({
      message: 'filtered products',
      total: filteredProducts.length,
      page: pageNumber,
      totalPages: Math.ceil(filteredProducts.length / limitNumber),
      limit: limitNumber,
      data: paginatedProducts
    });
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function findOne( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const product = await em.findOneOrFail(Product, { id: id }, { populate: ['prices', 'category', 'shelter', 'photos'] });
    res.status(200).json({message: 'product data: ', data: product});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function add( req: Request, res: Response ){
  try{
    const input = req.body.sanitizedProduct;
    const { price, ...productData } = input;
    const product = em.create(Product, productData);

    const newPrice = em.create(Price, {
      amount: price,
      startDate: new Date(),
      product,
    });
    product.prices.add(newPrice);

    await em.flush();
    res.status(201).json({ message: 'product created', data: product });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const input = req.body.sanitizedProduct;
    const { price, ...productData } = input;
    const product = await em.findOneOrFail(Product, id, { populate: ['prices'] });
    em.assign(product, productData);

    await changePrice(product, price);

    await em.flush();
    res.status(200).json({ message: 'product updated', data: product });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const product = em.getReference(Product, id);
    await em.removeAndFlush(product);
    res.status(200).json({ message: 'product deleted', data: product });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function changePrice( product: Product, newAmount: number ){
  const activePrice = product.prices.getItems().find(price => !price.endDate);

  if (activePrice) {
    if (activePrice.amount === newAmount) {
      return;
    }

    activePrice.endDate = new Date();
  }

  const newPriceEntity = em.create(Price, {
    amount: newAmount,
    startDate: new Date(),
    product: product
  });

  console.log('New price entity created:', newPriceEntity);
  console.log('product.prices before adding new price: ', product.prices.getItems());
  product.prices.add(newPriceEntity);
  console.log('product.prices after adding new price: ', product.prices.getItems());
}

export { findAll, findOne, add, update, remove, sanitizeProductInput, changePrice }
