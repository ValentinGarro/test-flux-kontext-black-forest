import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { categorySchema } from "../../schemas/category";
import { Category } from "../../types/category";

export async function GET() {
  try {
    // Cambiar la ruta para leer el archivo de categorías
    const filePath = path.join(process.cwd(), "src/app/api/categories.json");
    const data = await fs.readFile(filePath, "utf-8");
    const categories:Category[] = JSON.parse(data);

    // Validar cada categoría con el schema
    const validCategories = categories.filter(category => {
      try {
        categorySchema.parse(category);
        return true;
      } catch {
        return false;
      }
    });

    return NextResponse.json(validCategories);
  } catch (error) {
    console.error("Error al obtener las categorías:", error);
    return NextResponse.json({ error: "No se pudieron obtener las categorías" }, { status: 500 });
  }
}