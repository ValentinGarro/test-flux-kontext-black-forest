"use client" 
import { useState } from "react";
import { Category } from "../types/category";
import { clothe } from "../types/clothe";
import Image from "next/image";

export default function Carucel ({ active, title, products}: { active: number , title:string, products:Category[] | clothe[]}) {
    const [props] = useState<Category[] | clothe[]>(products);
    const prev = active === 0 ? props.length - 1 : active - 1 ;
    const next = active === props.length - 1 ? 0 : active + 1 ;
    
    // Transición de slide: mueve el carrusel según el índice activo
    // Se puede mejorar con un efecto más avanzado si lo deseas
    return (
        <section className="w-full h-full bg-gray-500 flex flex-col items-center justify-center px-30 bg-amber">
            <h1 className="text-center text-7xl text-gray-800 font-bold mb-5">{title}</h1>
            <div
                className="flex items-center justify-center gap-5 relative h-[50vh]"
            >
                {props.map((c, indice) => (
                    <div
                        key={`c-${c.id}`} 
                        className={`card bg-amber-50 flex items-center justify-center h-[40vh] w-[15vw] rounded-2xl text-gray-900 text-4xl font-bold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 transition-none
                            ${indice === active ? "active-card" :  indice === prev? "prev-card" : indice === next ? "next-card" : ""}
                        `}

                    >
                       {
                        c.img ? 
                            <Image 
                                src={c.img}
                                alt={c.name}
                                width={100}
                                height={100}
                                className="w-full h-full"
                            />
                        :
                            <span>{c.name}</span>
                       } 
                    </div>
                ))}
            </div>
        </section>
    );
}