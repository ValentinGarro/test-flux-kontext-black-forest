import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { clothe } from "../../../types/clothe";
import { categorySchema } from "../../../schemas/category";

// Recibe el id de la categoría desde los params
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { 
    const { id: categoryId } = await params;
    
    // Leer categorías directamente del archivo (más eficiente que axios interno)
    const categoriesFilePath = path.join(process.cwd(), "src/app/api/categories.json");
    const categoriesData = await fs.readFile(categoriesFilePath, "utf-8");
    const categories = JSON.parse(categoriesData);
    
    // Buscar la categoría específica
    const category = categories.find((cat: any) => String(cat.id) === String(categoryId));
    
    if (!category) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }

    // Validar la categoría con el schema
    const validatedCategory = categorySchema.parse(category);

    // Leer productos
    const productsFilePath = path.join(process.cwd(), "src/app/api/products.json");
    const productsData = await fs.readFile(productsFilePath, "utf-8");
    const products: clothe[] = JSON.parse(productsData);
    
    // Filtrar productos por categoría y crear nuevos objetos con la categoría completa
    const filteredProducts = products
      .filter((product) => String(product.category) === String(categoryId))
      .map((product) => ({
        ...product,
        category: validatedCategory // Reemplazar el ID con el objeto completo
      })); 
    return NextResponse.json(filteredProducts);
  } catch (error) {
    console.error("Error al obtener los productos por categoría:", error);
    return NextResponse.json({ error: "No se pudieron obtener los productos" }, { status: 500 });
  }
}