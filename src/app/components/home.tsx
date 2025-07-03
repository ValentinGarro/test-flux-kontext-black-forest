"use client";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createImgSchema } from "../schemas/createImg";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateImg } from "../types/createImg";  
import axios from "axios"; 
import Camera from "./camera";
import { showToast, SonnerSimple } from "./SonnerSimple";
import SectionButtons from "./sectionButtons";
import Loader from "./loader";  
import { Category } from "../types/category";
import Modal from "./modal";
import Carucel from "./carucel";
import { clothe } from "../types/clothe";

export default function Home() {
    const [imgResult, setImgResult] = useState<string | null>(null);
    const [error, setError] = useState<string[] | null>(null);  
    const [active, setActive] = useState<number>(0);
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
    const {setValue } = form;  
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
        }catch(err){
            setError([err.response.data.error]);
        }
    };
    useEffect(() => {
        fetchClothes();
    }, []);
    /*Loader */
    const [loader, setLoader] = useState<boolean>(false);

    /*Paso en el formulario*/
    const [step, setStep] = useState(0);

    /*Ref para la camara */
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null); 

    /*Notificaciones */
    const [notification, setNotification] = useState<string | null>(null);
    useEffect(()=>{
        if(notification){
            showToast(notification);
            setNotification(null);
        }
    },[notification]); 
    
    /*Carrucel categorias */
    const [ccActive, setCcActive] = useState<number>(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categorySelect, setCategorySelect] = useState<Category | null>(null);
    const [products, setProducts] = useState<clothe[]>([]);
    useEffect(() => {
        const fetchCategories = async () => {
            const response = await axios.get("/api/categories"); 
            setCategories(response.data);
        };
        fetchCategories();
    }, []);
    /*Carrucel productos */
    useEffect(()=>{
        const fetchProducts = async () => {
            const response = await axios.get(`/api/products/${categorySelect?.id}`);
            setProducts(response.data);
        };
        fetchProducts();    
    },[categorySelect])
    /*Funciones de la botonera */
    const [functionPrincipal, setFunctionPrincipal] = useState<()=>void>(null);
    const [functionRevers, setFunctionRevers] = useState<()=>void | null>(null);
    const [functionNext, setFunctionNext] = useState<()=>void | null>(null);
    const [functionPrev, setFunctionPrev] = useState<()=>void | null>(null);
    /*Funcion de orden sperior*/
    const higthFun = (fun:()=>void) => {
        return ()=>{
            setLoader(true);
            fun();
            setTimeout(()=>{
                setLoader(false)
            },1000)
        }
    }
    /*Funciones principales por step */
    const funPStep0 = higthFun(() => {  
        if(form.getValues("model")){ //si existe la foto , la funcion es limpiar el modal
            setShowModal(false); 
            setImgModal(null);
            setStep(1); 
        }else{ //si no existe la foto , la funcion es tomar la foto 
            
            if (videoRef.current && canvasRef.current) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const image = canvas.toDataURL("image/png");
                    setValue("model",image,{shouldValidate:true}); 
                    showToast("Foto tomada");  
                    setFunctionRevers(() => funRStep0);
                }
            }

        } 
    }); 
    const funPStep1 = higthFun(() =>{ 
        setShowModal(false); 
        setImgModal(null);
        setStep(2);  
    });
    const funPStep2 = higthFun(() => { 
        setCategorySelect(categories[ccActive]); 
    })
    /*Funciones revers por step */
    const funRStep0 = higthFun(() =>{
        setShowModal(false);
        setValue("model", null, { shouldValidate: true });
        setFunctionRevers(null);
    }); 
    const funRStep1 = higthFun(() =>{
        setShowModal(true);
        setImgModal(form.getValues("model") as string);
        setStep(0);
        setCcActive(0);
    });
    const funRStep2 = higthFun(() => {
        setStep(0);
        setCcActive(0);
        setStep(1);
    });
    useEffect(()=>{
        console.log(step)
        switch(step){
            case 0:
                setFunctionPrincipal(() => funPStep0);
                if(form.getValues("model")) setFunctionRevers(() => funRStep0);
                setFunctionNext(null);
                setFunctionPrev(null);
                break;
            case 1:
                setFunctionPrincipal(() => funPStep1);
                setFunctionRevers(() => funRStep1); 
                setFunctionNext(() => () => setCcActive(prev => (prev + 1) % categories.length));
                setFunctionPrev(() => () => setCcActive(prev => (prev - 1 + categories.length) % categories.length));
                break; 
            case 2:
                setFunctionPrincipal(() => funPStep2);  
                setFunctionRevers(() => funRStep2);  
                break; 
            
        }
    },[step])
    
    /*Render dependiendo del paso */
    const render = () => {
        switch(step){
            case 0:
                return(
                   <Camera videoRef={videoRef} canvasRef={canvasRef}/> 
                )
            case 1:
                return <Carucel  title="Categorias" active={ccActive} products={categories} />
            case 2 :
                return <Carucel  title="Prendas" active={ccActive} products={products} />
        }
    } 
    /*Modal */
    const [showModal, setShowModal] = useState<boolean>(false); 
    const [imgModal, setImgModal] = useState<string | null>(null);
    const [titleModal, setTitleModal] = useState<string | null>(null);
    useEffect(()=>{  
        const modelValue = form.watch("model");
        const clotheValue = form.watch("clothe");
    
        if (typeof modelValue === "string" && modelValue.startsWith("data:image")) {
            setImgModal(modelValue); 
            setShowModal(true); 
        } else if (clotheValue && clotheValue.img) {
            setShowModal(true);
            setImgModal(clotheValue.img);
            setTitleModal(clotheValue.name); 
        } 
    }, [form.watch("model"), form.watch("clothe")]);
    

    return (
        <main className="h-[100vh] w-full overflow-hidden relative">
            <SonnerSimple /> 
            <Loader show={loader}/> 
            { render()}
            <SectionButtons principal={functionPrincipal} revers={functionRevers} next={functionNext} prev={functionPrev}/>   
            <Modal show={showModal} img={imgModal} title={titleModal} />    
             
        </main>
    );
}