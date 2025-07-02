"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createImgSchema } from "../../schemas/createImg";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateImg } from "../../types/createImg"; 
import InputImg from "./components/inputImg";
import Image from "next/image";
import axios from "axios";
import { clothe } from "../../types/clothe";
import InputClothes from "./components/inputClothes";

export default function Home() {
    const [model, setModel] = useState<File | null>(null);
    const [clothes, setClothes] = useState<clothe[] | null>(null);
    const [imgResult, setImgResult] = useState<string | null>(null);
    const [error, setError] = useState<string[] | null>(null); 
    const [loader, setLoader] = useState<boolean>(false);
    const form = useForm({
        resolver: zodResolver(createImgSchema),
        defaultValues: {
            model: null,
            clothe: {
                id: "0",
                name: "",
                img: "",
                prompt: "",
            },
        },
    });
    const valueClothe = form.watch("clothe");
    const {  register, handleSubmit , formState: {isSubmitting,isValid}, setValue } = form;  
    const onSubmit = async (data: CreateImg) => {
        try	{
            setLoader(true); 
            const formData = new FormData();
            formData.append("imagen", data.model); // O "model" si así lo espera el backend
            formData.append("prompt", data.clothe.prompt);

            const response = await axios.post("/api/espejo-magico", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
            }); 
            const { imagen_generada } = response.data;
            setImgResult(imagen_generada);
            setTimeout(() => {
                setLoader(false);
            }, 1000);
        }catch(err){  
            setError([err.response.data.error]);
            setTimeout(() => {
                setLoader(false);
            }, 1000);
        }
    };
    const fetchClothes = async () => {
        try {
            const response = await axios.get("/api/products"); 
            setClothes(response.data);
        }catch(err){
            setError([err.response.data.error]);
        }
    };
    useEffect(() => {
        fetchClothes();
    }, []);
    return (
        <main className="min-h-[100vh] w-full p-10 flex flex-col items-center justify-center gap-5">
            <form onSubmit={handleSubmit(onSubmit)} className="flex items-end justify-center gap-20 h-full w-full">
                <section className="flex flex-col items-center justify-center gap-5 w-full">
                    <section className="flex items-center justify-center gap-5 w-full">
                        <InputImg title="Modelo" des="Elige una foto" name="model" image={model} setImage={setModel} register={register} setValue={setValue}/>
                        <section className="flex items-center justify-center gap-5 w-full">
                            {clothes && clothes.map((clothe, i) => (
                                <InputClothes key={i} clothe={clothe} setValue={setValue} isActive={valueClothe.id === clothe.id }/>
                            ))}
                        </section>
                        
                    </section>
                    
                    <button type="submit" disabled={isSubmitting || !isValid} className="disabled:opacity-40 disabled:cursor-not-allowed bg-blue-500 text-white px-5 py-2 rounded-2xl cursor-pointer hover:bg-blue-600 transition">Probar prenda</button>
                </section>
                <div className="h-[60vh] w-1/2 mb-14 flex flex-col items-center justify-center gap-2">
                    
                    {
                        imgResult ?  <Image
                        priority 
                        src={imgResult}
                        alt="Result" 
                        width={200}
                        height={200}
                        className="rounded-2xl w-full h-full object-cover bg-amber-50/70 p-1" 
                    />: <Image
                    priority 
                    src= "/img/default.webp"
                    alt="Result" 
                    width={200}
                    height={200}
                    className="rounded-2xl w-full h-full object-cover bg-amber-50/70 p-1" 
                />
                    }
                    {loader && <p className="text-blue-500 w-full text-center text-xl">Cargando...</p>}
                    {error && error.map((e, i) => (<p className="text-red-500 w-full text-center text-xl"key={i}>{e}</p>)) }
                </div>
            </form> 
        </main>
    );
}