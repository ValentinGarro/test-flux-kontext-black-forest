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
    const updatedProducts = [...products]; // Copia del array original

    // Procesar secuencialmente con for loop
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Verificar si el prompt está vacío o es solo espacios
      const needsUpdate = !product.prompt || product.prompt.trim() === "";
      
      if (needsUpdate) {
        console.log(`[${i + 1}/${products.length}] Actualizando producto: ${product.name}`);
        
        // Leer la imagen desde el disco y convertirla a base64
        const imgPath = path.join(process.cwd(), "public", product.img.replace(/^\//, ""));
        
        try {
          const imgBuffer = await fs.promises.readFile(imgPath);
          const base64Img = imgBuffer.toString("base64");
          
          try {
            // Llamar al webhook con la imagen en base64
            const res = await axios.post(WEBHOOK_URL, { 
              clothes: base64Img 
            }, {
              timeout: 60000 // 60 segundos timeout
            });
            
            console.log(`✅ Respuesta webhook para ${product.name}:`, res.data);
            
            const prompt = res.data.prompt;
            if (prompt && typeof prompt === 'string' && prompt.trim().length > 0) {
              // Actualizar el producto en el array
              updatedProducts[i] = clothesSchema.parse({
                ...product,
                prompt: prompt.trim()
              });
              updatedCount++;
              console.log(`✅ Producto ${product.name} actualizado exitosamente`);
            } else {
              console.warn(`⚠️ Prompt vacío para ${product.name}`);
            }
            
          } catch (webhookErr: any) {
            console.error(`❌ Error en webhook para ${product.name}:`, webhookErr.message);
          }
          
        } catch (imgErr) {
          console.error(`❌ No se pudo leer la imagen: ${imgPath}`, imgErr);
        }
        
        // Opcional: agregar delay entre requests para no sobrecargar
        if (i < products.length - 1) { // No hacer delay en el último
          console.log(`⏳ Esperando 2 segundos antes del siguiente...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 segundos delay
        }
      } else {
        console.log(`⏭️ [${i + 1}/${products.length}] ${product.name} ya tiene prompt, saltando...`);
      }
    }

    // Validar productos actualizados antes de guardar
    const validatedUpdatedProducts = clothesArraySchema.parse(updatedProducts);

    // Guardar el JSON actualizado SOLO al final
    await fs.promises.writeFile(
      PRODUCTS_PATH, 
      JSON.stringify(validatedUpdatedProducts, null, 2), 
      "utf-8"
    ); 

  // Calcular productos que no fueron actualizados (los que ya tenían prompt)
  const notUpdatedCount = products.length - updatedCount;
  const addedCount = 0; // Por ahora 0, puedes modificar según tu lógica
  const deletedCount = 0; // Por ahora 0, puedes modificar según tu lógica

  return NextResponse.json({
    message: `Productos actualizados: ${updatedCount}\nProductos agregados: ${addedCount}\nProductos eliminados: ${deletedCount}`,
    success: true,
    updated: updatedCount,
    added: addedCount,
    deleted: deletedCount,
    total: products.length
  }, { status: 200 });
    
  } catch (err: any) {
    console.error("❌ Error general:", err);
    
    // Manejo específico de errores de Zod
    if (err instanceof z.ZodError) {
      return NextResponse.json({  
        message: "Error de validación en los datos",
        details: err.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      ok: false, 
      error: err.message 
    }, { status: 500 });
  }
}