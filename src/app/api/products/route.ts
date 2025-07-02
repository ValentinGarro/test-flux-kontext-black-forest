import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "src/app/api/espejo-magico/clothes.json");
    const data = await fs.readFile(filePath, "utf-8");
    const products = JSON.parse(data);
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "No se pudieron obtener los productos" }, { status: 500 });
  }
}

