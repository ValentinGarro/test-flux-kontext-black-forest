"use client";

import { useEffect, useState } from "react";
import Loader from "./components/loader";
import { useRouter } from "next/navigation";

export default function Page() {
  const [title, setTitle] = useState<string>("Cargando...");
  const route = useRouter();

  const fetchClothes = async () => {
    try {
      const res = await fetch("/api/seeder");
      const data = await res.json();
      return data;
    } catch (err) {
      console.log(err);
      setTitle(err.message);
    }
  };

  useEffect(() => {
    let dotCount = 0;
    
    // Animación de puntitos
    const dotsInterval = setInterval(() => {
      dotCount = dotCount >= 3 ? 0 : dotCount + 1;
      setTitle(`Cargando ${'.'.repeat(dotCount)}`);
    }, 300);

    fetchClothes().then((data) => {
      clearInterval(dotsInterval);
      setTitle(data.message);
      setTimeout(() => {
        route.push("/inicio");
      }, 1500);
    });

    return () => clearInterval(dotsInterval);
  }, []);

  return (
    <section className={`h-screen w-full ${title.includes("Cargando") ? "pb-60 " : "pb-20"}  flex items-end justify-center bg-amber-50`}>
      <h1 
        className={`font-bold text-gray-800 text-left mx-auto text-5xl ${title.includes("Cargando") ? "w-65" : "w-full"}`} 
        dangerouslySetInnerHTML={{ 
          __html: title.replace(/\n/g, '<br> <br>') 
        }}
      />
      <Loader show={true} />
    </section>
  );
}