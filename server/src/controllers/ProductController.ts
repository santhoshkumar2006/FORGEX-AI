import { Request, Response } from 'express';
import { db } from '../models/DatabaseAdapter';

export class ProductController {
  public static getAll(req: Request, res: Response) {
    const products = db.getProducts();
    return res.status(200).json({
      success: true,
      products
    });
  }

  public static getById(req: Request, res: Response) {
    const { id } = req.params;
    const product = db.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${id}' not found`
      });
    }

    return res.status(200).json({
      success: true,
      product
    });
  }
}
