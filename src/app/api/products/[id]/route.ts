import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Recibe el id de la categoría desde los params
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try { 
    const categoryId = params.id; 
    const filePath = path.join(process.cwd(), "src/app/api/products.json");
    const data = await fs.readFile(filePath, "utf-8");
    const products = JSON.parse(data);

    // Cambia "categoryId" por el nombre real del campo en tus productos
    const filtered = products.filter((p: any) => String(p.category.id) === String(categoryId));
    return NextResponse.json(filtered);
  } catch (error) {
    return NextResponse.json({ error: "No se pudieron obtener los productos" }, { status: 500 });
  }
}