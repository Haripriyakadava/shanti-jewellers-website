import { Request, Response, NextFunction } from "express";
import { getCollections, getCollectionBySlug } from "./collection.service";

export const fetchCollections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = String(req.headers["x-tenant-id"]);
    const collections = await getCollections(tenantId);
    res.json({ success: true, data: collections });
  } catch (error) {
    next(error);
  }
};

export const fetchCollectionBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers["x-tenant-id"] as string;
    const slug = req.params.slug as string;
    const collection = await getCollectionBySlug(tenantId, slug);
    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found" });
    }
    res.json({ success: true, data: collection });
  } catch (error) {
    next(error);
  }
};
