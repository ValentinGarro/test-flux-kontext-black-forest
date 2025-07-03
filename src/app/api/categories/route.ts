import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { categorySchema } from "../../schemas/category";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "src/app/api/products.json");
    const data = await fs.readFile(filePath, "utf-8");
    const products = JSON.parse(data);

    // Extraer categorías únicas por id
    const categoriesMap = new Map();
    for (const product of products) {
      if (product.category && product.category.id && product.category.name) {
        if (!categoriesMap.has(product.category.id)) {
          categoriesMap.set(product.category.id, product.category);
        }
      }
    }
    const categories = Array.from(categoriesMap.values());

    // Validar con categorySchema (opcional)
    const validCategories = categories.filter(cat => {
      try {
        categorySchema.parse(cat);
        return true;
      } catch {
        return false;
      }
    });
    return NextResponse.json(validCategories);
  } catch (error) {
    return NextResponse.json({ error: "No se pudieron obtener las categorías" }, { status: 500 });
  }
} 