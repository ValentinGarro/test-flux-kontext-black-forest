import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "path";
import axios from "axios";
const fsPromises = fs.promises;
const PRODUCTS_PATH = path.join(process.cwd(), "src/app/api/products.json");
const WEBHOOK_URL = process.env.NEXT_PUBLIC_PROMPT_WEBHOOK!; 

export async function GET(request: Request) {
  try {
    // Leer productos
    const raw = await fs.readFile(PRODUCTS_PATH, "utf-8");
    const products = JSON.parse(raw);

    let updatedCount = 0;
    const updatedProducts = await Promise.all(
      products.map(async (product: any) => {
        if (!product.prompt || product.prompt.trim() === "") {
          // Leer la imagen desde el disco y convertirla a base64
          const imgPath = path.join(process.cwd(), "public", product.img.replace(/^\//, ""));
          let base64Img = "";
          try {
            const imgBuffer = await fs.readFile(imgPath);
            base64Img = imgBuffer.toString("base64");
          } catch (imgErr) {
            console.error(`No se pudo leer la imagen: ${imgPath}`, imgErr);
          }
          // Llamar al webhook con la imagen en base64
          const res = await axios.post(WEBHOOK_URL, { clothes: base64Img });
          console.log(res.data)
          const prompt = res.data.prompt;
          if (prompt) {
            product.prompt = prompt;
            updatedCount++;
          }
        }
        return product;
      })
    );

    // Guardar el JSON actualizado
    await fs.writeFile(PRODUCTS_PATH, JSON.stringify(updatedProducts, null, 2), "utf-8");

    console.log({
      ok: true,
      updated: updatedCount,
      message: `Productos actualizados: ${updatedCount}`,
    }); 
      return NextResponse.redirect(new URL("/", request.url), 302); 
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}