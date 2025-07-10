import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { categorySchema } from "../../../schemas/category";
import { Category } from "../../../types/category";

export async function GET(
  request:  NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validar que se proporcione un ID
    if (!id) {
      return NextResponse.json(
        { error: "ID de categoría es requerido" },
        { status: 400 }
      );
    }

    // Leer el archivo de categorías
    const filePath = path.join(process.cwd(), "src/app/api/categories.json");
    const data = await fs.readFile(filePath, "utf-8");
    const categories:Category[] = JSON.parse(data);

    // Buscar la categoría por ID
    const category = categories.find((cat: any) => cat.id === id);

    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    // Validar la categoría con el schema
    try {
      const validCategory = categorySchema.parse(category);
      return NextResponse.json(validCategory);
    } catch (validationError) {
      return NextResponse.json(
        { error: "Datos de categoría inválidos" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Error al obtener la categoría:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}