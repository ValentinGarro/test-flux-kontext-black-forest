import { IncomingForm, File as FormidableFile } from 'formidable';
import fs from 'fs';
import axios from 'axios';

// Deshabilita el bodyParser de Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  // Adaptar el Request de Next.js App Router a un stream para formidable
  const form = new IncomingForm({ uploadDir: './uploads', keepExtensions: true });

  const buffer = Buffer.from(await req.arrayBuffer());
  const mockReq: any = new (require('stream').Readable)();
  mockReq.push(buffer);
  mockReq.push(null);
  mockReq.headers = Object.fromEntries(req.headers.entries());
  mockReq.method = req.method;

  return new Promise<Response>((resolve) => {
    form.parse(mockReq, async (err, fields, files) => {
      if (err) {
        resolve(new Response(JSON.stringify({ error: 'Error al procesar el formulario' }), { status: 500 }));
        return;
      }

      // Obtener prompt y archivo 
      const prompt = Array.isArray(fields.prompt) ? fields.prompt[0] : fields.prompt as string;
      const file = Array.isArray(files.imagen) ? files.imagen[0] : files.imagen as FormidableFile;
      const imagePath = file?.filepath; 
      if (!prompt || !imagePath) {
        resolve(new Response(JSON.stringify({ error: 'Faltan datos en la petición' }), { status: 400 }));
        return;
      }

      try {
        // Leer imagen y codificar en base64
        const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });

        // Enviar la imagen + prompt a Black Forest Labs
        const response = await axios.post(
          process.env.NEXT_PUBLIC_GENERETE,
          {
            prompt,
            input_image: base64Image, 
          },
          {
            headers: {
              accept: 'application/json',
              'x-key': process.env.NEXT_PUBLIC_BLACK_FOREST_API_KEY,
              'Content-Type': 'application/json',
            },
          }
        ); 
        const { id, polling_url } = response.data;

        // Polling hasta que la imagen esté lista
        let result = null;
        let status = '';

        while (status !== 'Ready') {
          await new Promise((r) => setTimeout(r, 1000)); // esperar 1s
          const poll = await axios.get(polling_url, {
            headers: {
              accept: 'application/json',
              'x-key': process.env.NEXT_PUBLIC_BLACK_FOREST_API_KEY,
            },
            params: { id },
          });
          result = poll.data;
          status = result.status;

          if (
            status === 'Error' ||
            status === 'Failed' ||
            status === 'Request Moderated'
          ) break;
        }

        // Si está lista, devolver la imagen
        if (status === 'Ready') {
          // devolver imagen
          resolve(new Response(JSON.stringify({
            imagen_generada: result.result.sample
          }), { status: 200 }));
        } else if (status === 'Request Moderated') {
          // mensaje específico de moderación
          resolve(new Response(JSON.stringify({
            error: 'La imagen fue bloqueada por moderación de contenido (Derivative Works Filter). Cambia el prompt o la imagen.'
          }), { status: 400 }));
        } else {
          // error genérico
          resolve(new Response(JSON.stringify({
            error: 'La generación falló', detalle: result
          }), { status: 500 }));
        }
      } catch (error: any) {
        console.error(error.response?.data || error.message);
        resolve(new Response(JSON.stringify({ error: 'Error generando la imagen' }), { status: 500 }));
      } finally {
        // Borrar imagen temporal
        if (imagePath && fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    });
  });
}