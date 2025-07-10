import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import axios from "axios"; 
import { z } from "zod";
import { clothesSchema } from "../../schemas/clothes";

// Schema para el array de productos
const clothesArraySchema = z.array(clothesSchema);

const PRODUCTS_PATH = path.join(process.cwd(), "src/app/api/products.json");
const WEBHOOK_URL = process.env.NEXT_PUBLIC_PROMPT_WEBHOOK!; 

export async function GET(request: Request) {
  try {
    // Leer y parsear productos con validación
    const raw = await fs.promises.readFile(PRODUCTS_PATH, "utf-8");
    const rawProducts = JSON.parse(raw);
    
    // Validar con Zod
    const products = clothesArraySchema.parse(rawProducts);
    
    console.log(`Total productos válidos: ${products.length}`);

    let updatedCount = 0;
    const updatedProducts = await Promise.all(
      products.map(async (product) => {
        // Verificar si el prompt está vacío o es solo espacios
        const needsUpdate = !product.prompt || product.prompt.trim() === "";
        
        if (needsUpdate) {
          console.log(`Actualizando producto: ${product.name}`);
          
          // Leer la imagen desde el disco y convertirla a base64
          const imgPath = path.join(process.cwd(), "public", product.img.replace(/^\//, ""));
          let base64Img = "";
          
          try {
            const imgBuffer = await fs.promises.readFile(imgPath);
            base64Img = imgBuffer.toString("base64");
          } catch (imgErr) {
            console.error(`No se pudo leer la imagen: ${imgPath}`, imgErr);
            return product; // Retornar producto sin cambios si falla la imagen
          }
          
          try {
            // Llamar al webhook con la imagen en base64
            const res = await axios.post(WEBHOOK_URL, { clothes: base64Img });
            console.log(`Respuesta webhook para ${product.name}:`, res.data);
            
            const prompt = res.data.prompt;
            if (prompt && typeof prompt === 'string') {
              updatedCount++;
              // Retornar producto actualizado con validación
              return clothesSchema.parse({
                ...product,
                prompt: prompt
              });
            }
          } catch (webhookErr) {
            console.error(`Error en webhook para ${product.name}:`, webhookErr);
          }
        }
        
        return product;
      })
    );

    // Validar productos actualizados antes de guardar
    const validatedUpdatedProducts = clothesArraySchema.parse(updatedProducts);

    // Guardar el JSON actualizado
    await fs.promises.writeFile(
      PRODUCTS_PATH, 
      JSON.stringify(validatedUpdatedProducts, null, 2), 
      "utf-8"
    );

    const result = {
      ok: true,
      updated: updatedCount,
      message: `Productos actualizados: ${updatedCount}`,
      total: products.length
    };

    console.log(result);
    return NextResponse.redirect(new URL("/", request.url), 302); 
    
  } catch (err: any) {
    console.error(err);
    
    // Manejo específico de errores de Zod
    if (err instanceof z.ZodError) {
      return NextResponse.json({ 
        ok: false, 
        error: "Error de validación en los datos",
        details: err.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      ok: false, 
      error: err.message 
    }, { status: 500 });
  }
}