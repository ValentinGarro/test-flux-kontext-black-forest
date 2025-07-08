"use client";
import { useEffect, useRef, useState } from "react"; 
import axios from "axios"; 
import Camera from "./camera";
import { showToast, SonnerSimple } from "./SonnerSimple";
import SectionButtons from "./sectionButtons";
import Loader from "./loader";  
import { Category } from "../types/category";
import Modal from "./modal";
import Carucel from "./carucel";
import { clothe } from "../types/clothe"; 
import { base64ToBlob } from "../helpers/fun";
import { CreateImg } from "../types/createImg";
import Image from "next/image";
import higthFun from "../helpers/hightFun";

export default function Home() {
    const [imgResult, setImgResult] = useState<string | null>(null);
    const [isResultLoading, setIsResultLoading] = useState<boolean>(false);
    const [data, setData] = useState<CreateImg>({model:null,clothe:null}); 
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
    const [cpActive, setCpActive] = useState<number>(0);
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
    /*Funciones de la botonera */
    const [functionPrincipal, setFunctionPrincipal] = useState<()=>void>(null);
    const [functionRevers, setFunctionRevers] = useState<()=>void | null>(null);
    const [functionNext, setFunctionNext] = useState<()=>void | null>(null);
    const [functionPrev, setFunctionPrev] = useState<()=>void | null>(null);
    /*Funcion de orden sperior*/ 
    /*Funciones principales por step */
    const funPStep0 =() => {  
        if(data.model){ //si existe la foto , la funcion es limpiar el modal 
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
                    setData({...data, model:image }); 
                    showToast("Foto tomada");  
                    setFunctionRevers(() => funRStep0);
                }
            }

        } 
    };  
    const funPStep1 = async (idx:number) => {  
        setLoader(true); 
        const selectedCategory = categories[idx]; 
        setCategorySelect(selectedCategory);
 
        setData({...data, clothe: null});
 
        const response = await axios.get(`/api/products/${selectedCategory.id}`);
        setProducts(response.data);

        setLoader(false);
        setCpActive(0);
        setStep(2); 
    };
    const funPStep2 = async (clotheToUse: clothe) => {    
        setIsResultLoading(true); 
        try { 
            const formData = new FormData();
            const base64 = data.model as string;
            const blob = base64ToBlob(base64);
            formData.append("imagen", blob, "foto.png");
            formData.append("prompt", clotheToUse.prompt);
    
            const response = await axios.post("/api/espejo-magico", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            }); 
            const { imagen_generada } = response.data;
            setImgResult(imagen_generada);   
        } catch(err) {  
            console.log(err);
            setNotification(err.response?.data?.error as string); 
        } finally {
            setTimeout(()=>{
                setIsResultLoading(false);

            },2500)
        }
    } ;
    /*Funciones revers por step */
    const funRStep0 = higthFun(setLoader,() =>{ 
        setData({...data,model:null})
        setFunctionRevers(null);
    }); 
    const funRStep1 = higthFun(setLoader,() =>{ 
        setStep(0);
        setCcActive(0);
    });
    const funRStep2 = higthFun(setLoader,() => { 
        if(data.clothe){  
            setData({...data,clothe:null});
        }else{
            setProducts(null);
            setStep(1);
            setCpActive(0);
        }
    });
    useEffect(()=>{  
        switch(step){
            case 0:
                setFunctionPrincipal(() => funPStep0);
                if(data.model) setFunctionRevers(() => funRStep0);
                setFunctionNext(null);
                setFunctionPrev(null);
                break;
            case 1:
                setFunctionPrincipal(() => ()=> funPStep1(ccActive));
                setFunctionRevers(() => funRStep1); 
               
                setFunctionNext(() => () => setCcActive(prev => (prev + 1) % categories.length));
                setFunctionPrev(() => () => setCcActive(prev => (prev - 1 + categories.length) % categories.length));
                break; 
            case 2:
                setFunctionPrincipal(() => () => {
                    const clothe = products[cpActive];
                    setData(prev => ({ ...prev, clothe }));
                    funPStep2(clothe);
                });
                setFunctionNext(() => () => setCpActive(prev => (prev + 1) % products.length));
                setFunctionPrev(() => () => setCpActive(prev => (prev - 1 + products.length) % products.length));
                setFunctionRevers(() => funRStep2);
                break;
            
        }
    },[step, categorySelect,ccActive,cpActive,data])
    // Render y lógica de activos centralizados
    const render = () => {
        // Paso 0: Cámara y modal
        if (step === 0) {
            return <Camera videoRef={videoRef} canvasRef={canvasRef} />;
        }else{
            const isStepCategory = step === 1;

            const targetProducts = isStepCategory ? categories : products;
            const targetProduct = isStepCategory ? categories[ccActive] : products[cpActive];

            return (
            <section className="w-full h-full flex flex-col items-center justify-center gap-5 pt-10 pb-30 p-5">
                <div className="flex items-center justify-center w-full h-full gap-3">
                    <div className="relative w-full h-full rounded-2xl">
                        <div className="w-full h-full relative">
                            <img
                            src={imgResult || (data.model as string)}
                            alt="img"
                            width={2000}
                            height={2000}
                            className="w-full h-full rounded-2xl"
                            />
                            <Loader show={isResultLoading} fullscreen={false}/>
                        </div>
                    </div>
                    <div className="w-[50%] h-full flex items-center justify-center">
                        <div className="bg-amber-400 flex flex-col items-center justify-start p-1 rounded-2xl w-[30vw] py-3 h-[50vw]"> 
                            {"img" in (targetProduct || {}) ? (
                                <>
                                <Image
                                    src={(targetProduct as clothe).img}
                                    alt={targetProduct.name}
                                    width={1000}
                                    height={1000}
                                    className="object-cover w-[30vw] h-[35vw] rounded-2xl mb-2"
                                />
                                <span className="w-full block text-center text-2xl font-bold text-gray-900">{targetProduct?.name}</span>
                                </>
                            ) : (
                                <span className="text-3xl font-bold text-gray-900">{targetProduct?.name}</span>
                            )}
                        </div>
                    </div>
                </div>
                <Carucel
                    title={isStepCategory
                        ? "Categorias"
                        : (targetProduct as clothe).category?.name || "Prendas"}
                    products={targetProducts}
                    active={isStepCategory ? ccActive : cpActive}
                />
            </section>
            );
        }
 
    }   
    /*Cuando se abra el modal los botones del carrucel son null */
    useEffect(() => {
        if (data.model && step === 0) {
          setFunctionNext(null);
          setFunctionPrev(null);
        } else {
          // Restaura el comportamiento normal según el paso
          switch(step){
            case 1:
              setFunctionNext(() => () => setCcActive(prev => (prev + 1) % categories.length));
              setFunctionPrev(() => () => setCcActive(prev => (prev - 1 + categories.length) % categories.length));
              break;
            case 2:
              setFunctionNext(() => () => setCpActive(prev => (prev + 1) % products.length));
              setFunctionPrev(() => () => setCpActive(prev => (prev - 1 + products.length) % products.length));
              break;
            default:
              setFunctionNext(null);
              setFunctionPrev(null);
          }
        }
      },[data, step, categories, products]);
     
    return (
        <main className="h-[100vh] w-full overflow-hidden relative bg-amber-50">
            <SonnerSimple /> 
            <Loader show={loader}/> 
            { render()}
            <SectionButtons color={step === 0 ? "white" : "gray-900"} principal={functionPrincipal} revers={functionRevers} next={functionNext} prev={functionPrev}/>   
            <Modal show={ data.model && step === 0 } img={data.model as string} />    
             
        </main>
    );
}